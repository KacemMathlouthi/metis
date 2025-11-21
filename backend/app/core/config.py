"""Configuration management using Pydantic Settings.

This module handles all environment variables and configuration settings
in the .env file for the application. It uses Pydantic Settings for
validation and type checking.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application settings
    app_name: str = "Metis AI Code Reviewer"
    version: str = "0.1.0"
    debug: bool = False

    # Server settings
    host: str = "0.0.0.0"
    port: int = 8000

    # GitHub App settings
    github_app_id: int | None = None
    github_app_name: str | None = None
    github_webhook_secret: str | None = None
    github_private_key: str | None = None  # Will load from file
    github_private_key_path: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=False, extra="ignore"
    )


settings = Settings()
