"""Completion tools for agents to signal task completion."""

from app.agents.tools.base import BaseTool, ToolDefinition, ToolResult


class FinishReviewTool(BaseTool):
    """Signal that code review is complete."""

    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="finish_review",
            description="Complete the code review and return final results. Call this when you have finished analyzing the PR.",
            parameters={
                "type": "object",
                "properties": {
                    "review_text": {
                        "type": "string",
                        "description": "Complete review text in markdown format"
                    },
                    "severity": {
                        "type": "string",
                        "enum": ["low", "medium", "high", "critical"],
                        "description": "Overall severity of issues found"
                    }
                },
                "required": ["review_text"]
            }
        )

    async def execute(self, review_text: str, severity: str = "medium", **kwargs) -> ToolResult:
        """Mark review as complete.

        Args:
            review_text: Final review text
            severity: Issue severity level

        Returns:
            ToolResult with review data
        """
        return ToolResult(
            success=True,
            data={
                "review_text": review_text,
                "severity": severity,
                "completed": True
            },
            metadata={"type": "completion"}
        )


class FinishTaskTool(BaseTool):
    """Signal that coding task is complete (PR created)."""

    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="finish_task",
            description="Complete the coding task. Call this after you've implemented changes, tested them, and pushed to a branch.",
            parameters={
                "type": "object",
                "properties": {
                    "summary": {
                        "type": "string",
                        "description": "Summary of what was implemented"
                    },
                    "branch_name": {
                        "type": "string",
                        "description": "Name of the branch with changes"
                    },
                },
                "required": ["summary", "branch_name"]
            }
        )

    async def execute(
        self,
        summary: str,
        branch_name: str,
        files_changed: list[str] | None = None,
        **kwargs
    ) -> ToolResult:
        """Mark task as complete.

        Args:
            summary: Implementation summary
            branch_name: Branch with changes
            files_changed: List of modified files

        Returns:
            ToolResult with task data
        """
        return ToolResult(
            success=True,
            data={
                "summary": summary,
                "branch_name": branch_name,
                "files_changed": files_changed or [],
                "completed": True
            },
            metadata={"type": "completion"}
        )
