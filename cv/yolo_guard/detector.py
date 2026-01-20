from __future__ import annotations

from pathlib import Path
from typing import Any, List, Optional

import numpy as np
from loguru import logger

try:
    from ultralytics import YOLO
except ImportError:  # pragma: no cover - defensive
    YOLO = None  # type: ignore


class YoloDetector:
    def __init__(
        self,
        weights: str,
        imgsz: int = 640,
        conf: float = 0.25,
        iou: float = 0.45,
        device: str = "cpu",
        max_det: int = 100,
        classes_allow: Optional[list[int]] = None,
        classes_deny: Optional[list[int]] = None,
        tracker: Optional[str] = None,
    ) -> None:
        self.conf = conf
        self.iou = iou
        self.imgsz = imgsz
        self.device = device
        self.max_det = max_det
        self.classes_allow = classes_allow
        self.classes_deny = classes_deny
        self.tracker = tracker
        self.model = None

        if YOLO is None:
            logger.warning("Ultralytics not available, detector will emit empty detections")
            return
        weights_to_load = weights
        weights_path = Path(weights)
        if weights_path.parent != Path(".") and not weights_path.exists():
            weights_to_load = weights_path.name
            logger.warning(
                "Weights path {} not found; falling back to model name {} for auto-download. "
                "Set WEIGHTS to a local file to skip download.",
                weights,
                weights_to_load,
            )
        try:
            self.model = YOLO(weights_to_load)
            logger.info("Loaded YOLO weights {}", weights_to_load)
        except Exception as exc:  # pragma: no cover - depends on runtime env
            logger.error("Failed to load YOLO weights {}: {}", weights_to_load, exc)
            self.model = None

    def predict(self, frame: np.ndarray) -> List[dict[str, Any]]:
        if self.model is None:
            return []
        results = self.model(
            frame,
            imgsz=self.imgsz,
            conf=self.conf,
            iou=self.iou,
            device=self.device,
            max_det=self.max_det,
            classes=self.classes_allow,
        )
        detections: list[dict[str, Any]] = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                detections.append(
                    {
                        "bbox": box.xyxy.tolist()[0],
                        "class_id": int(box.cls.item()),
                        "confidence": float(box.conf.item()),
                        "track_id": int(box.id.item()) if box.id is not None else None,
                    }
                )
        return detections
