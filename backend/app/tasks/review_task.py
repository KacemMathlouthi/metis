"""Background tasks for PR review processing.

Contains the main async task that processes pull request reviews
with retry logic and database status tracking.
"""

import asyncio
from datetime import datetime, timezone
from uuid import UUID

from celery.exceptions import SoftTimeLimitExceeded

from app.core.celery_app import BaseTask, celery_app
from app.db.session import AsyncSessionLocal
from app.repositories.review import ReviewRepository
from app.services.github import GitHubService
from app.services.metis_agent import MetisAgent


@celery_app.task(
    bind=True,
    base=BaseTask,
    name="tasks.process_pr_review",
    time_limit=600,  # 10 minutes hard limit
    soft_time_limit=540,  # 9 minutes soft limit
)
def process_pr_review(
    self,
    review_id: str,
    installation_id: int,
    repository: str,
    pr_number: int,
) -> dict:
    """Process PR review asynchronously (Celery entry point)."""
    return asyncio.run(
        _process_pr_review_async(self, review_id, installation_id, repository, pr_number)
    )


async def _process_pr_review_async(
    task_self,
    review_id: str,
    installation_id: int,
    repository: str,
    pr_number: int,
) -> dict:
    """Process PR review asynchronously.

    Args:
        review_id: UUID of Review record in database
        installation_id: GitHub installation ID
        repository: Repository full name (owner/repo)
        pr_number: Pull request number

    Returns:
        dict with status, review_id, and processing time

    Raises:
        SoftTimeLimitExceeded: If task exceeds 9 minutes (warning)

    This task:
    1. Updates Review status to PROCESSING
    2. Fetches PR diff from GitHub
    3. Generates AI review
    4. Posts review to GitHub
    5. Updates Review status to COMPLETED

    On failure, automatically retries up to 3 times with exponential backoff.
    """
    start_time = datetime.now(timezone.utc)

    async with AsyncSessionLocal() as db:
        try:
            # Step 1: Load Review from database
            review_repo = ReviewRepository()
            review = await review_repo.get_by_id(db, UUID(review_id))

            if not review:
                raise ValueError(f"Review {review_id} not found in database")

            # Step 2: Update status to PROCESSING
            review.status = "PROCESSING"
            review.started_at = start_time
            await db.commit()

            # Step 3: Fetch PR diff from GitHub
            github = GitHubService()
            owner, repo = repository.split("/")
            print(f"Fetching diff for {repository}#{pr_number}")
            diff = await github.get_pr_diff(owner, repo, pr_number, installation_id)

            # Step 4: Generate AI review
            agent = MetisAgent()
            context = {
                "title": review.pr_metadata.get("title", ""),
                "description": review.pr_metadata.get("description", ""),
            }
            review_text = await agent.review_pr(diff=diff, context=context)

            # Step 5: Post review to GitHub
            await github.create_pr_review(
                owner=owner,
                repo=repo,
                pr_number=pr_number,
                review_body=review_text,
                installation_id=installation_id,
            )

            # Step 6: Update Review record
            review.status = "COMPLETED"
            review.completed_at = datetime.now(timezone.utc)
            review.review_text = review_text

            await db.commit()

            duration = (datetime.now(timezone.utc) - start_time).total_seconds()

            return {
                "status": "success",
                "review_id": review_id,
                "duration_seconds": duration,
            }

        except SoftTimeLimitExceeded:
            print(f"Task {task_self.request.id} approaching time limit, wrapping up...")

            review.status = "FAILED"
            review.error = "Task exceeded time limit (9 minutes)"
            await db.commit()

            raise  # Re-raise to trigger retry

        except Exception as e:
            review.status = "FAILED"
            review.error = str(e)
            await db.commit()

            raise
