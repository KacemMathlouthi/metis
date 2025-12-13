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
    GITHUB_APP_ID: int | None = None
    GITHUB_CLIENT_ID: str | None = None
    GITHUB_CLIENT_SECRET_ID: str | None = None
    GITHUB_APP_NAME: str | None = None
    GITHUB_SECRET_KEY_PATH: str | None = None
    GITHUB_WEBHOOK_SECRET: str | None = None
    GITHUB_INSTALLATION_ID: int | None = None

    # LLM Provider settings
    PROVIDER_API_KEY: str | None = None
    PROVIDER_BASE_URL: str | None = None
    MODEL_NAME: str | None = None

    # Database settings
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10
    DATABASE_ECHO: bool = False

    # JWT Settings
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Frontend URL
    FRONTEND_URL: str

    # Encryption key
    ENCRYPTION_KEY: str

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=False, extra="ignore"
    )


settings = Settings()
