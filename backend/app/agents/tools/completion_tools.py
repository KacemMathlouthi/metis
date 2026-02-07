"""Completion tools for agents to signal task completion."""

from app.agents.tools.base import BaseTool, ToolDefinition, ToolResult


class FinishReviewTool(BaseTool):
    """Signal that code review is complete."""

    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="finish_review",
            description="Complete the code review and return final summary/verdict. Call this after posting all the findings. This will signal the end of the review process, so only call this once you're done reviewing and posting findings.",
            parameters={
                "type": "object",
                "properties": {
                    "summary": {
                        "type": "string",
                        "description": "Short final summary of the review and main issues detected"
                    },
                    "verdict": {
                        "type": "string",
                        "enum": ["APPROVE", "REQUEST_CHANGES", "COMMENT"],
                        "description": "Final review verdict for the pull request"
                    },
                    "overall_severity": {
                        "type": "string",
                        "enum": ["low", "medium", "high", "critical"],
                        "description": "Overall severity level across findings"
                    }
                },
                "required": ["summary", "verdict"]
            }
        )

    async def execute(
        self,
        summary: str,
        verdict: str,
        overall_severity: str = "medium",
        **kwargs
    ) -> ToolResult:
        """Mark review as complete.

        Args:
            summary: Final short review summary
            verdict: Final PR verdict
            overall_severity: Global issue severity

        Returns:
            ToolResult with review data
        """
        normalized_verdict = verdict.strip().upper()
        if normalized_verdict not in {"APPROVE", "REQUEST_CHANGES", "COMMENT"}:
            return ToolResult(
                success=False,
                error=f"Invalid verdict '{verdict}'. Use APPROVE, REQUEST_CHANGES, or COMMENT.",
            )

        normalized_severity = overall_severity.strip().lower()
        if normalized_severity not in {"low", "medium", "high", "critical"}:
            return ToolResult(
                success=False,
                error=f"Invalid overall_severity '{overall_severity}'. Use low, medium, high, or critical.",
            )

        return ToolResult(
            success=True,
            data={
                "summary": summary,
                "verdict": normalized_verdict,
                "overall_severity": normalized_severity,
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
