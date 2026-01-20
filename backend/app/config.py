from functools import lru_cache
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment or .env."""

    app_name: str = "YOLO Guard"
    log_level: str = "info"
    database_url: str = Field("sqlite:///./yolo_guard.db", alias="DATABASE_URL")
    jwt_secret: str = Field("change_me", alias="JWT_SECRET")
    access_token_exp_minutes: int = 60
    refresh_token_exp_minutes: int = 60 * 24
    storage_path: str = "/app/storage"
    webhook_retry_count: int = 3
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    admin_seed_email: str = Field("admin@example.com", alias="ADMIN_SEED_EMAIL")
    admin_seed_password: str = Field("admin123", alias="ADMIN_SEED_PASSWORD")

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}

    @property
    def jwt_algorithm(self) -> str:  # noqa: D401
        """Algorithm used for JWT tokens."""
        return "HS256"


@lru_cache
def get_settings() -> Settings:
    return Settings()  # pragma: no cover


settings = get_settings()
