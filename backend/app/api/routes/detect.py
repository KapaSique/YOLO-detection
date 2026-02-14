from __future__ import annotations

from datetime import datetime, timezone
from threading import Lock
from time import perf_counter
from typing import Any

import cv2
import numpy as np
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from loguru import logger
from sqlalchemy.orm import Session

from ...db import get_db
from ...live_events import live_event_hub
from ...models import Detection, Source, SourceType

router = APIRouter(tags=["detect"])

MAX_UPLOAD_BYTES = 5 * 1024 * 1024
_BROWSER_SOURCE_URL = "browser://webcam"
_BROWSER_SOURCE_NAME = "Browser Webcam"

_model = None
_model_lock = Lock()


def _get_model():
    global _model
    if _model is None:
        with _model_lock:
            if _model is None:
                from ultralytics import YOLO

                _model = YOLO("yolo11n.pt")
                logger.info("Loaded detection model yolo11n.pt")
    return _model


def _decode_frame(data: bytes) -> np.ndarray | None:
    arr = np.frombuffer(data, dtype=np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)


def _predict(frame: np.ndarray) -> list[dict[str, Any]]:
    model = _get_model()
    results = model(frame, verbose=False)

    detections: list[dict[str, Any]] = []
    for result in results:
        for box in result.boxes:
            x1, y1, x2, y2 = box.xyxy.tolist()[0]
            cls = int(box.cls.item())
            label = model.names[cls]
            detections.append({"label": label, "box": [x1, y1, x2, y2]})

    return detections


def _get_or_create_browser_source_id(db: Session) -> int:
    source = (
        db.query(Source)
        .filter(Source.type == SourceType.http, Source.url_or_index == _BROWSER_SOURCE_URL)
        .first()
    )
    if source:
        return source.id

    source = Source(
        name=_BROWSER_SOURCE_NAME,
        type=SourceType.http,
        url_or_index=_BROWSER_SOURCE_URL,
        enabled=True,
    )
    db.add(source)
    db.commit()
    db.refresh(source)
    return source.id


@router.post("/api/detect")
async def detect(file: UploadFile = File(...), db: Session = Depends(get_db)) -> dict[str, Any]:
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image uploads are supported",
        )

    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large: max {MAX_UPLOAD_BYTES // (1024 * 1024)} MB",
        )

    frame = _decode_frame(data)
    if frame is None:
        return {"detections": []}

    started = perf_counter()
    detections = _predict(frame)
    latency_ms = (perf_counter() - started) * 1000

    source_id = _get_or_create_browser_source_id(db)
    ts = datetime.now(timezone.utc)
    db_row = Detection(
        source_id=source_id,
        ts=ts,
        detections_json={"detections": detections},
        latency_ms=latency_ms,
        frame_w=frame.shape[1],
        frame_h=frame.shape[0],
    )
    db.add(db_row)
    try:
        db.commit()
    except Exception as exc:  # pragma: no cover - defensive
        db.rollback()
        logger.warning("Failed to persist detection row: {}", exc)

    await live_event_hub.publish(
        {
            "type": "detections",
            "source": _BROWSER_SOURCE_URL,
            "ts": ts.isoformat(),
            "detections": detections,
        }
    )

    return {"detections": detections}
