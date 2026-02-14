from functools import lru_cache
from typing import Optional

from pydantic import Field, field_validator
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
    cors_origins: str = Field("http://localhost:3000,http://127.0.0.1:3000", alias="CORS_ORIGINS")
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    admin_seed_email: str = Field("admin@example.com", alias="ADMIN_SEED_EMAIL")
    admin_seed_password: str = Field("admin123", alias="ADMIN_SEED_PASSWORD")

    @field_validator("smtp_host", "smtp_user", "smtp_password", mode="before")
    @classmethod
    def empty_str_to_none(cls, v: object) -> object:
        if v == "":
            return None
        return v

    @field_validator("smtp_port", mode="before")
    @classmethod
    def empty_str_to_none_int(cls, v: object) -> object:
        if v == "" or v is None:
            return None
        return int(v)

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}

    @property
    def jwt_algorithm(self) -> str:  # noqa: D401
        """Algorithm used for JWT tokens."""
        return "HS256"

    @property
    def cors_origins_list(self) -> list[str]:
        raw = self.cors_origins.strip()
        if raw == "*":
            return ["*"]
        return [origin.strip() for origin in raw.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()  # pragma: no cover


settings = get_settings()
