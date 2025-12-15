"""Pydantic schemas for Installation API requests and responses.

Defines data validation models for installation management endpoints
including listing installations, enrolling repositories, and configuring
review settings.
"""

from pydantic import BaseModel, Field


class InstallationConfigSchema(BaseModel):
    """Schema for installation review configuration."""

    sensitivity: str = Field(
        default="MEDIUM",
        description="Review sensitivity level (LOW, MEDIUM, HIGH)",
        pattern="^(LOW|MEDIUM|HIGH)$",
    )
    custom_instructions: str = Field(
        default="",
        description="Custom instructions for AI reviewer",
        max_length=5000,
    )
    ignore_patterns: list[str] = Field(
        default_factory=list,
        description="File patterns to ignore (e.g., ['*.test.js', 'dist/*'])",
        max_length=100,
    )
    auto_review_enabled: bool = Field(
        default=True,
        description="Automatically review new PRs",
    )


class InstallationResponse(BaseModel):
    """Schema for Installation response (from database)."""

    id: str = Field(description="Installation UUID")
    github_installation_id: int = Field(description="GitHub installation ID")
    user_id: str = Field(description="User UUID who owns this installation")
    account_type: str = Field(description="USER or ORGANIZATION")
    account_name: str = Field(description="GitHub account name")
    repository: str = Field(description="Repository in format 'owner/repo'")
    config: dict = Field(description="Review configuration")
    is_active: bool = Field(description="Whether reviews are enabled")
    created_at: str = Field(description="ISO 8601 timestamp")
    updated_at: str | None = Field(default=None, description="ISO 8601 timestamp")


class EnableRepositoryRequest(BaseModel):
    """Request schema for enabling repository reviews."""

    github_installation_id: int = Field(description="GitHub installation ID")
    repository: str = Field(
        description="Repository in format 'owner/repo'",
        pattern=r"^[a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+$",
    )
    account_type: str = Field(
        default="USER",
        description="USER or ORGANIZATION",
        pattern="^(USER|ORGANIZATION)$",
    )
    account_name: str = Field(description="GitHub account name")
    config: InstallationConfigSchema = Field(
        default_factory=InstallationConfigSchema,
        description="Initial review configuration",
    )


class UpdateConfigRequest(BaseModel):
    """Request schema for updating installation configuration."""

    config: InstallationConfigSchema = Field(description="Updated review configuration")


class SyncInstallationsResponse(BaseModel):
    """Response schema for syncing installations."""

    synced: int = Field(description="Number of installations synced")
    created: int = Field(description="Number of new installations created")
    updated: int = Field(description="Number of existing installations updated")
    installations: list[InstallationResponse] = Field(
        description="All user installations"
    )
