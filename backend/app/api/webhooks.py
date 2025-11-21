"""GitHub webhook endpoint handler."""

import hashlib
import hmac

from fastapi import APIRouter, Header, HTTPException, Request

from app.core.config import settings

router = APIRouter()


def verify_github_signature(payload: bytes, signature: str | None) -> bool:
    """Verify GitHub webhook signature."""
    secret = settings.GITHUB_WEBHOOK_SECRET
    if not signature or not secret:
        return False

    # GitHub signature format: "sha256=<signature>"
    if not signature.startswith("sha256="):
        return False

    expected_signature = "sha256=" + hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()

    return hmac.compare_digest(signature, expected_signature)


@router.post("/github")
async def github_webhook(
    request: Request,
    x_hub_signature_256: str | None = Header(None),
    x_github_event: str = Header(...),
) -> dict[str, str]:
    """Handle GitHub webhook events."""
    # Get raw payload for signature verification
    payload = await request.body()

    # Verify webhook signature
    if not verify_github_signature(payload, x_hub_signature_256):
        raise HTTPException(status_code=401, detail="Invalid signature")

    # Parse the JSON payload
    data = await request.json()

    print("--------------------------------")
    print("X-Github-Event: \n", x_github_event)
    print("X-Hub-Signature-256: \n", x_hub_signature_256)
    print("Data: \n", data)
    print("--------------------------------")

    # Handle different event types
    if x_github_event == "ping":
        return {"status": "pong"}

    if x_github_event == "pull_request":
        action = data.get("action")
        pr_number = data.get("pull_request", {}).get("number")
        repo_name = data.get("repository", {}).get("full_name")

        if action in ["opened", "synchronize", "reopened"]:
            # TODO: Trigger AI review for this PR
            print(f"PR #{pr_number} {action} in {repo_name}")
            return {"status": "accepted", "action": f"review_queued_for_pr_{pr_number}"}

        return {"status": "ignored", "reason": f"action_{action}_not_handled"}

    if x_github_event == "installation":
        action = data.get("action")
        installation_id = data.get("installation", {}).get("id")
        print(f"Installation {action}: {installation_id}")
        return {"status": "accepted", "action": f"installation_{action}"}

    return {"status": "ignored", "reason": f"event_{x_github_event}_not_handled"}
