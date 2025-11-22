"""GitHub webhook service handlers.

This module contains functions to verify and handle GitHub webhook events,
including signature verification, pull request processing, and event routing.
"""

import hashlib
import hmac
from typing import Any

from app.core.config import settings
from app.schemas.metis_config import ReviewerConfig, SensitivityLevel
from app.services.github import github_service
from app.services.metis_agent import MetisAgent


def verify_github_signature(payload: bytes, signature: str | None) -> bool:
    """Verify GitHub webhook signature."""
    secret = settings.GITHUB_WEBHOOK_SECRET
    # GitHub signature format: "sha256=<signature>"
    if not signature or not secret or not signature.startswith("sha256="):
        return False
    expected_signature = "sha256=" + hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(signature, expected_signature)


async def handle_pull_request(data: dict[str, Any]) -> dict[str, str]:
    """Handle pull request event."""
    action = data.get("action")
    pr_data = data.get("pull_request", {})
    pr_number = pr_data.get("number")
    pr_title = pr_data.get("title", "")
    pr_description = pr_data.get("body", "")

    repo_full_name = data.get("repository", {}).get("full_name")
    owner_name, repo_name = repo_full_name.split("/")

    if action in ["opened", "synchronize", "reopened"]:
        # Fetch PR diff
        diff = await github_service.get_pr_diff(
            owner=owner_name,
            repo=repo_name,
            pr_number=pr_number,
            installation_id=settings.GITHUB_INSTALLATION_ID,
        )

        # Initialize Metis agent with config
        agent = MetisAgent(
            reviewer_config=ReviewerConfig(
                sensitivity=SensitivityLevel.MEDIUM,
                user_instructions="",
                temperature=0.1,
                max_tokens=8192,
            )
        )

        # Generate AI review
        review_text = await agent.review_pr(
            diff=diff,
            context={"title": pr_title, "description": pr_description},
        )

        # Post review to GitHub
        result = await github_service.create_pr_review(
            owner=owner_name,
            repo=repo_name,
            pr_number=pr_number,
            review_body=review_text,
            installation_id=settings.GITHUB_INSTALLATION_ID,
        )

        return {
            "status": "OK",
            "response": f"AI review submitted to PR {pr_number} at {owner_name}/{repo_name}",
            "comment_url": str(result.get("html_url")),
            "comment_id": str(result.get("id")),
        }

    return {"status": "ignored", "response": f"action_{action}_not_handled"}


def handle_ping() -> dict[str, str]:
    """Handle ping event."""
    return {"status": "OK", "response": "ping"}


def handle_other_event(x_github_event: str) -> dict[str, str]:
    """Handle unknown event."""
    return {"status": "OK", "response": f"event_{x_github_event}_not_handled"}
