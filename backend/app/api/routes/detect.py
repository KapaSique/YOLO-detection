from __future__ import annotations

from typing import Any

import cv2
import numpy as np
from fastapi import APIRouter, File, UploadFile

router = APIRouter()

_model = None


def _get_model():
    global _model
    if _model is None:
        from ultralytics import YOLO
        _model = YOLO("yolo11n.pt")
    return _model


@router.post("/api/detect")
async def detect(file: UploadFile = File(...)) -> dict[str, Any]:
    data = await file.read()
    arr = np.frombuffer(data, dtype=np.uint8)
    frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if frame is None:
        return {"detections": []}

    model = _get_model()
    results = model(frame, verbose=False)

    detections: list[dict[str, Any]] = []
    for result in results:
        boxes = result.boxes
        for box in boxes:
            x1, y1, x2, y2 = box.xyxy.tolist()[0]
            cls = int(box.cls.item())
            label = model.names[cls]
            detections.append({
                "label": label,
                "box": [x1, y1, x2, y2],
            })

    return {"detections": detections}
