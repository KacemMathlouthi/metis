"""Installation model for GitHub App installations.

Each installation represents the Metis GitHub App being installed on a
specific repository or organization. Stores the GitHub installation ID
and review configuration (sensitivity, custom rules, etc.) as JSON.
"""

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.db.base_class import BaseModel


class Installation(Base, BaseModel):
    """GitHub App installation on a repository or organization.

    Links a user to a specific GitHub installation with review configuration.
    The config field stores ReviewerConfig settings as JSON for flexibility,
    allowing custom sensitivity levels, instructions, and ignore patterns.
    """

    __tablename__ = "installations"
    __table_args__ = (
        # Composite unique constraint: one installation can have multiple repos
        # but each (installation_id, repository) pair must be unique
        Index(
            "ix_installations_github_installation_id_repository",
            "github_installation_id",
            "repository",
            unique=True,
        ),
    )

    # GitHub App installation
    github_installation_id = Column(
        Integer,
        nullable=False,
        index=True,
        comment="GitHub App installation ID",
    )

    # Owner information
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Installation target
    account_type = Column(
        Enum("USER", "ORGANIZATION", name="account_type_enum"),
        nullable=False,
        comment="Whether installed on user account or org",
    )
    account_name = Column(String(255), nullable=False, index=True)
    repository = Column(
        String(500),
        nullable=False,
        index=True,
        comment="Repository in format 'owner/repo'",
    )

    # Configuration
    config = Column(
        JSONB,
        nullable=False,
        default={},
        comment="ReviewerConfig as JSON: sensitivity, custom_instructions, etc.",
    )

    # Status
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    suspended_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="installations")
    reviews = relationship("Review", back_populates="installation", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        """String representation for debugging."""
        return f"<Installation(id={self.id}, repo={self.repository}, active={self.is_active})>"
