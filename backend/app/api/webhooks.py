"""GitHub webhook endpoint handler."""

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
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
    db: AsyncSession = Depends(get_db),
) -> JSONResponse:
    """Handle GitHub webhook events with async task processing."""
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
            result = handle_ping()
            return JSONResponse(content=result, status_code=200)

        case "pull_request":
            result = await handle_pull_request(
                action=data["action"],
                pull_request=data["pull_request"],
                repository=data["repository"],
                installation=data["installation"],
                db=db,
            )
            # Return 202 Accepted for async processing
            return JSONResponse(content=result, status_code=202)

        case _:
            result = handle_other_event(x_github_event)
            return JSONResponse(content=result, status_code=200)
