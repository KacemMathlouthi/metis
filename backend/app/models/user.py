"""User model for GitHub OAuth authenticated users.

Users authenticate via GitHub OAuth and can manage multiple GitHub App
installations across different repositories and organizations. Each user
has encrypted access tokens for GitHub API calls and tracks login activity.
"""

from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.db.base_class import BaseModel


class User(Base, BaseModel):
    """User account authenticated via GitHub OAuth.

    Stores user profile information from GitHub and encrypted OAuth tokens
    for API access. One user can have multiple GitHub App installations.
    All OAuth tokens are encrypted at the application layer before storage.
    """

    __tablename__ = "users"

    # GitHub profile
    github_id = Column(
        Integer,
        unique=True,
        nullable=False,
        index=True,
        comment="GitHub user ID (immutable)",
    )
    username = Column(String(255), nullable=False, index=True)
    email = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)

    # OAuth tokens
    access_token = Column(
        String(500), nullable=False, comment="Encrypted GitHub OAuth token"
    )
    refresh_token = Column(
        String(500), nullable=True, comment="Encrypted refresh token"
    )

    # Account status
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    last_login_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    installations = relationship(
        "Installation", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        """String representation for debugging."""
        return f"<User(id={self.id}, username={self.username}, github_id={self.github_id})>"
