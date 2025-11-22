"""GitHub webhook endpoint handler."""

from fastapi import APIRouter, Header, HTTPException, Request

from app.services.webhook import (
    handle_other_event,
    handle_ping,
    handle_pull_request,
    verify_github_signature,
)

router = APIRouter()


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
        raise HTTPException(status_code=401, detail="Invalid Webhook Signature")

    # Parse the JSON payload
    data = await request.json()

    # Handle different event types
    match x_github_event:
        case "ping":
            return handle_ping()
        case "pull_request":
            return await handle_pull_request(data)
        case _:
            return handle_other_event(x_github_event)
