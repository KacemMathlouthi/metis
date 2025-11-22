"""Configuration schemas for Metis AI agent.

This module defines configuration classes for the AI reviewer and summary writer,
including sensitivity levels and LLM parameters.
"""

from enum import Enum

from app.core.config import settings


class SensitivityLevel(str, Enum):
    """Code review sensitivity levels."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class ReviewerConfig:
    """Configuration for AI code reviewer.

    Attributes:
        sensitivity: Review sensitivity level (low/medium/high)
        user_instructions: Custom instructions to append to system prompt
        temperature: LLM temperature for response generation
        max_tokens: Maximum tokens in LLM response
        model: LLM model to use
    """

    def __init__(
        self,
        sensitivity: SensitivityLevel = SensitivityLevel.MEDIUM,
        user_instructions: str = "",
        temperature: float = 0.3,
        max_tokens: int = 2000,
        model: str | None = None,
    ) -> None:
        """Initialize reviewer configuration.

        Args:
            sensitivity: Review sensitivity level
            user_instructions: Additional instructions for the AI reviewer
            temperature: LLM temperature (0.0-1.0)
            max_tokens: Maximum response tokens
            model: Model name override (defaults to settings)
        """
        self.sensitivity = sensitivity
        self.user_instructions = user_instructions
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.model = model or settings.AI_MODEL

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


class SummaryConfig:
    """Configuration for AI summary writer.

    Attributes:
        user_instructions: Custom instructions for summary generation
        temperature: LLM temperature
        max_tokens: Maximum tokens in response
        model: LLM model to use
    """

    def __init__(
        self,
        user_instructions: str = "",
        temperature: float = 0.5,
        max_tokens: int = 1000,
        model: str | None = None,
    ) -> None:
        """Initialize summary configuration.

        Args:
            user_instructions: Additional instructions for summary writer
            temperature: LLM temperature (0.0-1.0)
            max_tokens: Maximum response tokens
            model: Model name override (defaults to settings)
        """
        self.user_instructions = user_instructions
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.model = model or settings.MODEL_NAME
