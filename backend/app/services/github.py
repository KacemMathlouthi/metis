"""GitHub API service for interacting with GitHub.

This module provides functionality to authenticate as a GitHub App,
fetch pull request data, and post comments/reviews to GitHub PRs.
"""

from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import httpx
import jwt

from app.core.config import settings


class GitHubService:
    """Service for interacting with GitHub API."""

    def __init__(self) -> None:
        """Initialize GitHub service."""
        self.base_url = "https://api.github.com"
        self.app_id = settings.GITHUB_APP_ID
        self.private_key = self._load_private_key()
        self._client = httpx.AsyncClient(
            headers={
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
            }
        )

    def _load_private_key(self) -> str:
        """Load GitHub App private key from file."""
        if settings.GITHUB_SECRET_KEY_PATH is None:
            raise ValueError("GitHub App private key path not configured")
        key_path = Path(settings.GITHUB_SECRET_KEY_PATH)
        if key_path.exists():
            return key_path.read_text()
        raise ValueError("GitHub App private key not configured")

    def _generate_jwt(self) -> str:
        """Generate a JWT for GitHub App authentication."""
        now = datetime.now(timezone.utc)
        payload = {
            "iat": int(now.timestamp()) - 60,
            "exp": int((now + timedelta(minutes=10)).timestamp()),
            "iss": str(self.app_id),
        }
        token: str = jwt.encode(payload, self.private_key, algorithm="RS256")
        return token

    async def get_installation_token(self, installation_id: int) -> str:
        """Get an installation access token for a specific installation."""
        jwt_token = self._generate_jwt()

        response = await self._client.post(
            f"{self.base_url}/app/installations/{installation_id}/access_tokens",
            headers={"Authorization": f"Bearer {jwt_token}"},
        )
        response.raise_for_status()

        data = response.json()
        token: str = data["token"]
        return token

    async def create_pr_review(
        self,
        owner: str,
        repo: str,
        pr_number: int,
        review_body: str,
        event: str = "COMMENT",
        installation_id: int | None = None,
    ) -> dict[str, Any]:
        """Create a pull request review.

        Args:
            owner: Repository owner
            repo: Repository name
            pr_number: Pull request number
            review_body: Main review comment
            event: Review event type (COMMENT, APPROVE, REQUEST_CHANGES)
            installation_id: GitHub App installation ID

        Returns:
            Response data from GitHub API
        """
        if installation_id is None:
            raise ValueError("installation_id is required for creating PR review")
        token = await self.get_installation_token(installation_id)

        payload = {
            "body": review_body,
            "event": event,
        }

        response = await self._client.post(
            f"{self.base_url}/repos/{owner}/{repo}/pulls/{pr_number}/reviews",
            headers={"Authorization": f"Bearer {token}"},
            json=payload,
        )
        response.raise_for_status()

        result: dict[str, Any] = response.json()
        return result


# Global instance
github_service = GitHubService()
