from __future__ import annotations

from collections.abc import Generator
from pathlib import Path

import cv2
import numpy as np
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.api.routes import detect as detect_route
from app.db import Base, get_db
from app.models import Detection, Source


def _make_jpeg_bytes() -> bytes:
    frame = np.zeros((24, 24, 3), dtype=np.uint8)
    ok, encoded = cv2.imencode(".jpg", frame)
    if not ok:
        raise RuntimeError("Failed to build test jpeg")
    return encoded.tobytes()


@pytest.fixture()
def detect_client(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> Generator[tuple[TestClient, sessionmaker[Session]], None, None]:
    db_file = tmp_path / "detect_test.db"
    engine = create_engine(
        f"sqlite:///{db_file}",
        connect_args={"check_same_thread": False},
    )
    SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    Base.metadata.create_all(bind=engine)

    async def _noop_publish(payload: dict) -> None:
        return None

    monkeypatch.setattr(detect_route.live_event_hub, "publish", _noop_publish)

    app = FastAPI()

    def override_get_db() -> Generator[Session, None, None]:
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    app.include_router(detect_route.router)

    with TestClient(app) as client:
        yield client, SessionLocal


def test_detect_rejects_non_image_upload(
    detect_client: tuple[TestClient, sessionmaker[Session]],
) -> None:
    client, _ = detect_client
    response = client.post(
        "/api/detect",
        files={"file": ("frame.txt", b"not-an-image", "text/plain")},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Only image uploads are supported"


def test_detect_rejects_too_large_upload(
    detect_client: tuple[TestClient, sessionmaker[Session]],
) -> None:
    client, _ = detect_client
    payload = b"\x00" * (detect_route.MAX_UPLOAD_BYTES + 1)
    response = client.post(
        "/api/detect",
        files={"file": ("frame.jpg", payload, "image/jpeg")},
    )
    assert response.status_code == 413
    assert "File too large" in response.json()["detail"]


def test_detect_returns_boxes_and_persists_rows(
    detect_client: tuple[TestClient, sessionmaker[Session]],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    client, SessionLocal = detect_client
    fake_detections = [{"label": "person", "box": [1.0, 2.0, 12.0, 16.0]}]
    monkeypatch.setattr(detect_route, "_predict", lambda frame: fake_detections)

    response = client.post(
        "/api/detect",
        files={"file": ("frame.jpg", _make_jpeg_bytes(), "image/jpeg")},
    )
    assert response.status_code == 200
    assert response.json() == {"detections": fake_detections}

    with SessionLocal() as db:
        assert db.query(Source).count() == 1
        assert db.query(Detection).count() == 1
