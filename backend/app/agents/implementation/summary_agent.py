"""PR summary agent implementation."""

from app.agents.base import BaseAgent
from app.agents.prompts.summary_prompt import build_summary_prompt


class SummaryAgent(BaseAgent):
    """Autonomous agent that generates PR summary markdown."""

    def __init__(
        self,
        agent_id: str,
        repository: str,
        pr_number: int,
        pr_title: str,
        pr_description: str,
        author: str,
        base_branch: str,
        head_branch: str,
        pr_diff: str,
        files_changed: int,
        lines_added: int,
        lines_removed: int,
        language: str | None,
        custom_instructions: str,
        tools,
        llm_client,
        **kwargs,
    ):
        """Initialize summary agent with PR context and diff."""
        system_prompt, initial_user_message = build_summary_prompt(
            repository=repository,
            pr_number=pr_number,
            pr_title=pr_title,
            pr_description=pr_description,
            author=author,
            base_branch=base_branch,
            head_branch=head_branch,
            files_changed=files_changed,
            lines_added=lines_added,
            lines_removed=lines_removed,
            language=language,
            custom_instructions=custom_instructions,
        )

        initial_user_message = (
            f"{initial_user_message}\n\n"
            f"**PR Diff**:\n```diff\n{pr_diff}\n```\n\n"
            "Analyze the changes and call `finish_summary()` with the final result."
        )

        super().__init__(
            agent_id=agent_id,
            system_prompt=system_prompt,
            initial_user_message=initial_user_message,
            tools=tools,
            llm_client=llm_client,
            **kwargs,
        )
