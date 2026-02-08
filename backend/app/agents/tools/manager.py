"""Tool manager for organizing tools by agent type."""

from typing import Dict, Type
from app.agents.tools.base import BaseTool, ToolResult
from app.agents.tools.file_tools import (
    ReadFileTool,
    ListFilesTool,
    SearchFilesTool,
    ReplaceInFilesTool,
    CreateFileTool,
    DeleteFileTool,
)
from app.agents.tools.git_tools import (
    GitStatusTool,
    GitCreateBranchTool,
    GitCheckoutBranchTool,
    GitAddTool,
    GitCommitTool,
    GitPushTool,
    GitPullTool,
    GitBranchesTool,
)
from app.agents.tools.process_tools import (
    RunCommandTool,
    RunCodeTool,
    RunTestsTool,
    RunLinterTool,
)
from app.agents.tools.completion_tools import (
    FinishReviewTool,
    FinishTaskTool,
    FinishSummaryTool,
)
from app.agents.tools.review_posting_tools import (
    PostInlineReviewFindingTool,
    PostFileReviewFindingTool,
)
from app.db.base import AsyncSessionLocal
from app.services.github import GitHubService


class ToolManager:
    """Manages tool sets for different agent types."""

    def __init__(self, sandbox):
        """Initialize tool manager with Daytona sandbox.

        Args:
            sandbox: Daytona Sandbox instance
        """
        self.sandbox = sandbox
        self._tools: Dict[str, BaseTool] = {}

    def register_tools(self, tool_classes: list[Type[BaseTool]]) -> None:
        """Register a list of tool classes.

        Args:
            tool_classes: List of BaseTool subclasses to instantiate and register
        """
        for tool_class in tool_classes:
            tool = tool_class(self.sandbox)
            self._tools[tool.definition.name] = tool

    def register_tool_instances(self, tools: list[BaseTool]) -> None:
        """Register pre-built tool instances."""
        for tool in tools:
            self._tools[tool.definition.name] = tool

    def get_tool(self, name: str) -> BaseTool | None:
        """Get tool by name.

        Args:
            name: Tool name

        Returns:
            BaseTool instance or None if not found
        """
        return self._tools.get(name)

    def get_all_schemas(self) -> list[dict]:
        """Get OpenAI function calling schemas for all registered tools.

        Returns:
            List of tool schemas in OpenAI format
        """
        return [tool.to_openai_schema() for tool in self._tools.values()]

    def list_tool_names(self) -> list[str]:
        """List all registered tool names.

        Returns:
            List of tool names
        """
        return list(self._tools.keys())

    async def execute(self, tool_name: str, **kwargs) -> ToolResult:
        """Execute a tool by name.

        Args:
            tool_name: Name of tool to execute
            **kwargs: Tool-specific parameters

        Returns:
            ToolResult
        """
        tool = self.get_tool(tool_name)
        if not tool:
            return ToolResult(success=False, error=f"Tool not found: {tool_name}")

        return await tool.execute(**kwargs)

    async def execute_batch(self, tool_calls: list[dict]) -> Dict[str, ToolResult]:
        """Execute multiple tool calls in parallel.

        Args:
            tool_calls: List of dicts with 'id', 'name', 'arguments'

        Returns:
            Dict mapping tool call ID to result
        """
        import asyncio

        async def execute_one(call: dict):
            result = await self.execute(call["name"], **call["arguments"])
            return call["id"], result

        # Execute all in parallel
        tasks = [execute_one(call) for call in tool_calls]
        completed = await asyncio.gather(*tasks)

        return {call_id: result for call_id, result in completed}


# Fine-Grained Tool Sets for Different Agent Types


def get_reviewer_tools(
    sandbox,
    review_id: str,
    installation_token: str,
    owner: str,
    repo: str,
    pr_number: int,
    commit_sha: str,
) -> ToolManager:
    """Get tools for code review agent.

    Focus: Read-only operations + running tests/linters for verification.

    Tools:
    - File: read, list, search
    - Git: status, branches
    - Process: run tests, run linter, run command
    - Completion: finish_review

    Args:
        sandbox: Daytona Sandbox instance

    Returns:
        ToolManager with reviewer-specific tools
    """
    manager = ToolManager(sandbox)
    manager.register_tools(
        [
            # File operations (read-only)
            ReadFileTool,
            ListFilesTool,
            SearchFilesTool,
            # Git operations (status only)
            GitStatusTool,
            GitBranchesTool,
            # Execution (verification)
            RunTestsTool,
            RunLinterTool,
            RunCommandTool,
            # Completion
            FinishReviewTool,
        ]
    )
    github = GitHubService()
    manager.register_tool_instances(
        [
            PostInlineReviewFindingTool(
                sandbox=sandbox,
                github_service=github,
                session_factory=AsyncSessionLocal,
                review_id=review_id,
                installation_token=installation_token,
                owner=owner,
                repo=repo,
                pr_number=pr_number,
                commit_sha=commit_sha,
            ),
            PostFileReviewFindingTool(
                sandbox=sandbox,
                github_service=github,
                session_factory=AsyncSessionLocal,
                review_id=review_id,
                installation_token=installation_token,
                owner=owner,
                repo=repo,
                pr_number=pr_number,
                commit_sha=commit_sha,
            ),
        ]
    )
    return manager


def get_coder_tools(sandbox) -> ToolManager:
    """Get tools for background coder agent (Issue → PR).

    Focus: Full CRUD operations + git workflow for creating PRs.

    Tools:
    - File: read, list, search, replace, create, delete
    - Git: full workflow (branch, checkout, add, commit, push)
    - Process: run code, run tests, run linter, run command
    - Completion: finish_task

    Args:
        sandbox: Daytona Sandbox instance

    Returns:
        ToolManager with coder-specific tools
    """
    manager = ToolManager(sandbox)
    manager.register_tools(
        [
            # File operations (full CRUD)
            ReadFileTool,
            ListFilesTool,
            SearchFilesTool,
            ReplaceInFilesTool,
            CreateFileTool,
            DeleteFileTool,
            # Git operations (full workflow)
            GitStatusTool,
            GitBranchesTool,
            GitCreateBranchTool,
            GitCheckoutBranchTool,
            GitAddTool,
            GitCommitTool,
            GitPushTool,
            GitPullTool,
            # Execution (development)
            RunCodeTool,
            RunTestsTool,
            RunLinterTool,
            RunCommandTool,
            # Completion
            FinishTaskTool,
        ]
    )
    return manager


def get_summary_tools(sandbox) -> ToolManager:
    """Get tools for summary agent.

    Focus: Minimal read-only operations for understanding changes.

    Tools:
    - File: read, list
    - Git: status

    Args:
        sandbox: Daytona Sandbox instance

    Returns:
        ToolManager with summary-specific tools
    """
    manager = ToolManager(sandbox)
    manager.register_tools(
        [
            # File operations (minimal read-only)
            ReadFileTool,
            ListFilesTool,
            SearchFilesTool,
            # Git operations (status only)
            GitStatusTool,
            # Completion
            FinishSummaryTool,
        ]
    )
    return manager
