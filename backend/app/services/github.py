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

    async def get_pr_diff(
        self,
        owner: str,
        repo: str,
        pr_number: int,
        installation_id: int | None = None,
    ) -> str:
        """Get pull request diff.

        Args:
            owner: Repository owner
            repo: Repository name
            pr_number: Pull request number
            installation_id: GitHub App installation ID

        Returns:
            PR diff as string.
        """
        if installation_id is None:
            raise ValueError("installation_id is required for fetching PR diff")
        token = await self.get_installation_token(installation_id)

        response = await self._client.get(
            f"{self.base_url}/repos/{owner}/{repo}/pulls/{pr_number}",
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github.v3.diff",
            },
        )
        response.raise_for_status()

        diff: str = response.text
        return diff

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

    async def create_pr_inline_comment(
        self,
        owner: str,
        repo: str,
        pr_number: int,
        installation_id: int,
        body: str,
        path: str,
        line: int,
        side: str = "RIGHT",
        start_line: int | None = None,
        start_side: str = "RIGHT",
    ) -> dict[str, Any]:
        """Create one inline review comment on a pull request."""
        token = await self.get_installation_token(installation_id)

        payload: dict[str, Any] = {
            "body": body,
            "path": path,
            "line": line,
            "side": side,
        }
        if start_line is not None:
            payload["start_line"] = start_line
            payload["start_side"] = start_side

        response = await self._client.post(
            f"{self.base_url}/repos/{owner}/{repo}/pulls/{pr_number}/comments",
            headers={"Authorization": f"Bearer {token}"},
            json=payload,
        )
        response.raise_for_status()
        result: dict[str, Any] = response.json()
        return result

    async def create_pr_file_comment(
        self,
        owner: str,
        repo: str,
        pr_number: int,
        installation_id: int,
        body: str,
        path: str,
        commit_id: str,
    ) -> dict[str, Any]:
        """Create one file-level review comment on a pull request."""
        token = await self.get_installation_token(installation_id)

        payload = {
            "body": body,
            "path": path,
            "subject_type": "file",
            "commit_id": commit_id,
        }

        response = await self._client.post(
            f"{self.base_url}/repos/{owner}/{repo}/pulls/{pr_number}/comments",
            headers={"Authorization": f"Bearer {token}"},
            json=payload,
        )
        response.raise_for_status()
        result: dict[str, Any] = response.json()
        return result

    async def get_installation_repositories(
        self, installation_id: int
    ) -> list[dict[str, Any]]:
        """Get all repositories accessible to a specific installation.

        Uses GitHub App installation token to fetch repositories that
        the installation has access to. This is used to show users which
        repos they can enable for code review.

        Args:
            installation_id: GitHub App installation ID

        Returns:
            List of repository data from GitHub API
        """
        token = await self.get_installation_token(installation_id)

        response = await self._client.get(
            f"{self.base_url}/installation/repositories",
            headers={"Authorization": f"Bearer {token}"},
        )
        response.raise_for_status()

        data = response.json()
        repositories: list[dict[str, Any]] = data.get("repositories", [])
        return repositories

    async def get_user_installations_with_repos(
        self, user_access_token: str
    ) -> list[dict[str, Any]]:
        """Get user's GitHub App installations with their accessible repositories.

        Uses the user's OAuth token to fetch all installations, then for each
        installation fetches the repositories it has access to.

        Args:
            user_access_token: User's GitHub OAuth access token

        Returns:
            List of installations with nested repositories
        """
        # First, get user's installations
        response = await self._client.get(
            f"{self.base_url}/user/installations",
            headers={
                "Authorization": f"Bearer {user_access_token}",
                "Accept": "application/vnd.github+json",
            },
        )
        response.raise_for_status()

        data = response.json()
        installations = data.get("installations", [])

        # For each installation, fetch accessible repositories
        installations_with_repos = []
        for installation in installations:
            installation_id = installation["id"]

            # Get installation token to fetch repos
            try:
                repos = await self.get_installation_repositories(installation_id)

                installations_with_repos.append(
                    {
                        "id": installation_id,
                        "account": installation["account"],
                        "repository_selection": installation.get(
                            "repository_selection", "all"
                        ),
                        "repositories": repos,
                        "created_at": installation.get("created_at"),
                        "updated_at": installation.get("updated_at"),
                    }
                )
            except Exception as e:
                # Skip installations we can't access
                print(
                    f"Warning: Could not fetch repos for installation {installation_id}: {e}"
                )
                continue

        return installations_with_repos

    async def get_repository_issues(
        self,
        owner: str,
        repo: str,
        installation_id: int,
        state: str = "all",
        per_page: int = 100,
    ) -> list[dict[str, Any]]:
        """Get issues for a repository.

        Args:
            owner: Repository owner
            repo: Repository name
            installation_id: GitHub App installation ID
            state: Issue state filter (open, closed, all)
            per_page: Number of issues per page (max 100)

        Returns:
            List of issue data from GitHub API
        """
        token = await self.get_installation_token(installation_id)

        response = await self._client.get(
            f"{self.base_url}/repos/{owner}/{repo}/issues",
            headers={"Authorization": f"Bearer {token}"},
            params={"state": state, "per_page": per_page},
        )
        response.raise_for_status()

        issues: list[dict[str, Any]] = response.json()
        # Filter out pull requests (GitHub API returns PRs as issues)
        issues = [issue for issue in issues if "pull_request" not in issue]
        return issues

    async def get_issue(
        self, owner: str, repo: str, issue_number: int, installation_id: int
    ) -> dict[str, Any]:
        """Get a single issue by number.

        Args:
            owner: Repository owner
            repo: Repository name
            issue_number: Issue number
            installation_id: GitHub App installation ID

        Returns:
            Issue data from GitHub API
        """
        token = await self.get_installation_token(installation_id)

        response = await self._client.get(
            f"{self.base_url}/repos/{owner}/{repo}/issues/{issue_number}",
            headers={"Authorization": f"Bearer {token}"},
        )
        response.raise_for_status()

        issue: dict[str, Any] = response.json()
        return issue

    async def get_issue_comments(
        self,
        owner: str,
        repo: str,
        issue_number: int,
        installation_id: int,
        per_page: int = 100,
    ) -> list[dict[str, Any]]:
        """Get comments for an issue.

        Args:
            owner: Repository owner
            repo: Repository name
            issue_number: Issue number
            installation_id: GitHub App installation ID
            per_page: Number of comments per page (max 100)

        Returns:
            List of comment data from GitHub API
        """
        token = await self.get_installation_token(installation_id)

        response = await self._client.get(
            f"{self.base_url}/repos/{owner}/{repo}/issues/{issue_number}/comments",
            headers={"Authorization": f"Bearer {token}"},
            params={"per_page": per_page},
        )
        response.raise_for_status()

        comments: list[dict[str, Any]] = response.json()
        return comments


# Global instance
github_service = GitHubService()
