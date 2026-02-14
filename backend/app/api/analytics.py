"""Analytics API endpoints."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy import and_, case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth_deps import get_current_user
from app.db.session import get_db
from app.models.installation import Installation
from app.models.review import Review, ReviewComment
from app.models.user import User
from app.schemas.analytics import (
    AnalyticsCardResponse,
    AnalyticsOverviewResponse,
    CategoryDailyPoint,
    DashboardAnalyticsResponse,
    SidebarAnalyticsResponse,
    SeverityDailyPoint,
)

router = APIRouter(prefix="/analytics")

SEVERITY_ORDER = ["INFO", "WARNING", "ERROR", "CRITICAL"]
CATEGORY_ORDER = [
    "BUG",
    "SECURITY",
    "PERFORMANCE",
    "STYLE",
    "MAINTAINABILITY",
    "DOCUMENTATION",
    "TESTING",
]
WINDOW_DAYS = 7
DASHBOARD_WINDOW_DAYS = 30
SIDEBAR_WINDOW_DAYS = 30


def _enum_to_str(value: Any) -> str:
    if hasattr(value, "value"):
        return str(value.value)
    return str(value)


def _window_bounds(days: int) -> tuple[datetime, datetime]:
    """Return [start, end) bounds in UTC for the last N calendar days."""
    now = datetime.now(timezone.utc)
    end = datetime.combine(
        now.date() + timedelta(days=1),
        datetime.min.time(),
        tzinfo=timezone.utc,
    )
    start = end - timedelta(days=days)
    return start, end


async def _load_window_metrics(
    db: AsyncSession,
    reviews_subquery,
    window_start: datetime,
    window_end: datetime,
) -> dict[str, float]:
    query = (
        select(
            func.count(ReviewComment.id).label("total_findings"),
            func.count(func.distinct(Review.pr_number)).label("affected_pull_requests"),
        )
        .select_from(ReviewComment)
        .join(reviews_subquery, reviews_subquery.c.review_id == ReviewComment.review_id)
        .join(Review, Review.id == ReviewComment.review_id)
        .where(
            and_(
                ReviewComment.created_at >= window_start,
                ReviewComment.created_at < window_end,
            )
        )
    )
    row = (await db.execute(query)).one()
    total_findings = float(row.total_findings or 0)
    affected_pull_requests = float(row.affected_pull_requests or 0)

    return {
        "total_findings": total_findings,
        "affected_pull_requests": affected_pull_requests,
    }


def _scoped_reviews_subquery(repository: str, user_id):
    return (
        select(Review.id.label("review_id"))
        .join(Installation, Installation.id == Review.installation_id)
        .where(
            and_(
                Installation.user_id == user_id,
                Installation.is_active == True,  # noqa: E712
                Review.repository == repository,
            )
        )
        .subquery()
    )


@router.get("/overview", response_model=AnalyticsOverviewResponse)
async def get_analytics_overview(
    repository: str = Query(..., description="Repository in format 'owner/repo'"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AnalyticsOverviewResponse:
    """Return analytics cards and 7-day findings charts for a repository."""
    window_start, window_end = _window_bounds(WINDOW_DAYS)

    reviews_subquery = _scoped_reviews_subquery(repository, current_user.id)

    metrics = await _load_window_metrics(db, reviews_subquery, window_start, window_end)

    review_metrics_row = (
        await db.execute(
            select(
                func.count(Review.id).label("total_reviews"),
                func.sum(case((Review.status == "COMPLETED", 1), else_=0)).label(
                    "completed_reviews"
                ),
                func.avg(
                    case(
                        (
                            Review.status == "COMPLETED",
                            func.extract("epoch", Review.updated_at - Review.created_at),
                        ),
                        else_=None,
                    )
                ).label("avg_latency_seconds"),
            )
            .join(reviews_subquery, reviews_subquery.c.review_id == Review.id)
            .where(
                and_(
                    Review.created_at >= window_start,
                    Review.created_at < window_end,
                )
            )
        )
    ).one()

    total_reviews = float(review_metrics_row.total_reviews or 0)
    completed_reviews = float(review_metrics_row.completed_reviews or 0)
    review_completion_rate = (completed_reviews / total_reviews * 100) if total_reviews else 0.0
    avg_latency_seconds = float(review_metrics_row.avg_latency_seconds or 0)
    avg_latency_seconds_value = avg_latency_seconds if avg_latency_seconds else 0.0

    cards = [
        AnalyticsCardResponse(
            key="total_findings",
            label="AI Findings (7d)",
            value=metrics["total_findings"],
            display_value=str(int(metrics["total_findings"])),
            description="Findings detected over the last 7 days.",
        ),
        AnalyticsCardResponse(
            key="completed_reviews",
            label="Completed Reviews (7d)",
            value=completed_reviews,
            display_value=str(int(completed_reviews)),
            description="Reviews completed over the last 7 days.",
        ),
        AnalyticsCardResponse(
            key="affected_pull_requests",
            label="PRs With Findings (7d)",
            value=metrics["affected_pull_requests"],
            display_value=str(int(metrics["affected_pull_requests"])),
            description="Distinct PRs with at least one finding.",
        ),
        AnalyticsCardResponse(
            key="avg_review_latency_seconds",
            label="Avg Review Latency",
            value=avg_latency_seconds_value,
            display_value=f"{avg_latency_seconds_value:.2f}s",
            description=(
                f"Average processing time for completed reviews "
                f"(completion rate: {review_completion_rate:.1f}%)."
            ),
        ),
    ]

    day_expr = func.date_trunc("day", ReviewComment.created_at).label("day")
    base_filters = and_(
        ReviewComment.created_at >= window_start,
        ReviewComment.created_at < window_end,
    )

    severity_rows = (
        await db.execute(
            select(day_expr, ReviewComment.severity, func.count().label("count"))
            .join(
                reviews_subquery,
                reviews_subquery.c.review_id == ReviewComment.review_id,
            )
            .where(base_filters)
            .group_by(day_expr, ReviewComment.severity)
        )
    ).all()

    category_rows = (
        await db.execute(
            select(day_expr, ReviewComment.category, func.count().label("count"))
            .join(
                reviews_subquery,
                reviews_subquery.c.review_id == ReviewComment.review_id,
            )
            .where(base_filters)
            .group_by(day_expr, ReviewComment.category)
        )
    ).all()

    day_buckets = [window_start.date() + timedelta(days=i) for i in range(WINDOW_DAYS)]

    severity_map = {day: {key: 0 for key in SEVERITY_ORDER} for day in day_buckets}
    for row in severity_rows:
        day = row.day.date()
        key = _enum_to_str(row.severity)
        if day in severity_map and key in severity_map[day]:
            severity_map[day][key] = int(row.count or 0)

    severity_chart = [
        SeverityDailyPoint(
            date=day,
            INFO=severity_map[day]["INFO"],
            WARNING=severity_map[day]["WARNING"],
            ERROR=severity_map[day]["ERROR"],
            CRITICAL=severity_map[day]["CRITICAL"],
            total=sum(severity_map[day].values()),
        )
        for day in day_buckets
    ]

    category_map = {day: {key: 0 for key in CATEGORY_ORDER} for day in day_buckets}
    for row in category_rows:
        day = row.day.date()
        key = _enum_to_str(row.category)
        if day in category_map and key in category_map[day]:
            category_map[day][key] = int(row.count or 0)

    category_chart = [
        CategoryDailyPoint(
            date=day,
            BUG=category_map[day]["BUG"],
            SECURITY=category_map[day]["SECURITY"],
            PERFORMANCE=category_map[day]["PERFORMANCE"],
            STYLE=category_map[day]["STYLE"],
            MAINTAINABILITY=category_map[day]["MAINTAINABILITY"],
            DOCUMENTATION=category_map[day]["DOCUMENTATION"],
            TESTING=category_map[day]["TESTING"],
            total=sum(category_map[day].values()),
        )
        for day in day_buckets
    ]

    return AnalyticsOverviewResponse(
        repository=repository,
        window_days=WINDOW_DAYS,
        cards=cards,
        severity_chart=severity_chart,
        category_chart=category_chart,
    )


@router.get("/dashboard", response_model=DashboardAnalyticsResponse)
async def get_dashboard_analytics(
    repository: str = Query(..., description="Repository in format 'owner/repo'"),
    days: int = Query(
        DASHBOARD_WINDOW_DAYS,
        ge=1,
        le=365,
        description="Rolling window length in days",
    ),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DashboardAnalyticsResponse:
    """Return dashboard card metrics for a repository."""
    window_start, window_end = _window_bounds(days)
    reviews_subquery = _scoped_reviews_subquery(repository, current_user.id)

    review_metrics = (
        await db.execute(
            select(
                func.count(func.distinct(Review.pr_number))
                .filter(Review.status == "COMPLETED")
                .label("prs_reviewed"),
                func.count(Review.id)
                .filter(Review.status == "COMPLETED")
                .label("completed_reviews"),
                func.avg(
                    case(
                        (
                            Review.status == "COMPLETED",
                            func.extract("epoch", Review.updated_at - Review.created_at),
                        ),
                        else_=None,
                    )
                ).label("avg_latency_seconds"),
            )
            .join(reviews_subquery, reviews_subquery.c.review_id == Review.id)
            .where(
                and_(
                    Review.created_at >= window_start,
                    Review.created_at < window_end,
                )
            )
        )
    ).one()

    prs_reviewed = float(review_metrics.prs_reviewed or 0)
    avg_latency_seconds = float(review_metrics.avg_latency_seconds or 0)

    issues_detected = float(
        (
            await db.execute(
                select(func.count(ReviewComment.id))
                .join(
                    reviews_subquery,
                    reviews_subquery.c.review_id == ReviewComment.review_id,
                )
                .where(
                    and_(
                        ReviewComment.created_at >= window_start,
                        ReviewComment.created_at < window_end,
                    )
                )
            )
        ).scalar_one()
        or 0
    )

    cards = [
        AnalyticsCardResponse(
            key="prs_reviewed",
            label="PRs Reviewed",
            value=prs_reviewed,
            display_value=str(int(prs_reviewed)),
            description=f"Distinct PRs completed in the last {days} days.",
        ),
        AnalyticsCardResponse(
            key="issues_detected",
            label="Issues Detected",
            value=issues_detected,
            display_value=str(int(issues_detected)),
            description=f"Findings generated in the last {days} days.",
        ),
        AnalyticsCardResponse(
            key="avg_review_latency_seconds",
            label="Avg Review Latency",
            value=avg_latency_seconds,
            display_value=f"{avg_latency_seconds:.2f}s",
            description=f"Average latency for completed reviews in the last {days} days.",
        ),
    ]

    return DashboardAnalyticsResponse(
        repository=repository,
        window_days=days,
        cards=cards,
    )


@router.get("/sidebar", response_model=SidebarAnalyticsResponse)
async def get_sidebar_analytics(
    repository: str = Query(..., description="Repository in format 'owner/repo'"),
    days: int = Query(
        SIDEBAR_WINDOW_DAYS,
        ge=1,
        le=365,
        description="Rolling window length in days",
    ),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SidebarAnalyticsResponse:
    """Return compact sidebar card metrics for a repository."""
    window_start, window_end = _window_bounds(days)
    reviews_subquery = _scoped_reviews_subquery(repository, current_user.id)

    review_row = (
        await db.execute(
            select(
                func.count(Review.id)
                .filter(Review.status == "COMPLETED")
                .label("completed_reviews"),
                func.count(func.distinct(Review.pr_number))
                .filter(Review.status == "COMPLETED")
                .label("prs_reviewed"),
                func.avg(
                    case(
                        (
                            Review.status == "COMPLETED",
                            func.extract("epoch", Review.updated_at - Review.created_at),
                        ),
                        else_=None,
                    )
                ).label("avg_latency_seconds"),
            )
            .join(reviews_subquery, reviews_subquery.c.review_id == Review.id)
            .where(
                and_(
                    Review.created_at >= window_start,
                    Review.created_at < window_end,
                )
            )
        )
    ).one()

    findings = float(
        (
            await db.execute(
                select(func.count(ReviewComment.id))
                .join(
                    reviews_subquery,
                    reviews_subquery.c.review_id == ReviewComment.review_id,
                )
                .where(
                    and_(
                        ReviewComment.created_at >= window_start,
                        ReviewComment.created_at < window_end,
                    )
                )
            )
        ).scalar_one()
        or 0
    )

    prs_reviewed = float(review_row.prs_reviewed or 0)
    completed_reviews = float(review_row.completed_reviews or 0)
    avg_latency_seconds = float(review_row.avg_latency_seconds or 0)

    cards = [
        AnalyticsCardResponse(
            key="prs_reviewed",
            label="PRs",
            value=prs_reviewed,
            display_value=str(int(prs_reviewed)),
            description=f"Distinct completed PRs in the last {days} days.",
        ),
        AnalyticsCardResponse(
            key="findings_detected",
            label="Findings",
            value=findings,
            display_value=str(int(findings)),
            description=f"Findings generated in the last {days} days.",
        ),
        AnalyticsCardResponse(
            key="completed_reviews",
            label="Completed",
            value=completed_reviews,
            display_value=str(int(completed_reviews)),
            description=f"Completed review runs in the last {days} days.",
        ),
        AnalyticsCardResponse(
            key="avg_review_latency_seconds",
            label="Latency",
            value=avg_latency_seconds,
            display_value=f"{avg_latency_seconds:.2f}s",
            description=f"Average latency for completed reviews in the last {days} days.",
        ),
    ]

    return SidebarAnalyticsResponse(
        repository=repository,
        window_days=days,
        cards=cards,
    )
