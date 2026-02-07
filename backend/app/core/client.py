"""LLM client abstraction using LiteLLM for multi-provider support.

Supports any provider LiteLLM supports (Vertex AI, OpenAI, Anthropic, Mistral, etc.)
by changing the MODEL_NAME environment variable. The client exposes the same
chat.completions.create() interface as the OpenAI SDK so the agent loop needs no changes.
"""

from typing import Any

import litellm

from app.core.config import settings

# Configure LiteLLM globals
litellm.drop_params = True
litellm.set_verbose = False

# Enable LangSmith callback if tracing is on
if settings.LANGSMITH_TRACING:
    litellm.success_callback = ["langsmith"]
    litellm.failure_callback = ["langsmith"]


class _Completions:
    """Mimics openai.chat.completions interface."""

    def create(self, **kwargs: Any) -> Any:
        """Call LiteLLM completion with OpenAI-compatible interface.

        Args:
            **kwargs: Arguments passed to litellm.completion()
                (model, messages, tools, temperature, max_tokens, etc.)

        Returns:
            ModelResponse (OpenAI-compatible response object with
            .choices[0].message, .tool_calls, .usage, etc.)
        """
        return litellm.completion(**kwargs)


class _Chat:
    """Mimics openai.chat interface."""

    def __init__(self) -> None:
        """Initialize chat interface."""
        self.completions = _Completions()


class LiteLLMClient:
    """Drop-in replacement for openai.OpenAI that delegates to LiteLLM.

    Provides the same client.chat.completions.create() interface
    so that BaseAgent and legacy services work without changes.
    """

    def __init__(self) -> None:
        """Initialize LiteLLM client."""
        self.chat = _Chat()


def get_llm_client() -> LiteLLMClient:
    """Return a LiteLLM-backed client with OpenAI-compatible interface.

    Returns:
        LiteLLMClient instance.
    """
    return LiteLLMClient()
