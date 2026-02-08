"""Review models for PR code reviews and line-specific comments.

A Review represents one AI-generated code review for a pull request.
ReviewComment represents individual inline comments on specific lines.
This separation allows querying comments independently and supports
GitHub's review API structure with multiple inline comments per review.
"""

from sqlalchemy import BigInteger, Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.db.base_class import BaseModel


class Review(Base, BaseModel):
    """AI-generated code review for a pull request.

    Tracks the review lifecycle from pending to completed/failed,
    stores the overall review text and metadata about the PR being reviewed.
    Linked to an installation and contains multiple line-specific comments.
    """

    __tablename__ = "reviews"

    # Celery task ID
    celery_task_id = Column(
        String(255), nullable=True, index=True, comment="Celery task ID for tracking"
    )

    # Link to installation
    installation_id = Column(
        UUID(as_uuid=True),
        ForeignKey("installations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Pull request information
    pr_number = Column(Integer, nullable=False, index=True)
    repository = Column(String(500), nullable=False, index=True)
    commit_sha = Column(
        String(40), nullable=False, comment="Git commit SHA being reviewed"
    )

    # Review status
    status = Column(
        Enum("PENDING", "PROCESSING", "COMPLETED", "FAILED", name="review_status_enum"),
        nullable=False,
        default="PENDING",
        index=True,
    )

    # Review content
    review_text = Column(Text, nullable=True, comment="Overall review summary")

    # PR Metadata (renamed from 'metadata' to avoid SQLAlchemy reserved name)
    pr_metadata = Column(
        JSONB,
        default={},
        comment="PR title, author, description, file count, etc.",
    )

    # Processing info
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True, index=True)
    error = Column(Text, nullable=True, comment="Error message if status=FAILED")

    # GitHub integration
    github_review_id = Column(Integer, nullable=True, comment="GitHub API review ID")

    # Relationships
    installation = relationship("Installation", back_populates="reviews")
    comments = relationship(
        "ReviewComment", back_populates="review", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        """String representation for debugging."""
        return f"<Review(id={self.id}, repo={self.repository}, pr={self.pr_number}, status={self.status})>"


class ReviewComment(Base, BaseModel):
    """Individual inline comment on a specific line of code.

    Represents one code issue found by Metis AI agent, including
    severity, category, and optionally the GitHub comment ID after posting.
    Supports single-line and multi-line comments via line_end field.
    """

    __tablename__ = "review_comments"

    # Link to review
    review_id = Column(
        UUID(as_uuid=True),
        ForeignKey("reviews.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Location in code
    file_path = Column(String(1000), nullable=False, index=True)
    line_number = Column(Integer, nullable=False)
    line_end = Column(Integer, nullable=True, comment="For multi-line comments")

    # Comment content
    title = Column(String(255), nullable=True, comment="Short finding title")
    comment_text = Column(Text, nullable=False)

    # Classification
    severity = Column(
        Enum("INFO", "WARNING", "ERROR", "CRITICAL", name="severity_enum"),
        nullable=False,
        index=True,
    )
    category = Column(
        Enum(
            "BUG",
            "SECURITY",
            "PERFORMANCE",
            "STYLE",
            "MAINTAINABILITY",
            "DOCUMENTATION",
            "TESTING",
            name="category_enum",
        ),
        nullable=False,
        index=True,
    )

    # GitHub integration
    github_comment_id = Column(
        BigInteger, nullable=True, comment="GitHub API comment ID (bigint)"
    )

    # Relationships
    review = relationship("Review", back_populates="comments")

    def __repr__(self) -> str:
        """String representation for debugging."""
        return f"<ReviewComment(id={self.id}, file={self.file_path}:{self.line_number}, severity={self.severity})>"
