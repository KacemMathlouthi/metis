"""User repository for database operations on User model.

Provides data access methods for creating, reading, and updating users
with GitHub OAuth data. Handles token encryption/decryption automatically
and includes queries for finding users by GitHub ID, username, or UUID.
"""

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decrypt_token, encrypt_token
from app.models.user import User


class UserRepository:
    """Data access layer for User model."""

    @staticmethod
    async def get_by_id(db: AsyncSession, user_id: UUID | str) -> User | None:
        """Get user by UUID.

        Args:
            db: Database session
            user_id: User UUID (string or UUID object)

        Returns:
            User object if found, None otherwise
        """
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_github_id(db: AsyncSession, github_id: int) -> User | None:
        """Get user by GitHub ID (for OAuth login).

        This is the primary lookup during OAuth authentication - we check
        if a user with this GitHub ID already exists in our database before
        deciding whether to create a new user or update an existing one.

        Args:
            db: Database session
            github_id: GitHub user ID from OAuth

        Returns:
            User object if found, None otherwise
        """
        result = await db.execute(select(User).where(User.github_id == github_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_all_active(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[User]:
        """Get all active users with pagination.

        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of active User objects
        """
        result = await db.execute(
            select(User).where(User.is_active == True).offset(skip).limit(limit)  # noqa: E712
        )
        return list(result.scalars().all())

    @staticmethod
    async def create(
        db: AsyncSession,
        github_id: int,
        username: str,
        email: str | None,
        avatar_url: str | None,
        access_token: str,
        refresh_token: str | None = None,
    ) -> User:
        """Create new user from GitHub OAuth data.

        Automatically encrypts OAuth tokens before storing in database
        and sets is_active=True and last_login_at to current time.

        Args:
            db: Database session
            github_id: GitHub user ID
            username: GitHub username
            email: User's email from GitHub (may be None if private)
            avatar_url: GitHub avatar URL
            access_token: GitHub OAuth access token (will be encrypted)
            refresh_token: GitHub OAuth refresh token (will be encrypted)

        Returns:
            Created User object with all fields populated
        """
        user = User(
            github_id=github_id,
            username=username,
            email=email,
            avatar_url=avatar_url,
            access_token=encrypt_token(access_token),
            refresh_token=encrypt_token(refresh_token) if refresh_token else None,
            is_active=True,
            last_login_at=datetime.now(timezone.utc),
        )

        db.add(user)
        await db.flush()  # Assign ID without committing transaction
        await db.refresh(user)  # Refresh to get generated fields (id, timestamps)

        return user

    @staticmethod
    async def update_tokens(
        db: AsyncSession,
        user: User,
        access_token: str,
        refresh_token: str | None = None,
    ) -> User:
        """Update user's OAuth tokens (on refresh or re-login).

        Encrypts new tokens and updates last_login timestamp to track
        user activity. Call this when user logs in again or refreshes tokens.

        Args:
            db: Database session
            user: User object to update
            access_token: New GitHub OAuth access token
            refresh_token: New GitHub OAuth refresh token (optional)

        Returns:
            Updated User object
        """
        user.access_token = encrypt_token(access_token)
        if refresh_token:
            user.refresh_token = encrypt_token(refresh_token)
        user.last_login_at = datetime.now(timezone.utc)

        await db.flush()
        await db.refresh(user)

        return user

    @staticmethod
    async def update_profile(
        db: AsyncSession,
        user: User,
        username: str | None = None,
        email: str | None = None,
    ) -> User:
        """Update user profile information.

        Args:
            db: Database session
            user: User object to update
            username: New username (optional)
            email: New email (optional)

        Returns:
            Updated User object
        """
        if username is not None:
            user.username = username
        if email is not None:
            user.email = email

        await db.flush()
        await db.refresh(user)

        return user

    @staticmethod
    async def deactivate(db: AsyncSession, user: User) -> User:
        """Deactivate user account (soft delete).

        Sets is_active=False instead of deleting the record.

        Args:
            db: Database session
            user: User object to deactivate

        Returns:
            Updated User object with is_active=False
        """
        user.is_active = False

        await db.flush()
        await db.refresh(user)

        return user

    @staticmethod
    def get_decrypted_access_token(user: User) -> str:
        """Get user's GitHub access token (decrypted).

        Use this when you need to make GitHub API calls on behalf
        of the user (fetching their installations, repositories, etc.).
        The token is stored encrypted in the database for security.

        Args:
            user: User object with encrypted access_token

        Returns:
            Decrypted GitHub OAuth access token
        """
        return decrypt_token(user.access_token)

    @staticmethod
    def get_decrypted_refresh_token(user: User) -> str | None:
        """Get user's GitHub refresh token (decrypted).

        Args:
            user: User object with encrypted refresh_token

        Returns:
            Decrypted GitHub OAuth refresh token, or None if not set
        """
        if user.refresh_token:
            return decrypt_token(user.refresh_token)
        return None
