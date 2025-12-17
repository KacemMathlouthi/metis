"""Base classes for agent tools."""

from abc import ABC, abstractmethod
from pydantic import BaseModel, Field
from typing import Any, Dict


class ToolDefinition(BaseModel):
    """OpenAI function calling format tool definition."""

    name: str
    description: str
    parameters: Dict[str, Any]


class ToolResult(BaseModel):
    """Result from tool execution."""

    success: bool
    data: Any = None
    error: str | None = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


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
        pass

    @abstractmethod
    async def execute(self, **kwargs) -> ToolResult:
        """Execute tool using Daytona SDK.

        Args:
            **kwargs: Tool-specific parameters

        Returns:
            ToolResult with success/data/error
        """
        pass

    def to_openai_schema(self) -> Dict[str, Any]:
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
