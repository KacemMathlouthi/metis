"""Pydantic schemas for review comment APIs."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ReviewCommentListItemResponse(BaseModel):
    """Review comment fields persisted in the review_comments table."""

    id: UUID = Field(..., description="Review comment UUID")
    review_id: UUID = Field(..., description="Parent review UUID")
    title: str = Field(..., description="Short, human-readable finding title")
    file_path: str = Field(..., description="Path to file in repository")
    line_number: int = Field(..., description="Starting line number")
    line_end: int | None = Field(None, description="Optional ending line number")
    comment_text: str = Field(..., description="Comment body")
    severity: str = Field(..., description="Severity (INFO/WARNING/ERROR/CRITICAL)")
    category: str = Field(..., description="Category (BUG/SECURITY/PERFORMANCE/etc.)")
    github_comment_id: int | None = Field(
        None, description="GitHub discussion comment ID (bigint)"
    )
    created_at: datetime = Field(..., description="Comment creation timestamp")

    class Config:
        """Pydantic config."""

        from_attributes = True


class ReviewContextResponse(BaseModel):
    """Context pulled from the parent review row."""

    repository: str = Field(..., description="Repository in format 'owner/repo'")
    pr_number: int = Field(..., description="Pull request number")
    review_status: str = Field(..., description="Parent review status")
    commit_sha: str = Field(..., description="Reviewed commit SHA")


class ReviewCommentWithContextResponse(BaseModel):
    """Review comment with related review context for analytics and listings."""

    comment: ReviewCommentListItemResponse
    review: ReviewContextResponse


class ReviewCommentListResponse(BaseModel):
    """Paginated review comment list response."""

    items: list[ReviewCommentWithContextResponse]
    total: int = Field(..., description="Total matching comments")
    page: int = Field(..., description="Current page (1-based)")
    page_size: int = Field(..., description="Page size")
