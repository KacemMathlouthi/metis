"""Base classes for agent tools."""

from abc import ABC, abstractmethod
from typing import Any

from pydantic import BaseModel, Field


class ToolDefinition(BaseModel):
    """OpenAI function calling format tool definition."""

    name: str
    description: str
    parameters: dict[str, Any]


class ToolResult(BaseModel):
    """Result from tool execution."""

    success: bool
    data: Any = None
    error: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class BaseTool(ABC):
    """Base class for all Daytona-powered tools."""

    def __init__(self, sandbox):
        """Initialize tool with Daytona sandbox.

        Args:
            sandbox: Daytona Sandbox instance
        """
        self.sandbox = sandbox

    @property
    @abstractmethod
    def definition(self) -> ToolDefinition:
        """Return tool definition for LLM function calling."""

    @abstractmethod
    async def execute(self, **kwargs) -> ToolResult:
        """Execute tool using Daytona SDK.

        Args:
            **kwargs: Tool-specific parameters

        Returns:
            ToolResult with success/data/error
        """

    def to_openai_schema(self) -> dict[str, Any]:
        """Convert to OpenAI function calling schema.

        Returns:
            Dict in OpenAI function calling format
        """
        return {
            "type": "function",
            "function": {
                "name": self.definition.name,
                "description": self.definition.description,
                "parameters": self.definition.parameters,
            },
        }
