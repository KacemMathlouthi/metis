"""Issues API endpoints.

Provides endpoints to fetch GitHub issues and comments dynamically.
No database storage - always fetches fresh data from GitHub API.
"""

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth_deps import get_current_user
from app.db.session import get_db
from app.models.installation import Installation
from app.models.agent_run import AgentRun
from app.models.user import User
from app.schemas.agent_run import AgentRunListItemResponse
from app.schemas.issue import IssueCommentResponse, IssueResponse
from app.services.github import GitHubService

logger = logging.getLogger(__name__)

router = APIRouter()


def _serialize_agent_run(run: AgentRun) -> AgentRunListItemResponse:
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


def _transform_github_issue(
    issue_data: dict[str, Any], repository: str
) -> IssueResponse:
    """Transform GitHub API issue data to our IssueResponse schema.

    Args:
        issue_data: Raw issue data from GitHub API
        repository: Repository in format 'owner/repo'

    Returns:
        IssueResponse object
    """
    return IssueResponse(
        id=issue_data["id"],
        repository=repository,
        issue_number=issue_data["number"],
        title=issue_data["title"],
        body=issue_data.get("body"),
        status="OPEN" if issue_data["state"] == "open" else "CLOSED",
        labels=[label["name"] for label in issue_data.get("labels", [])],
        assignees=[assignee["login"] for assignee in issue_data.get("assignees", [])],
        author=issue_data["user"]["login"],
        created_at=issue_data["created_at"],
        updated_at=issue_data.get("updated_at"),
        closed_at=issue_data.get("closed_at"),
        comments_count=issue_data.get("comments", 0),
        github_url=issue_data["html_url"],
    )


def _transform_github_comment(
    comment_data: dict[str, Any], issue_number: int
) -> IssueCommentResponse:
    """Transform GitHub API comment data to our IssueCommentResponse schema.

    Args:
        comment_data: Raw comment data from GitHub API
        issue_number: Issue number this comment belongs to

    Returns:
        IssueCommentResponse object
    """
    return IssueCommentResponse(
        id=comment_data["id"],
        issue_number=issue_number,
        author=comment_data["user"]["login"],
        avatar_url=comment_data["user"].get("avatar_url"),
        body=comment_data["body"],
        created_at=comment_data["created_at"],
        github_url=comment_data["html_url"],
    )


@router.get("/issues", response_model=list[IssueResponse])
async def list_issues(
    repository: str = Query(..., description="Repository in format 'owner/repo'"),
    state: str = Query("all", description="Issue state filter (open, closed, all)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[IssueResponse]:
    """List all issues for a repository.

    Fetches issues dynamically from GitHub API.
    Requires the repository to be enrolled in Metis.

    Args:
        repository: Repository full name (owner/repo)
        state: Filter by issue state (open, closed, all)
        current_user: Authenticated user
        db: Database session

    Returns:
        List of issues for the repository

    Raises:
        HTTPException: If repository not found or not enrolled
    """
    logger.info(f"Fetching issues for repository: {repository}, state: {state}")

    # Find installation for this repository owned by current user
    query = await db.execute(
        select(Installation).where(
            and_(
                Installation.repository == repository,
                Installation.user_id == current_user.id,
                Installation.is_active == True,  # noqa: E712
            )
        )
    )
    installation = query.scalar_one_or_none()

    if not installation:
        raise HTTPException(
            status_code=404,
            detail=f"Repository {repository} not found or not enrolled in Metis",
        )

    # Parse owner/repo
    try:
        owner, repo = repository.split("/")
    except ValueError:
        raise HTTPException(
            status_code=400, detail="Invalid repository format. Use 'owner/repo'"
        )

    # Fetch issues from GitHub
    github = GitHubService()
    try:
        github_issues = await github.get_repository_issues(
            owner=owner,
            repo=repo,
            installation_id=installation.github_installation_id,
            state=state,
        )

        # Transform to our schema
        issues = [_transform_github_issue(issue, repository) for issue in github_issues]

        logger.info(f"Found {len(issues)} issues for {repository}")
        return issues

    except Exception as e:
        logger.error(f"Failed to fetch issues from GitHub: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch issues: {str(e)}")


@router.get("/issues/{issue_number}", response_model=IssueResponse)
async def get_issue(
    issue_number: int,
    repository: str = Query(..., description="Repository in format 'owner/repo'"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> IssueResponse:
    """Get a single issue by number.

    Fetches issue dynamically from GitHub API.

    Args:
        issue_number: GitHub issue number
        repository: Repository full name (owner/repo)
        current_user: Authenticated user
        db: Database session

    Returns:
        Issue details

    Raises:
        HTTPException: If repository or issue not found
    """
    logger.info(f"Fetching issue #{issue_number} for repository: {repository}")

    # Find installation
    query = await db.execute(
        select(Installation).where(
            and_(
                Installation.repository == repository,
                Installation.user_id == current_user.id,
                Installation.is_active == True,  # noqa: E712
            )
        )
    )
    installation = query.scalar_one_or_none()

    if not installation:
        raise HTTPException(
            status_code=404,
            detail=f"Repository {repository} not found or not enrolled",
        )

    # Parse owner/repo
    try:
        owner, repo = repository.split("/")
    except ValueError:
        raise HTTPException(
            status_code=400, detail="Invalid repository format. Use 'owner/repo'"
        )

    # Fetch issue from GitHub
    github = GitHubService()
    try:
        github_issue = await github.get_issue(
            owner=owner,
            repo=repo,
            issue_number=issue_number,
            installation_id=installation.github_installation_id,
        )

        issue = _transform_github_issue(github_issue, repository)
        return issue

    except Exception as e:
        logger.error(f"Failed to fetch issue from GitHub: {e}", exc_info=True)
        if "404" in str(e):
            raise HTTPException(
                status_code=404, detail=f"Issue #{issue_number} not found"
            )
        raise HTTPException(status_code=500, detail=f"Failed to fetch issue: {str(e)}")


@router.get(
    "/issues/{issue_number}/comments", response_model=list[IssueCommentResponse]
)
async def get_issue_comments(
    issue_number: int,
    repository: str = Query(..., description="Repository in format 'owner/repo'"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[IssueCommentResponse]:
    """Get all comments for an issue.

    Fetches comments dynamically from GitHub API.

    Args:
        issue_number: GitHub issue number
        repository: Repository full name (owner/repo)
        current_user: Authenticated user
        db: Database session

    Returns:
        List of comments for the issue

    Raises:
        HTTPException: If repository or issue not found
    """
    logger.info(f"Fetching comments for issue #{issue_number} in {repository}")

    # Find installation
    query = await db.execute(
        select(Installation).where(
            and_(
                Installation.repository == repository,
                Installation.user_id == current_user.id,
                Installation.is_active == True,  # noqa: E712
            )
        )
    )
    installation = query.scalar_one_or_none()

    if not installation:
        raise HTTPException(
            status_code=404,
            detail=f"Repository {repository} not found or not enrolled",
        )

    # Parse owner/repo
    try:
        owner, repo = repository.split("/")
    except ValueError:
        raise HTTPException(
            status_code=400, detail="Invalid repository format. Use 'owner/repo'"
        )

    # Fetch comments from GitHub
    github = GitHubService()
    try:
        github_comments = await github.get_issue_comments(
            owner=owner,
            repo=repo,
            issue_number=issue_number,
            installation_id=installation.github_installation_id,
        )

        # Transform to our schema
        comments = [
            _transform_github_comment(comment, issue_number)
            for comment in github_comments
        ]

        logger.info(f"Found {len(comments)} comments for issue #{issue_number}")
        return comments

    except Exception as e:
        logger.error(f"Failed to fetch comments from GitHub: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch comments: {str(e)}"
        )


@router.get(
    "/issues/{issue_number}/agent-runs",
    response_model=list[AgentRunListItemResponse],
)
async def list_issue_agent_runs(
    issue_number: int,
    repository: str = Query(..., description="Repository in format 'owner/repo'"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[AgentRunListItemResponse]:
    """List background agent runs for one issue in a repository."""
    rows = (
        (
            await db.execute(
                select(AgentRun)
                .where(
                    and_(
                        AgentRun.user_id == current_user.id,
                        AgentRun.repository == repository,
                        AgentRun.issue_number == issue_number,
                    )
                )
                .order_by(AgentRun.created_at.desc(), AgentRun.id.desc())
            )
        )
        .scalars()
        .all()
    )
    return [_serialize_agent_run(run) for run in rows]
