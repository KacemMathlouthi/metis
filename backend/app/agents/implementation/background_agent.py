"""Background coder agent implementation (Issue → PR)."""

from app.agents.base import BaseAgent
from app.agents.prompts.coder_prompt import build_coder_prompt


class BackgroundAgent(BaseAgent):
    """Autonomous coding agent for solving GitHub issues."""

    def __init__(
        self,
        agent_id: str,
        repository: str,
        issue_number: int,
        issue_title: str,
        issue_body: str,
        custom_instructions: str,
        tools,
        llm_client,
        **kwargs,
    ):
        """Initialize background agent.

        Args:
            agent_id: Unique agent ID
            repository: Repository name (owner/repo)
            issue_number: GitHub issue number
            issue_title: Issue title
            issue_body: Issue description
            custom_instructions: User-defined instructions
            tools: ToolManager with coder tools
            llm_client: OpenAI client
            **kwargs: Additional args for BaseAgent (max_iterations, etc.)
        """
        # Build prompts (returns system_prompt, user_context tuple)
        system_prompt, initial_user_message = build_coder_prompt(
            repository=repository,
            issue_number=issue_number,
            issue_title=issue_title,
            issue_body=issue_body,
            custom_instructions=custom_instructions,
        )

        # Initialize base agent
        super().__init__(
            agent_id=agent_id,
            system_prompt=system_prompt,
            initial_user_message=initial_user_message,
            tools=tools,
            llm_client=llm_client,
            **kwargs,
        )
