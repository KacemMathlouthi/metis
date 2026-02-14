"""Review comment API endpoints."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth_deps import get_current_user
from app.db.session import get_db
from app.models.installation import Installation
from app.models.review import Review, ReviewComment
from app.models.user import User
from app.schemas.review_comment import (
    ReviewCommentListItemResponse,
    ReviewCommentListResponse,
    ReviewCommentWithContextResponse,
    ReviewContextResponse,
)

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
REVIEW_STATUS_VALUES = {"PENDING", "PROCESSING", "COMPLETED", "FAILED"}

router = APIRouter(prefix="/review-comments")


def _normalize_optional(value: str | None) -> str | None:
    if value is None:
        return None
    return value.strip().upper()


def _validate_enum(value: str | None, allowed: set[str], field_name: str) -> str | None:
    normalized = _normalize_optional(value)
    if normalized is None:
        return None
    if normalized not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid {field_name} '{value}'. Allowed values: {sorted(allowed)}",
        )
    return normalized


def _derive_title(comment_title: str | None, comment_text: str) -> str:
    """Return a non-empty title for legacy rows that may have null titles."""
    if comment_title and comment_title.strip():
        return comment_title.strip()[:255]

    for line in comment_text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        # Prefer markdown heading if available.
        if stripped.startswith("#"):
            heading = stripped.lstrip("#").strip()
            if heading:
                return heading[:255]
        return stripped[:255]

    return "Untitled finding"


def _serialize_row(
    row: tuple[ReviewComment, Review],
) -> ReviewCommentWithContextResponse:
    comment, review = row
    return ReviewCommentWithContextResponse(
        comment=ReviewCommentListItemResponse(
            id=comment.id,
            review_id=comment.review_id,
            title=_derive_title(comment.title, comment.comment_text),
            file_path=comment.file_path,
            line_number=comment.line_number,
            line_end=comment.line_end,
            comment_text=comment.comment_text,
            severity=str(comment.severity),
            category=str(comment.category),
            github_comment_id=comment.github_comment_id,
            created_at=comment.created_at,
        ),
        review=ReviewContextResponse(
            repository=review.repository,
            pr_number=review.pr_number,
            review_status=str(review.status),
            commit_sha=review.commit_sha,
        ),
    )


@router.get("", response_model=ReviewCommentListResponse)
async def list_review_comments(
    repository: str = Query(..., description="Repository in format 'owner/repo'"),
    review_id: UUID | None = Query(None, description="Filter by review UUID"),
    severity: str | None = Query(None, description="INFO, WARNING, ERROR, CRITICAL"),
    category: str | None = Query(
        None,
        description="BUG, SECURITY, PERFORMANCE, STYLE, MAINTAINABILITY, DOCUMENTATION, TESTING",
    ),
    review_status: str | None = Query(None, description="PENDING, PROCESSING, COMPLETED, FAILED"),
    created_from: datetime | None = Query(
        None, description="Include comments created on/after this ISO timestamp"
    ),
    created_to: datetime | None = Query(
        None, description="Include comments created on/before this ISO timestamp"
    ),
    page: int = Query(1, ge=1, description="1-based page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ReviewCommentListResponse:
    """List review comments with pagination and filters."""
    normalized_severity = _validate_enum(severity, SEVERITY_VALUES, "severity")
    normalized_category = _validate_enum(category, CATEGORY_VALUES, "category")
    normalized_review_status = _validate_enum(review_status, REVIEW_STATUS_VALUES, "review_status")

    review_filters = [
        Installation.user_id == current_user.id,
        Review.repository == repository,
    ]
    if review_id:
        review_filters.append(Review.id == review_id)
    if normalized_review_status:
        review_filters.append(Review.status == normalized_review_status)

    # Scope once to this user's reviews for the selected repository.
    # Then fetch comments by review_id (no Python-side ID materialization).
    reviews_subquery = (
        select(Review.id.label("review_id"))
        .join(Installation, Installation.id == Review.installation_id)
        .where(and_(*review_filters))
        .subquery()
    )

    comment_filters = [
        ReviewComment.review_id == reviews_subquery.c.review_id,
    ]
    if normalized_severity:
        comment_filters.append(ReviewComment.severity == normalized_severity)
    if normalized_category:
        comment_filters.append(ReviewComment.category == normalized_category)
    if created_from:
        comment_filters.append(ReviewComment.created_at >= created_from)
    if created_to:
        comment_filters.append(ReviewComment.created_at <= created_to)

    base_query = (
        select(ReviewComment, Review)
        .join(reviews_subquery, reviews_subquery.c.review_id == ReviewComment.review_id)
        .join(Review, Review.id == ReviewComment.review_id)
        .where(and_(*comment_filters))
    )

    count_query = (
        select(func.count())
        .select_from(ReviewComment)
        .join(reviews_subquery, reviews_subquery.c.review_id == ReviewComment.review_id)
        .where(and_(*comment_filters))
    )

    total = int((await db.execute(count_query)).scalar_one() or 0)
    offset = (page - 1) * page_size

    rows = (
        await db.execute(
            base_query.order_by(
                ReviewComment.created_at.desc(),
                ReviewComment.id.desc(),
            )
            .offset(offset)
            .limit(page_size)
        )
    ).all()

    return ReviewCommentListResponse(
        items=[_serialize_row(row) for row in rows],
        total=total,
        page=page,
        page_size=page_size,
    )
