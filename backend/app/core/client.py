"""client definitions for db connections, llm connections..."""

from openai import OpenAI

from app.core.config import settings


def get_llm_client(base_url: str | None = None, api_key: str | None = None) -> OpenAI:
    """Returns an LLM client based on the input provider URL and API key.

    Args:
        base_url: Base URL for the LLM provider. Defaults to settings value.
        api_key: API key for authentication. Defaults to settings value.

    Returns:
        Configured OpenAI client instance.
    """
    return OpenAI(
        base_url=base_url or settings.PROVIDER_BASE_URL,
        api_key=api_key or settings.PROVIDER_API_KEY,
    )
