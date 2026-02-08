"""Schemas for background coding agent runs."""

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class LaunchAgentRequest(BaseModel):
    """Request payload for launching a background coding agent."""

    issue_number: int = Field(..., ge=1)
    repository: str = Field(..., description="Repository in format 'owner/repo'")
    custom_instructions: str | None = Field(default=None)


class LaunchAgentResponse(BaseModel):
    """Response payload after queueing an agent run."""

    agent_run_id: UUID
    celery_task_id: str
    message: str


class AgentRunListItemResponse(BaseModel):
    """Compact agent run payload for list views."""

    id: UUID
    issue_id: str
    repository: str
    issue_number: int
    status: str
    custom_instructions: str | None
    iteration: int
    tokens_used: int
    tool_calls_made: int
    started_at: datetime | None
    completed_at: datetime | None
    elapsed_seconds: int | None
    pr_url: str | None
    pr_number: int | None
    branch_name: str | None
    files_changed: list[str]
    error: str | None
    celery_task_id: str | None
    created_at: datetime


class AgentRunDetailResponse(AgentRunListItemResponse):
    """Detailed agent run payload for progress/detail views."""

    issue_title_snapshot: str | None
    issue_body_snapshot: str | None
    issue_url: str | None
    final_summary: str | None
    system_prompt: str | None
    initial_user_message: str | None
    conversation: list[dict[str, Any]]
    final_result: dict[str, Any]

