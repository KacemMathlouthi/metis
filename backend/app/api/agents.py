"""Background coding agent API endpoints."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth_deps import get_current_user
from app.db.session import get_db
from app.models.agent_run import AgentRun
from app.models.installation import Installation
from app.models.user import User
from app.schemas.agent_run import (
    AgentRunDetailResponse,
    AgentRunListItemResponse,
    LaunchAgentRequest,
    LaunchAgentResponse,
)
from app.services.github import GitHubService
from app.tasks.background_agent_task import process_issue_with_agent

router = APIRouter(prefix="/agents")


def _to_list_item(run: AgentRun) -> AgentRunListItemResponse:
    return AgentRunListItemResponse(
        id=run.id,
        issue_id=f"{run.repository}#{run.issue_number}",
        repository=run.repository,
        issue_number=run.issue_number,
        status=str(run.status),
        custom_instructions=run.custom_instructions,
        iteration=run.iteration or 0,
        tokens_used=run.tokens_used or 0,
        tool_calls_made=run.tool_calls_made or 0,
        started_at=run.started_at,
        completed_at=run.completed_at,
        elapsed_seconds=run.elapsed_seconds,
        pr_url=run.pr_url,
        pr_number=run.pr_number,
        branch_name=run.branch_name,
        files_changed=run.changed_files or [],
        error=run.error,
        celery_task_id=run.celery_task_id,
        created_at=run.created_at,
    )


def _to_detail(run: AgentRun) -> AgentRunDetailResponse:
    return AgentRunDetailResponse(
        **_to_list_item(run).model_dump(),
        issue_title_snapshot=run.issue_title_snapshot,
        issue_body_snapshot=run.issue_body_snapshot,
        issue_url=run.issue_url,
        final_summary=run.final_summary,
        system_prompt=run.system_prompt,
        initial_user_message=run.initial_user_message,
        conversation=run.conversation or [],
        final_result=run.final_result or {},
    )


@router.post("/launch", response_model=LaunchAgentResponse)
async def launch_agent(
    payload: LaunchAgentRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LaunchAgentResponse:
    """Launch a background coding agent for a repository issue."""
    repository = payload.repository.strip()
    if "/" not in repository:
        raise HTTPException(
            status_code=400, detail="Invalid repository format. Use 'owner/repo'."
        )

    installation_query = await db.execute(
        select(Installation).where(
            and_(
                Installation.repository == repository,
                Installation.user_id == current_user.id,
                Installation.is_active == True,  # noqa: E712
            )
        )
    )
    installation = installation_query.scalar_one_or_none()
    if not installation:
        raise HTTPException(
            status_code=404,
            detail=f"Repository {repository} not found or not enrolled in Metis.",
        )

    owner, repo = repository.split("/")
    github = GitHubService()
    try:
        issue_data = await github.get_issue(
            owner=owner,
            repo=repo,
            issue_number=payload.issue_number,
            installation_id=installation.github_installation_id,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=404,
            detail=f"Issue #{payload.issue_number} not found for {repository}.",
        ) from exc

    agent_run = AgentRun(
        installation_id=installation.id,
        user_id=current_user.id,
        repository=repository,
        issue_number=payload.issue_number,
        issue_title_snapshot=issue_data.get("title"),
        issue_body_snapshot=issue_data.get("body"),
        issue_url=issue_data.get("html_url"),
        custom_instructions=(payload.custom_instructions or "").strip() or None,
        status="PENDING",
        changed_files=[],
        conversation=[],
        final_result={},
    )
    db.add(agent_run)
    await db.flush()

    task = process_issue_with_agent.delay(agent_run_id=str(agent_run.id))
    agent_run.celery_task_id = task.id
    await db.flush()

    return LaunchAgentResponse(
        agent_run_id=agent_run.id,
        celery_task_id=task.id,
        message=f"Agent launched for issue #{payload.issue_number}.",
    )


@router.get("", response_model=list[AgentRunListItemResponse])
async def list_agent_runs(
    repository: str = Query(..., description="Repository in format 'owner/repo'"),
    issue_number: int | None = Query(None, ge=1),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[AgentRunListItemResponse]:
    """List agent runs for a repository, optionally scoped to one issue."""
    filters = [
        AgentRun.user_id == current_user.id,
        AgentRun.repository == repository,
    ]
    if issue_number is not None:
        filters.append(AgentRun.issue_number == issue_number)

    rows = (
        (
            await db.execute(
                select(AgentRun)
                .where(and_(*filters))
                .order_by(AgentRun.created_at.desc(), AgentRun.id.desc())
            )
        )
        .scalars()
        .all()
    )

    return [_to_list_item(run) for run in rows]


@router.get("/{agent_run_id}", response_model=AgentRunDetailResponse)
async def get_agent_run(
    agent_run_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AgentRunDetailResponse:
    """Get detailed information for a single agent run."""
    run = (
        (
            await db.execute(
                select(AgentRun).where(
                    and_(
                        AgentRun.id == agent_run_id,
                        AgentRun.user_id == current_user.id,
                    )
                )
            )
        )
        .scalars()
        .one_or_none()
    )
    if not run:
        raise HTTPException(status_code=404, detail="Agent run not found.")

    return _to_detail(run)

