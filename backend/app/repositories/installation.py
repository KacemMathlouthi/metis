"""Installation repository for database operations on Installation model.

Provides data access methods for managing GitHub App installations including
creating installations, querying by repository, updating configuration, and
managing active status. Handles JSONB config serialization automatically.
"""

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.installation import Installation


class InstallationRepository:
    """Data access layer for Installation model.

    Encapsulates all database queries related to GitHub App installations,
    providing methods to manage repository enrollment and review configuration.
    """

    @staticmethod
    async def get_by_id(db: AsyncSession, installation_id: UUID | str) -> Installation | None:
        """Get installation by UUID.

        Args:
            db: Database session
            installation_id: Installation UUID

        Returns:
            Installation object if found, None otherwise
        """
        result = await db.execute(select(Installation).where(Installation.id == installation_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_github_installation_id(
        db: AsyncSession, github_installation_id: int
    ) -> Installation | None:
        """Get installation by GitHub installation ID.

        Args:
            db: Database session
            github_installation_id: GitHub App installation ID

        Returns:
            Installation object if found, None otherwise
        """
        result = await db.execute(
            select(Installation).where(
                Installation.github_installation_id == github_installation_id
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_repository(
        db: AsyncSession, repository: str, active_only: bool = True
    ) -> Installation | None:
        """Get installation by repository name.

        Args:
            db: Database session
            repository: Repository in format 'owner/repo'
            active_only: If True, only return active installations

        Returns:
            Installation object if found, None otherwise
        """
        query = select(Installation).where(Installation.repository == repository)

        if active_only:
            query = query.where(Installation.is_active == True)  # noqa: E712

        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_installations(
        db: AsyncSession, user_id: UUID | str, active_only: bool = True
    ) -> list[Installation]:
        """Get all installations for a specific user.

        Args:
            db: Database session
            user_id: User UUID
            active_only: If True, only return active installations

        Returns:
            List of Installation objects
        """
        query = select(Installation).where(Installation.user_id == user_id)

        if active_only:
            query = query.where(Installation.is_active == True)  # noqa: E712

        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def create(
        db: AsyncSession,
        github_installation_id: int,
        user_id: UUID | str,
        account_type: str,
        account_name: str,
        repository: str,
        config: dict | None = None,
    ) -> Installation:
        """Create new installation record.

        Args:
            db: Database session
            github_installation_id: GitHub App installation ID
            user_id: User UUID who owns this installation
            account_type: 'USER' or 'ORGANIZATION'
            account_name: GitHub account name
            repository: Repository in format 'owner/repo'
            config: Review configuration as dict (optional)

        Returns:
            Created Installation object
        """
        installation = Installation(
            github_installation_id=github_installation_id,
            user_id=user_id,
            account_type=account_type,
            account_name=account_name,
            repository=repository,
            config=config or {},
            is_active=True,
        )

        db.add(installation)
        await db.flush()
        await db.refresh(installation)

        return installation

    @staticmethod
    async def update_config(
        db: AsyncSession, installation: Installation, config: dict
    ) -> Installation:
        """Update installation review configuration.

        Args:
            db: Database session
            installation: Installation object to update
            config: New configuration dict (sensitivity, custom_instructions, etc.)

        Returns:
            Updated Installation object
        """
        installation.config = config

        await db.flush()
        await db.refresh(installation)

        return installation

    @staticmethod
    async def activate(db: AsyncSession, installation: Installation) -> Installation:
        """Activate installation (enable reviews).

        Args:
            db: Database session
            installation: Installation object to activate

        Returns:
            Updated Installation object with is_active=True
        """
        installation.is_active = True
        installation.suspended_at = None

        await db.flush()
        await db.refresh(installation)

        return installation

    @staticmethod
    async def deactivate(db: AsyncSession, installation: Installation) -> Installation:
        """Deactivate installation (disable reviews).

        Sets is_active=False and records suspension timestamp.
        Preserves data for audit trail instead of deleting.

        Args:
            db: Database session
            installation: Installation object to deactivate

        Returns:
            Updated Installation object with is_active=False
        """
        installation.is_active = False
        installation.suspended_at = datetime.now(timezone.utc)

        await db.flush()
        await db.refresh(installation)

        return installation

    @staticmethod
    async def check_exists(db: AsyncSession, github_installation_id: int, repository: str) -> bool:
        """Check if installation already exists for a repository.

        Useful for preventing duplicate enrollments when user tries
        to enable reviews for a repository that's already enrolled.

        Args:
            db: Database session
            github_installation_id: GitHub App installation ID
            repository: Repository in format 'owner/repo'

        Returns:
            True if installation exists, False otherwise
        """
        result = await db.execute(
            select(Installation).where(
                and_(
                    Installation.github_installation_id == github_installation_id,
                    Installation.repository == repository,
                )
            )
        )
        return result.scalar_one_or_none() is not None

    @staticmethod
    async def get_active_count(db: AsyncSession, user_id: UUID | str) -> int:
        """Count active installations for a user.

        Useful for usage limits or displaying stats in dashboard.

        Args:
            db: Database session
            user_id: User UUID

        Returns:
            Number of active installations
        """
        from sqlalchemy import func

        result = await db.execute(
            select(func.count(Installation.id)).where(
                and_(Installation.user_id == user_id, Installation.is_active == True)  # noqa: E712
            )
        )
        count: int = result.scalar_one()
        return count
