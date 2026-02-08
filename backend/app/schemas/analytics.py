"""Schemas for analytics endpoints."""

from datetime import date

from pydantic import BaseModel, Field


class AnalyticsCardResponse(BaseModel):
    """Single KPI card value for analytics page."""

    key: str = Field(..., description="Stable key identifier")
    label: str = Field(..., description="Card title")
    value: float = Field(..., description="Numeric value")
    display_value: str = Field(..., description="Pre-formatted display text")
    description: str = Field(..., description="What this metric means")


class SeverityDailyPoint(BaseModel):
    """Daily findings breakdown by severity."""

    date: date
    INFO: int
    WARNING: int
    ERROR: int
    CRITICAL: int
    total: int


class CategoryDailyPoint(BaseModel):
    """Daily findings breakdown by category."""

    date: date
    BUG: int
    SECURITY: int
    PERFORMANCE: int
    STYLE: int
    MAINTAINABILITY: int
    DOCUMENTATION: int
    TESTING: int
    total: int


class AnalyticsOverviewResponse(BaseModel):
    """Analytics payload for the Statistics tab."""

    repository: str
    window_days: int
    cards: list[AnalyticsCardResponse]
    severity_chart: list[SeverityDailyPoint]
    category_chart: list[CategoryDailyPoint]


class DashboardAnalyticsResponse(BaseModel):
    """Analytics payload for dashboard page cards."""

    repository: str
    window_days: int
    cards: list[AnalyticsCardResponse]


class SidebarAnalyticsResponse(BaseModel):
    """Analytics payload for sidebar cards."""

    repository: str
    window_days: int
    cards: list[AnalyticsCardResponse]
