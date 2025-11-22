"""Metis AI Agent service for code review and PR summarization.

This module provides AI-powered code review and PR summary generation
with configurable sensitivity levels, custom rules, and user instructions.
"""

from typing import Any

from app.core.client import get_llm_client
from app.schemas.metis_config import ReviewerConfig, SummaryConfig
from app.utils.prompts import REVIEW_SYSTEM_PROMPT, SUMMARY_SYSTEM_PROMPT


class AIReviewer:
    """AI-powered code reviewer."""

    def __init__(self, config: ReviewerConfig) -> None:
        """Initialize AI reviewer.

        Args:
            config: Reviewer configuration
            client: OpenAI client (if None, creates default client)
        """
        self.config = config
        self.client = get_llm_client()

    def _build_system_prompt(self) -> str:
        """Build complete system prompt with config.

        Returns:
            Complete system prompt with user instructions.
        """
        sensitivity_instructions = self.config.get_sensitivity_instructions()
        user_settings = f"""
Sensitivity Level: {self.config.sensitivity.value}
{sensitivity_instructions}

{self.config.user_instructions}
""".strip()
        return REVIEW_SYSTEM_PROMPT + "\n\n" + user_settings

    async def review_code(self, diff: str, context: dict[str, Any] | None = None) -> str:
        """Generate code review for a diff.

        Args:
            diff: Git diff content to review
            context: Optional context (PR title, description, etc.)

        Returns:
            Generated code review text.
        """
        system_prompt = self._build_system_prompt()

        context_text = ""
        if context:
            pr_title = context.get("title", "")
            pr_description = context.get("description", "")
            context_text = f"""
Pull Request Context:
Title: {pr_title}
Description: {pr_description}

"""

        user_message = f"""{context_text}Please review the following code changes:

```diff
{diff}
```

Provide a thorough code review following the guidelines."""

        response = self.client.chat.completions.create(
            model=self.config.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            temperature=self.config.temperature,
            max_tokens=self.config.max_tokens,
        )

        review_text: str = response.choices[0].message.content or ""
        return review_text


class AISummaryWriter:
    """AI-powered PR summary generator."""

    def __init__(self, config: SummaryConfig) -> None:
        """Initialize summary writer.

        Args:
            config: Summary configuration
        """
        self.config = config
        self.client = get_llm_client()

    def _build_system_prompt(self) -> str:
        """Build complete system prompt.

        Returns:
            Complete system prompt with user instructions.
        """
        user_section = self.config.user_instructions or "No additional instructions."
        return SUMMARY_SYSTEM_PROMPT + "\n\n" + user_section

    async def generate_summary(self, diff: str, context: dict[str, Any] | None = None) -> str:
        """Generate PR summary from diff.

        Args:
            diff: Git diff content
            context: Optional context (branch names, author, etc.)

        Returns:
            Generated PR summary in markdown.
        """
        system_prompt = self._build_system_prompt()

        context_text = ""
        if context:
            base_branch = context.get("base_branch", "")
            head_branch = context.get("head_branch", "")
            author = context.get("author", "")
            context_text = f"""
Context:
- Base branch: {base_branch}
- Head branch: {head_branch}
- Author: {author}

"""

        user_message = f"""{context_text}Generate a clear, concise summary for this pull request:

```diff
{diff}
```

Provide a professional summary following the structure guidelines."""

        response = self.client.chat.completions.create(
            model=self.config.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            temperature=self.config.temperature,
            max_tokens=self.config.max_tokens,
        )

        summary_text: str = response.choices[0].message.content or ""
        return summary_text


class MetisAgent:
    """Main Metis agent combining reviewer and summary writer.

    This class provides a unified interface for both code review
    and summary generation functionality.
    """

    def __init__(
        self,
        reviewer_config: ReviewerConfig | None = None,
        summary_config: SummaryConfig | None = None,
    ) -> None:
        """Initialize Metis agent.

        Args:
            reviewer_config: Configuration for code reviewer
            summary_config: Configuration for summary writer
        """
        self.reviewer = AIReviewer(config=reviewer_config or ReviewerConfig())
        self.summary_writer = AISummaryWriter(config=summary_config or SummaryConfig())

    async def review_pr(self, diff: str, context: dict[str, Any] | None = None) -> str:
        """Review pull request code changes.

        Args:
            diff: Git diff to review
            context: PR context information

        Returns:
            Code review text.
        """
        return await self.reviewer.review_code(diff, context)

    async def summarize_pr(self, diff: str, context: dict[str, Any] | None = None) -> str:
        """Generate pull request summary.

        Args:
            diff: Git diff to summarize
            context: PR context information

        Returns:
            PR summary text.
        """
        return await self.summary_writer.generate_summary(diff, context)
