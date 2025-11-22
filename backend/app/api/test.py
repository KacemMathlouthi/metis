"""Test endpoints for GitHub integration."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.github import github_service

router = APIRouter()


class TestPRCommentRequest(BaseModel):
    """Request model for test PR comment."""

    owner: str
    repo: str
    pr_number: int
    installation_id: int


@router.post("/pr-comment")
async def test_pr_comment(request: TestPRCommentRequest) -> dict:
    """Test endpoint to post a review on a PR.

    Args:
        request: PR details

    Returns:
        Success status and comment URL
    """
    # Mock test message for now
    message = """## Metis AI Code Reviewer
Hello! This is a my first message ever. Ping pong world.

![image](https://i.imgur.com/u7cxJwx.png)
"""

    try:
        result = await github_service.create_pr_review(
            owner=request.owner,
            repo=request.repo,
            pr_number=request.pr_number,
            review_body=message,
            installation_id=request.installation_id,
        )

        print(result)

        return {
            "status": "success",
            "comment_url": result.get("html_url"),
            "comment_id": result.get("id"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to post comment: {e}") from e
