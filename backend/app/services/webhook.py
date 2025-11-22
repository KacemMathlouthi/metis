"""GitHub webhook service handlers.

This module contains functions to verify and handle GitHub webhook events,
including signature verification, pull request processing, and event routing.
"""

import hashlib
import hmac

from app.core.config import settings


def verify_github_signature(payload: bytes, signature: str | None) -> bool:
    """Verify GitHub webhook signature."""
    secret = settings.GITHUB_WEBHOOK_SECRET
    # GitHub signature format: "sha256=<signature>"
    if not signature or not secret or not signature.startswith("sha256="):
        return False
    expected_signature = "sha256=" + hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(signature, expected_signature)


def handle_pull_request(data: dict) -> dict[str, str]:
    """Handle pull request event."""
    action = data.get("action")
    pr_number = data.get("pull_request", {}).get("number")
    repo_name = data.get("repository", {}).get("full_name")

    if action in ["opened", "synchronize", "reopened"]:
        # TODO: Trigger AI review for this PR
        print(f"PR #{pr_number} {action} in {repo_name}")
        return {"status": "accepted", "action": f"review_queued_for_pr_{pr_number}"}

    return {"status": "ignored", "reason": f"action_{action}_not_handled"}


def handle_ping() -> dict[str, str]:
    """Handle ping event."""
    return {"status": "OK", "response": "ping"}


def handle_other_event(x_github_event: str) -> dict[str, str]:
    """Handle unknown event."""
    return {"status": "OK", "response": f"event_{x_github_event}_not_handled"}
