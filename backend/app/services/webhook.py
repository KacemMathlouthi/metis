"""GitHub webhook service handlers.

This module contains functions to verify and handle GitHub webhook events,
including signature verification, pull request processing, and event routing.
"""

import hashlib
import hmac

from app.core.config import settings
from app.services.github import github_service


def verify_github_signature(payload: bytes, signature: str | None) -> bool:
    """Verify GitHub webhook signature."""
    secret = settings.GITHUB_WEBHOOK_SECRET
    # GitHub signature format: "sha256=<signature>"
    if not signature or not secret or not signature.startswith("sha256="):
        return False
    expected_signature = "sha256=" + hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(signature, expected_signature)


async def handle_pull_request(data: dict) -> dict[str, str]:
    """Handle pull request event."""
    action = data.get("action")
    pr_number = data.get("pull_request", {}).get("number")

    repo_name = data.get("repository", {}).get("full_name")
    owner_name, repo_name = repo_name.split("/")

    if action in ["opened", "synchronize", "reopened"]:
        result = await github_service.create_pr_review(
            owner=owner_name,
            repo=repo_name,
            pr_number=pr_number,
            review_body="Hello 🚬",
            installation_id=settings.GITHUB_INSTALLATION_ID,
        )

        return {
            "status": "OK",
            "response": f"Review has been sumitted to PR {pr_number} at {owner_name}/{repo_name}",
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
