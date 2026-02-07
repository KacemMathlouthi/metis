"""Tools for progressive posting of review findings to GitHub."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from sqlalchemy.ext.asyncio import async_sessionmaker

from app.agents.tools.base import BaseTool, ToolDefinition, ToolResult
from app.models.review import ReviewComment
from app.services.github import GitHubService


SEVERITY_VALUES = {"INFO", "WARNING", "ERROR", "CRITICAL"}
CATEGORY_VALUES = {
    "BUG",
    "SECURITY",
    "PERFORMANCE",
    "STYLE",
    "MAINTAINABILITY",
    "DOCUMENTATION",
    "TESTING",
}


@lru_cache(maxsize=1)
def _load_see_more_svg() -> str:
    """Load SVG footer appended to each finding body."""
    svg_path = Path(__file__).resolve().parents[4] / "static" / "metis-see-more.svg"
    if not svg_path.exists():
        return ""
    return svg_path.read_text(encoding="utf-8").strip()


def _normalize_severity(severity: str) -> str:
    normalized = severity.strip().upper()
    if normalized not in SEVERITY_VALUES:
        raise ValueError(
            f"Invalid severity '{severity}'. Expected one of: {sorted(SEVERITY_VALUES)}"
        )
    return normalized


def _normalize_category(category: str) -> str:
    normalized = category.strip().upper()
    if normalized not in CATEGORY_VALUES:
        raise ValueError(
            f"Invalid category '{category}'. Expected one of: {sorted(CATEGORY_VALUES)}"
        )
    return normalized


def _build_finding_body(
    issue: str,
    proposed_fix: str,
    severity: str,
    category: str,
) -> str:
    body = (
        f"**[{severity}][{category}]** {issue}\n\n"
        f"**Proposed fix:**\n{proposed_fix}"
    )
    svg_footer = _load_see_more_svg()
    if svg_footer:
        body = f"{body}\n\n{svg_footer}"
    return body


class PostInlineReviewFindingTool(BaseTool):
    """Post inline review finding to GitHub and persist it."""

    def __init__(
        self,
        sandbox,
        github_service: GitHubService,
        session_factory: async_sessionmaker,
        review_id: str,
        installation_id: int,
        owner: str,
        repo: str,
        pr_number: int,
    ):
        super().__init__(sandbox)
        self.github_service = github_service
        self.session_factory = session_factory
        self.review_id = review_id
        self.installation_id = installation_id
        self.owner = owner
        self.repo = repo
        self.pr_number = pr_number

    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="post_inline_finding",
            description=(
                "Post one inline finding on the pull request at a specific file/line. "
                "Use this progressively as you discover issues."
            ),
            parameters={
                "type": "object",
                "properties": {
                    "file_path": {
                        "type": "string",
                        "description": "Path of the file in repository",
                    },
                    "line_number": {
                        "type": "integer",
                        "description": "Line number on the RIGHT side of the diff",
                    },
                    "line_end": {
                        "type": "integer",
                        "description": "Optional ending line for multi-line finding",
                    },
                    "severity": {
                        "type": "string",
                        "enum": sorted(SEVERITY_VALUES),
                    },
                    "category": {
                        "type": "string",
                        "enum": sorted(CATEGORY_VALUES),
                    },
                    "issue": {
                        "type": "string",
                        "description": "Clear issue description",
                    },
                    "proposed_fix": {
                        "type": "string",
                        "description": "Concrete proposed fix",
                    },
                },
                "required": [
                    "file_path",
                    "line_number",
                    "severity",
                    "category",
                    "issue",
                    "proposed_fix",
                ],
            },
        )

    async def execute(
        self,
        file_path: str,
        line_number: int,
        severity: str,
        category: str,
        issue: str,
        proposed_fix: str,
        line_end: int | None = None,
        **kwargs,
    ) -> ToolResult:
        try:
            normalized_severity = _normalize_severity(severity)
            normalized_category = _normalize_category(category)
            body = _build_finding_body(
                issue=issue,
                proposed_fix=proposed_fix,
                severity=normalized_severity,
                category=normalized_category,
            )

            gh_comment = await self.github_service.create_pr_inline_comment(
                owner=self.owner,
                repo=self.repo,
                pr_number=self.pr_number,
                installation_id=self.installation_id,
                body=body,
                path=file_path,
                line=line_end or line_number,
                start_line=line_number if line_end else None,
            )

            async with self.session_factory() as db:
                comment = ReviewComment(
                    review_id=self.review_id,
                    file_path=file_path,
                    line_number=line_number,
                    line_end=line_end,
                    comment_text=body,
                    severity=normalized_severity,
                    category=normalized_category,
                    github_comment_id=gh_comment.get("id"),
                )
                db.add(comment)
                await db.commit()

            return ToolResult(
                success=True,
                data={
                    "posted": True,
                    "github_comment_id": gh_comment.get("id"),
                    "file_path": file_path,
                    "line_number": line_number,
                    "line_end": line_end,
                },
            )
        except Exception as e:
            return ToolResult(success=False, error=str(e))


class PostFileReviewFindingTool(BaseTool):
    """Post file-level review finding to GitHub and persist it."""

    def __init__(
        self,
        sandbox,
        github_service: GitHubService,
        session_factory: async_sessionmaker,
        review_id: str,
        installation_id: int,
        owner: str,
        repo: str,
        pr_number: int,
        commit_sha: str,
    ):
        super().__init__(sandbox)
        self.github_service = github_service
        self.session_factory = session_factory
        self.review_id = review_id
        self.installation_id = installation_id
        self.owner = owner
        self.repo = repo
        self.pr_number = pr_number
        self.commit_sha = commit_sha

    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="post_file_finding",
            description=(
                "Post one file-level finding (no specific line) on the pull request. "
                "Use this when issue spans the file."
            ),
            parameters={
                "type": "object",
                "properties": {
                    "file_path": {
                        "type": "string",
                        "description": "Path of the file in repository",
                    },
                    "severity": {
                        "type": "string",
                        "enum": sorted(SEVERITY_VALUES),
                    },
                    "category": {
                        "type": "string",
                        "enum": sorted(CATEGORY_VALUES),
                    },
                    "issue": {
                        "type": "string",
                        "description": "Clear issue description",
                    },
                    "proposed_fix": {
                        "type": "string",
                        "description": "Concrete proposed fix",
                    },
                },
                "required": ["file_path", "severity", "category", "issue", "proposed_fix"],
            },
        )

    async def execute(
        self,
        file_path: str,
        severity: str,
        category: str,
        issue: str,
        proposed_fix: str,
        **kwargs,
    ) -> ToolResult:
        try:
            normalized_severity = _normalize_severity(severity)
            normalized_category = _normalize_category(category)
            body = _build_finding_body(
                issue=issue,
                proposed_fix=proposed_fix,
                severity=normalized_severity,
                category=normalized_category,
            )

            gh_comment = await self.github_service.create_pr_file_comment(
                owner=self.owner,
                repo=self.repo,
                pr_number=self.pr_number,
                installation_id=self.installation_id,
                body=body,
                path=file_path,
                commit_id=self.commit_sha,
            )

            async with self.session_factory() as db:
                comment = ReviewComment(
                    review_id=self.review_id,
                    file_path=file_path,
                    # No schema change requested; keep sentinel line for file-level findings.
                    line_number=1,
                    line_end=None,
                    comment_text=body,
                    severity=normalized_severity,
                    category=normalized_category,
                    github_comment_id=gh_comment.get("id"),
                )
                db.add(comment)
                await db.commit()

            return ToolResult(
                success=True,
                data={
                    "posted": True,
                    "github_comment_id": gh_comment.get("id"),
                    "file_path": file_path,
                    "level": "file",
                },
            )
        except Exception as e:
            return ToolResult(success=False, error=str(e))
