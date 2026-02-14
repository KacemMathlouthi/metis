"""Authentication endpoints for GitHub OAuth flow.

Provides login redirect, OAuth callback handling, token refresh, logout, and user
profile endpoints. Uses HTTP-only cookies for secure session management.
"""

from typing import Annotated, Any

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth_deps import get_current_user
from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token, verify_token
from app.db.session import get_db
from app.models.user import User
from app.repositories.user import UserRepository
from app.services.oauth import github_oauth

router = APIRouter()


def _set_auth_cookies(
    response: Response,
    access_token: str,
    refresh_token: str,
) -> None:
    """Set access and refresh cookies with consistent auth settings."""
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # Set True in production with HTTPS
        samesite="lax",
        max_age=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # Set True in production
        samesite="lax",
        max_age=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS * 86400,
    )


def _clear_auth_cookies(response: Response) -> None:
    """Clear auth cookies from response."""
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")


@router.get("/login/github")
async def github_login() -> RedirectResponse:
    """Initiate GitHub OAuth flow.

    Redirects user to GitHub's authorization page where they will
    grant permissions. GitHub then redirects back to callback endpoint.
    """
    auth_url = github_oauth.get_authorization_url()
    return RedirectResponse(url=auth_url)


@router.get("/callback/github")
async def github_callback(
    code: str,
    db: AsyncSession = Depends(get_db),
) -> RedirectResponse:
    """Handle GitHub OAuth callback.

    Receives authorization code from GitHub, exchanges it for access token,
    fetches user info, creates or updates user in database, generates JWT
    tokens, and sets secure cookies before redirecting to dashboard.
    """
    # Exchange code for access token
    token_data = await github_oauth.exchange_code_for_token(code)
    access_token = token_data["access_token"]
    refresh_token = token_data.get("refresh_token")

    # Fetch user info from GitHub
    user_info = await github_oauth.get_user_info(access_token)

    # Create or update user in database
    existing_user = await UserRepository.get_by_github_id(db, user_info["id"])

    if existing_user:
        # Update existing user's tokens
        user = await UserRepository.update_tokens(db, existing_user, access_token, refresh_token)
    else:
        # Create new user
        user = await UserRepository.create(
            db=db,
            github_id=user_info["id"],
            username=user_info["login"],
            email=user_info.get("email"),
            avatar_url=user_info.get("avatar_url"),
            access_token=access_token,
            refresh_token=refresh_token,
        )

    await db.commit()

    # Generate our JWT tokens
    jwt_access_token = create_access_token(data={"sub": str(user.id)})
    jwt_refresh_token = create_refresh_token(user_id=str(user.id))

    # Set secure HTTP-only cookies and redirect to dashboard
    response = RedirectResponse(url=f"{settings.FRONTEND_URL}/dashboard")

    _set_auth_cookies(
        response=response,
        access_token=jwt_access_token,
        refresh_token=jwt_refresh_token,
    )

    return response


@router.post("/refresh")
async def refresh_access_token(
    refresh_token: Annotated[str | None, Cookie()] = None,
    db: AsyncSession = Depends(get_db),
) -> Response:
    """Refresh access token using refresh token.

    When access token expires, frontend calls this with refresh token
    cookie to get a new access token without requiring re-authentication.
    """
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token")

    try:
        payload = verify_token(refresh_token)

        # Verify this is a refresh token (not access token)
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type"
            )

        user_id_raw = payload.get("sub")
        if not user_id_raw or not isinstance(user_id_raw, str):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload"
            )

        user_id: str = user_id_raw

        # Verify user still exists and is active
        user = await UserRepository.get_by_id(db, user_id)
        if not user or not user.is_active:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        # Rotate tokens to maintain session continuity and reduce replay window.
        new_access_token = create_access_token(data={"sub": str(user.id)})
        new_refresh_token = create_refresh_token(user_id=str(user.id))

        response = Response(
            content='{"message":"Token refreshed"}',
            media_type="application/json",
        )
        _set_auth_cookies(
            response=response,
            access_token=new_access_token,
            refresh_token=new_refresh_token,
        )
        return response

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e)) from e


@router.post("/logout")
async def logout() -> Response:
    """Logout user by clearing authentication cookies.

    Removes both access_token and refresh_token cookies.
    Frontend should redirect to home page after calling this.
    """
    response = Response(
        content='{"message": "Logged out successfully"}', media_type="application/json"
    )

    _clear_auth_cookies(response)

    return response


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Get current authenticated user's profile.

    Protected endpoint that requires valid JWT token in cookies.
    Returns user profile information for display in frontend.
    """
    return {
        "id": str(current_user.id),
        "username": current_user.username,
        "email": current_user.email,
        "avatar_url": current_user.avatar_url,
        "github_id": current_user.github_id,
        "last_login_at": (
            current_user.last_login_at.isoformat() if current_user.last_login_at else None
        ),
        "is_active": current_user.is_active,
    }
