"""Configuration schemas for Metis AI agent.

This module defines configuration classes for the AI reviewer and summary writer,
including sensitivity levels and LLM parameters.
"""

from enum import Enum

from pydantic import BaseModel, Field

from app.core.config import settings


class SensitivityLevel(str, Enum):
    """Code review sensitivity levels."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class ReviewerConfig(BaseModel):
    """Configuration for AI code reviewer."""

    sensitivity: SensitivityLevel = Field(
        default=SensitivityLevel.MEDIUM,
        description="Review sensitivity level (low/medium/high)",
    )
    user_instructions: str = Field(
        default="",
        description="Custom instructions to append to system prompt",
    )
    temperature: float = Field(
        default=0.3,
        ge=0.0,
        le=1.0,
        description="LLM temperature for response generation",
    )
    max_tokens: int = Field(
        default=8192,
        gt=0,
        description="Maximum tokens in LLM response",
    )
    model: str = Field(
        default_factory=lambda: settings.MODEL_NAME,
        description="LLM model to use",
    )

    def get_sensitivity_instructions(self) -> str:
        """Get sensitivity-specific instructions.

        Returns:
            Instructions text based on sensitivity level.
        """
        sensitivity_map = {
            SensitivityLevel.LOW: (
                "EXTRA STRICT: Only flag critical bugs, security vulnerabilities, and data corruption risks. "
                "Ignore everything else - no suggestions, no style comments, no improvements. "
                "If there are no critical issues, approve immediately."
            ),
            SensitivityLevel.MEDIUM: (
                "Focus on bugs, security issues, resource leaks, and poor error handling. "
                "Skip minor style issues, naming preferences, and theoretical improvements. "
                "Limit your review to 3-5 most important issues."
            ),
            SensitivityLevel.HIGH: (
                "Thorough review including bugs, security, performance, design issues, and missing tests. "
                "Still prioritize critical issues first. "
                "Keep the review focused and actionable - avoid listing every minor issue."
            ),
        }
        return sensitivity_map[self.sensitivity]


class SummaryConfig(BaseModel):
    """Configuration for AI summary writer."""

    user_instructions: str = Field(
        default="",
        description="Custom instructions for summary generation",
    )
    temperature: float = Field(
        default=0.1,
        ge=0.0,
        le=1.0,
        description="LLM temperature",
    )
    max_tokens: int = Field(
        default=8192,
        gt=0,
        description="Maximum tokens in response",
    )
    model: str = Field(
        default_factory=lambda: settings.MODEL_NAME,
        description="LLM model to use",
    )
