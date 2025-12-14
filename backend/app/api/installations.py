"""Installation management API endpoints.

Provides endpoints for users to view their GitHub installations,
enable/disable code reviews for repositories, and configure review settings.
"""

from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth_deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.repositories.installation import InstallationRepository
from app.repositories.user import UserRepository
from app.schemas.installation import (
    EnableRepositoryRequest,
    InstallationResponse,
    SyncInstallationsResponse,
    UpdateConfigRequest,
)
from app.services.github import github_service

router = APIRouter(prefix="/installations")


@router.get("/github", response_model=list[dict[str, Any]])
async def list_github_installations(
    current_user: User = Depends(get_current_user),
) -> list[dict[str, Any]]:
    """List user's GitHub App installations with accessible repositories.

    Fetches installations from GitHub API using user's OAuth token.
    Shows which repositories the user can enable for code review.

    Returns:
        List of installations with nested repositories
    """
    # Get user's decrypted GitHub OAuth token
    github_token = UserRepository.get_decrypted_access_token(current_user)

    # Fetch installations with repositories from GitHub
    installations = await github_service.get_user_installations_with_repos(github_token)

    return installations


@router.post("/sync", response_model=SyncInstallationsResponse)
async def sync_installations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SyncInstallationsResponse:
    """Sync user's GitHub installations to database.

    Fetches current installations from GitHub and creates/updates
    Installation records in the database. This doesn't enable reviews,
    just syncs the data so users can see what's available.

    Returns:
        Sync statistics and list of installations
    """
    # Get GitHub token
    github_token = UserRepository.get_decrypted_access_token(current_user)

    # Fetch installations from GitHub
    github_installations = await github_service.get_user_installations_with_repos(github_token)

    installation_repo = InstallationRepository()
    created_count = 0
    updated_count = 0

    synced_installations = []

    for gh_installation in github_installations:
        github_installation_id = gh_installation["id"]
        account = gh_installation["account"]
        repositories = gh_installation.get("repositories", [])

        # Determine account type
        account_type = "ORGANIZATION" if account["type"] == "Organization" else "USER"

        # For each repository in this installation
        for repo in repositories:
            repo_full_name = repo["full_name"]

            # Check if installation already exists
            existing = await installation_repo.get_by_github_installation_id(
                db, github_installation_id
            )

            if existing and existing.repository == repo_full_name:
                # Update existing installation
                updated_count += 1
                installation = existing
            elif not existing:
                # Create new installation (active by default)
                installation = await installation_repo.create(
                    db=db,
                    github_installation_id=github_installation_id,
                    user_id=current_user.id,
                    account_type=account_type,
                    account_name=account["login"],
                    repository=repo_full_name,
                    config={
                        "sensitivity": "MEDIUM",
                        "custom_instructions": "",
                        "ignore_patterns": [],
                        "auto_review_enabled": True,
                    },
                )
                created_count += 1
            else:
                continue

            synced_installations.append(
                InstallationResponse(
                    id=str(installation.id),
                    github_installation_id=installation.github_installation_id,
                    user_id=str(installation.user_id),
                    account_type=installation.account_type,
                    account_name=installation.account_name,
                    repository=installation.repository,
                    config=installation.config,
                    is_active=installation.is_active,
                    created_at=installation.created_at.isoformat(),
                    updated_at=(
                        installation.updated_at.isoformat() if installation.updated_at else None
                    ),
                )
            )

    await db.commit()

    return SyncInstallationsResponse(
        synced=len(synced_installations),
        created=created_count,
        updated=updated_count,
        installations=synced_installations,
    )


@router.get("", response_model=list[InstallationResponse])
async def list_installations(
    active_only: bool = True,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[InstallationResponse]:
    """List user's enrolled installations from database.

    Returns installations and optionally filtered
    to only show active (enabled) installations.

    Args:
        active_only: If True, only return enabled installations

    Returns:
        List of installation records from database
    """
    installation_repo = InstallationRepository()
    installations = await installation_repo.get_user_installations(
        db, current_user.id, active_only=active_only
    )

    return [
        InstallationResponse(
            id=str(inst.id),
            github_installation_id=inst.github_installation_id,
            user_id=str(inst.user_id),
            account_type=inst.account_type,
            account_name=inst.account_name,
            repository=inst.repository,
            config=inst.config,
            is_active=inst.is_active,
            created_at=inst.created_at.isoformat(),
            updated_at=inst.updated_at.isoformat() if inst.updated_at else None,
        )
        for inst in installations
    ]

@router.post("/enable", response_model=InstallationResponse, status_code=status.HTTP_201_CREATED)
async def enable_repository(
    request: EnableRepositoryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> InstallationResponse:
    """Enable code reviews for a repository.

    Creates an Installation record if it doesn't exist, or activates
    an existing one. User must have access to the GitHub installation.

    Args:
        request: Repository and configuration details

    Returns:
        Created or updated installation

    Raises:
        409: Repository already enabled
    """
    installation_repo = InstallationRepository()

    # Check if installation already exists and is active
    existing = await installation_repo.check_exists(
        db, request.github_installation_id, request.repository
    )

    if existing:
        # Check if it's already active
        installation = await installation_repo.get_by_github_installation_id(
            db, request.github_installation_id
        )
        if installation and installation.is_active and installation.repository == request.repository:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Repository {request.repository} is already enabled",
            )

        # Reactivate if exists but inactive
        if installation:
            installation = await installation_repo.activate(db, installation)
            await db.commit()
        else:
            # Create new installation
            installation = await installation_repo.create(
                db=db,
                github_installation_id=request.github_installation_id,
                user_id=current_user.id,
                account_type=request.account_type,
                account_name=request.account_name,
                repository=request.repository,
                config=request.config.model_dump(),
            )
            await db.commit()
    else:
        # Create new installation
        installation = await installation_repo.create(
            db=db,
            github_installation_id=request.github_installation_id,
            user_id=current_user.id,
            account_type=request.account_type,
            account_name=request.account_name,
            repository=request.repository,
            config=request.config.model_dump(),
        )
        await db.commit()

    return InstallationResponse(
        id=str(installation.id),
        github_installation_id=installation.github_installation_id,
        user_id=str(installation.user_id),
        account_type=installation.account_type,
        account_name=installation.account_name,
        repository=installation.repository,
        config=installation.config,
        is_active=installation.is_active,
        created_at=installation.created_at.isoformat(),
        updated_at=installation.updated_at.isoformat() if installation.updated_at else None,
    )


@router.put("/{installation_id}/config", response_model=InstallationResponse)
async def update_installation_config(
    installation_id: UUID,
    request: UpdateConfigRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> InstallationResponse:
    """Update installation review configuration.

    Allows updating sensitivity, custom instructions, and ignore patterns
    for an enrolled repository.

    Args:
        installation_id: Installation UUID
        request: Updated configuration

    Returns:
        Updated installation

    Raises:
        404: Installation not found
        403: User doesn't own this installation
    """
    installation_repo = InstallationRepository()
    installation = await installation_repo.get_by_id(db, installation_id)

    if not installation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Installation not found",
        )

    # Verify ownership
    if installation.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this installation",
        )

    # Update configuration
    installation = await installation_repo.update_config(db, installation, request.config.model_dump())
    await db.commit()

    return InstallationResponse(
        id=str(installation.id),
        github_installation_id=installation.github_installation_id,
        user_id=str(installation.user_id),
        account_type=installation.account_type,
        account_name=installation.account_name,
        repository=installation.repository,
        config=installation.config,
        is_active=installation.is_active,
        created_at=installation.created_at.isoformat(),
        updated_at=installation.updated_at.isoformat() if installation.updated_at else None,
    )


@router.delete("/{installation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def disable_installation(
    installation_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Disable code reviews for an installation.

    Sets is_active=False. Reviews can be re-enabled later.

    Args:
        installation_id: Installation UUID

    Raises:
        404: Installation not found
        403: User doesn't own this installation
    """
    installation_repo = InstallationRepository()
    installation = await installation_repo.get_by_id(db, installation_id)

    if not installation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Installation not found",
        )

    # Verify ownership
    if installation.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this installation",
        )

    # Deactivate
    await installation_repo.deactivate(db, installation)
    await db.commit()
