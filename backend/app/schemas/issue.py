"""Pydantic schemas for Issue API endpoints.

These schemas match the frontend TypeScript types for consistency.
"""

from datetime import datetime

from pydantic import BaseModel, Field


class IssueResponse(BaseModel):
    """Issue response schema matching frontend Issue type."""

    id: int = Field(..., description="GitHub issue ID")
    repository: str = Field(..., description="Repository in format 'owner/repo'")
    issue_number: int = Field(..., description="Issue number")
    title: str = Field(..., description="Issue title")
    body: str | None = Field(None, description="Issue body/description")
    status: str = Field(..., description="Issue state (OPEN/CLOSED)")
    labels: list[str] = Field(default_factory=list, description="Array of label names")
    assignees: list[str] = Field(
        default_factory=list, description="Array of GitHub usernames"
    )
    author: str = Field(..., description="GitHub username of author")
    created_at: datetime = Field(..., description="Issue creation timestamp")
    updated_at: datetime | None = Field(None, description="Last update timestamp")
    closed_at: datetime | None = Field(None, description="Closed timestamp if closed")
    comments_count: int = Field(0, description="Number of comments")
    github_url: str = Field(..., description="Direct link to GitHub issue")

    class Config:
        """Pydantic config."""

        from_attributes = True


class IssueCommentResponse(BaseModel):
    """Issue comment response schema matching frontend IssueComment type."""

    id: int = Field(..., description="GitHub comment ID")
    issue_number: int = Field(..., description="Issue number this comment belongs to")
    author: str = Field(..., description="GitHub username")
    avatar_url: str | None = Field(None, description="User avatar URL")
    body: str = Field(..., description="Comment body")
    created_at: datetime = Field(..., description="Comment creation timestamp")
    github_url: str = Field(..., description="Direct link to GitHub comment")

    class Config:
        """Pydantic config."""

        from_attributes = True
