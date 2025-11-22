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
                "Focus only on critical bugs and security issues. "
                "Skip minor style or formatting concerns."
            ),
            SensitivityLevel.MEDIUM: (
                "Review for bugs, security issues, and significant code quality problems. "
                "Mention style issues if they impact readability."
            ),
            SensitivityLevel.HIGH: (
                "Conduct a thorough review covering all aspects: bugs, security, "
                "performance, style, documentation, and best practices."
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
