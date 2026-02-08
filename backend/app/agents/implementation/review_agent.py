"""Code review agent implementation."""

from app.agents.base import BaseAgent
from app.agents.prompts.reviewer_prompt import build_reviewer_prompt


class ReviewAgent(BaseAgent):
    """Autonomous code review agent."""

    def __init__(
        self,
        agent_id: str,
        pr_title: str,
        pr_description: str,
        pr_diff: str,
        sensitivity: str,
        custom_instructions: str,
        ignore_patterns: list[str],
        tools,
        llm_client,
        **kwargs,
    ):
        """Initialize review agent.

        Args:
            agent_id: Unique agent ID
            pr_title: Pull request title
            pr_description: Pull request description
            pr_diff: Pull request diff
            sensitivity: Review sensitivity (LOW, MEDIUM, HIGH)
            custom_instructions: User-defined custom instructions
            ignore_patterns: File patterns to ignore
            tools: ToolManager with reviewer tools
            llm_client: OpenAI client
            **kwargs: Additional args for BaseAgent (max_iterations, etc.)
        """
        # Build system prompt
        system_prompt = build_reviewer_prompt(
            sensitivity=sensitivity,
            custom_instructions=custom_instructions,
            ignore_patterns=ignore_patterns,
        )

        # Build initial user message
        initial_user_message = f"""# Pull Request Review

**Title**: {pr_title}

**Description**:
{pr_description}

**Diff**:
```diff
{pr_diff}
```

---

Begin your code review. Use your tools to gather context, verify behavior, and analyze the changes thoroughly. When complete, call `finish_review()` with your review.
"""

        # Initialize base agent
        super().__init__(
            agent_id=agent_id,
            system_prompt=system_prompt,
            initial_user_message=initial_user_message,
            tools=tools,
            llm_client=llm_client,
            **kwargs,
        )
