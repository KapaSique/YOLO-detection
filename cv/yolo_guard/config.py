from functools import lru_cache
from typing import Optional

from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    source: str = "0"  # webcam index as string to keep env simple
    source_type: str = "webcam"
    weights: str = "artifacts/weights/yolov8n.pt"
    imgsz: int = 640
    conf: float = 0.25
    iou: float = 0.45
    device: str = "cpu"
    max_det: int = 100
    classes_allow: Optional[list[int]] = None
    classes_deny: Optional[list[int]] = None
    tracker: Optional[str] = None
    publish_ws_url: Optional[str] = None
    database_url: str = Field("sqlite:///./yolo_guard.db", alias="DATABASE_URL")

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
