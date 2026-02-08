"""GitHub webhook service handlers with async task dispatching.

This module contains functions to verify and handle GitHub webhook events.
Webhook handlers queue Celery tasks for async processing.
"""

import hashlib
import hmac

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.installation import Installation
from app.repositories.review import ReviewRepository
from app.tasks.agent_review_task import process_pr_review_with_agent
from app.tasks.summary_task import process_pr_summary_with_agent


def verify_github_signature(payload: bytes, signature: str | None) -> bool:
    """Verify GitHub webhook signature."""
    secret = settings.GITHUB_WEBHOOK_SECRET
    # GitHub signature format: "sha256=<signature>"
    if not signature or not secret or not signature.startswith("sha256="):
        return False
    expected_signature = (
        "sha256=" + hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    )
    return hmac.compare_digest(signature, expected_signature)


async def handle_pull_request(
    action: str,
    pull_request: dict,
    repository: dict,
    installation: dict,
    db: AsyncSession,
) -> dict:
    """Handle pull_request webhook events by queueing async tasks.

    1. Create Review record (PENDING)
    2. Queue Celery task
    3. Return immediately (<500ms)

    Args:
        action: PR action (opened, synchronize, reopened)
        pull_request: PR data from webhook
        repository: Repository data from webhook
        installation: Installation data from webhook
        db: Database session

    Returns:
        dict with status, task_id, and review_id
    """
    # Only process on PR opened, synchronized, or reopened
    if action not in ("opened", "synchronize", "reopened"):
        return {"status": "ignored", "reason": f"Action '{action}' not handled"}

    # Extract data
    github_installation_id = installation["id"]  # GitHub's installation ID
    repo_full_name = repository["full_name"]
    pr_number = pull_request["number"]
    commit_sha = pull_request["head"]["sha"]

    # Look up Installation record by BOTH github_installation_id AND repository
    # (one installation can have multiple repos)
    installation_query = await db.execute(
        select(Installation).where(
            and_(
                Installation.github_installation_id == github_installation_id,
                Installation.repository == repo_full_name,
            )
        )
    )
    installation_record = installation_query.scalar_one_or_none()

    if not installation_record:
        # Installation not found - user hasn't enrolled this repo yet
        return {
            "status": "ignored",
            "reason": f"Installation {github_installation_id} not found. Repository not enrolled.",
        }

    # Create Review record in PENDING state FIRST (to get review_id)
    review_repo = ReviewRepository()
    review = await review_repo.create(
        db=db,
        installation_id=installation_record.id,  # Use UUID from Installation table
        repository=repo_full_name,
        pr_number=pr_number,
        commit_sha=commit_sha,
        metadata={
            "title": pull_request["title"],
            "author": pull_request["user"]["login"],
            "url": pull_request["html_url"],
            "head_branch": pull_request["head"]["ref"],
            "base_branch": pull_request["base"]["ref"],
            "language": pull_request["head"]["repo"]["language"],
        },
    )
    # Commit review before queueing to prevent worker race on uncommitted row.
    await db.commit()

    # Queue Celery task with AI agent (returns immediately)
    task = process_pr_review_with_agent.delay(
        review_id=str(review.id),
        installation_id=github_installation_id,  # Pass GitHub's integer ID to worker
        repository=repo_full_name,
        pr_number=pr_number,
    )

    summary_task = process_pr_summary_with_agent.delay(
        review_id=str(review.id),
        installation_id=github_installation_id,
        repository=repo_full_name,
        pr_number=pr_number,
        mode="append",
    )

    # Update review with Celery task IDs
    review.celery_task_id = task.id
    review.pr_metadata = {
        **(review.pr_metadata or {}),
        "summary_task_id": summary_task.id,
        "summary_status": "QUEUED",
        "summary_mode": "append",
    }
    await db.commit()

    return {
        "status": "accepted",
        "message": f"Review queued for PR #{pr_number}",
        "task_id": task.id,
        "summary_task_id": summary_task.id,
        "review_id": str(review.id),
    }


def handle_ping() -> dict[str, str]:
    """Handle ping event."""
    return {"status": "OK", "response": "ping"}


def handle_other_event(x_github_event: str) -> dict[str, str]:
    """Handle unknown event."""
    return {"status": "OK", "response": f"event_{x_github_event}_not_handled"}
