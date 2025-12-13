"""GitHub OAuth service for user authentication.

Handles the complete OAuth flow with GitHub including authorization
redirect, code exchange for tokens, and fetching user profile information.
Integrates with the User model to create/update user accounts.
"""

from typing import Any

import httpx

from app.core.config import settings


class GitHubOAuthService:
    """Service for GitHub OAuth authentication flow.

    Implements the three-step OAuth flow: redirect to GitHub, receive callback
    with authorization code, exchange code for access token, fetch user info.
    """

    def __init__(self) -> None:
        """Initialize GitHub OAuth service with API endpoints."""
        self.authorize_url = "https://github.com/login/oauth/authorize"
        self.token_url = "https://github.com/login/oauth/access_token"
        self.user_api_url = "https://api.github.com/user"
        self.installations_url = "https://api.github.com/user/installations"

    def get_authorization_url(self) -> str:
        """Generate GitHub OAuth authorization URL."""
        params = {
            "client_id": settings.GITHUB_CLIENT_ID,
            "redirect_uri": f"{settings.FRONTEND_URL}/auth/callback",
            "scope": "user:email read:org",  # Permissions we need
        }

        query_string = "&".join(f"{k}={v}" for k, v in params.items())
        return f"{self.authorize_url}?{query_string}"

    async def exchange_code_for_token(self, code: str) -> dict[str, Any]:
        """Exchange authorization code for access token.

        After user authorizes, GitHub redirects back with a code.
        We exchange this code for an access_token that lets us
        make API calls on behalf of the user.
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.token_url,
                headers={"Accept": "application/json"},
                data={
                    "client_id": settings.GITHUB_CLIENT_ID,
                    "client_secret": settings.GITHUB_CLIENT_SECRET_ID,
                    "code": code,
                },
            )
            response.raise_for_status()

            data: dict[str, Any] = response.json()

            if "error" in data:
                raise ValueError(f"GitHub OAuth error: {data.get('error_description')}")

            return data

    async def get_user_info(self, access_token: str) -> dict[str, Any]:
        """Fetch user profile information from GitHub API.

        Uses the access token to get user's GitHub profile including
        username, email, avatar, and unique GitHub ID.
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                self.user_api_url,
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/json",
                },
            )
            response.raise_for_status()

            user_data: dict[str, Any] = response.json()
            return user_data

    async def get_user_installations(self, access_token: str) -> dict[str, Any]:
        """Get user's GitHub App installations.

        Returns list of repositories/orgs where the user has installed
        the Metis GitHub App. Used for repository enrollment.
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                self.installations_url,
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github+json",
                },
            )
            response.raise_for_status()

            data: dict[str, Any] = response.json()
            return data


# Global instance
github_oauth = GitHubOAuthService()
