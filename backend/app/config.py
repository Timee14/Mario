"""Application configuration management using pydantic-settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables or .env file."""

    DATABASE_URL: str = "postgresql://mario:mariopassword@localhost:5432/mario_analytics"
    SECRET_KEY: str = "dev-secret-key-change-in-production-1234567890"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


def get_settings() -> Settings:
    """Return an instance of application settings."""
    return Settings()


settings = get_settings()

