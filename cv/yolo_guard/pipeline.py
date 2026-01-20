from __future__ import annotations

import time
from pathlib import Path
from typing import Optional

import cv2
import numpy as np
from loguru import logger

from .config import Settings
from .detector import YoloDetector


class DetectionPipeline:
    def __init__(self, settings: Settings, detector: Optional[YoloDetector] = None) -> None:
        self.settings = settings
        self.detector = detector or YoloDetector(
            weights=settings.weights,
            imgsz=settings.imgsz,
            conf=settings.conf,
            iou=settings.iou,
            device=settings.device,
            max_det=settings.max_det,
            classes_allow=settings.classes_allow,
            classes_deny=settings.classes_deny,
            tracker=settings.tracker,
        )
        self.capture: Optional[cv2.VideoCapture] = None
        self._capture_retry_at = 0.0

    @staticmethod
    def _list_video_devices() -> list[str]:
        return sorted(str(path) for path in Path("/dev").glob("video*"))

    @staticmethod
    def _parse_webcam_index(source: str) -> int:
        try:
            return int(source)
        except (TypeError, ValueError):
            return 0

    def _ensure_capture(self) -> None:
        if self.capture is not None and self.capture.isOpened():
            return
        source_type = (self.settings.source_type or "").lower()
        if source_type == "synthetic":
            return
        now = time.time()
        if now < self._capture_retry_at:
            return
        retry_sec = max(0.0, self.settings.capture_retry_sec)
        self._capture_retry_at = now + retry_sec
        source = self.settings.source
        if self.capture is not None:
            self.capture.release()
            self.capture = None
        if source_type == "webcam":
            idx = self._parse_webcam_index(source)
            self.capture = cv2.VideoCapture(idx)
        else:
            self.capture = cv2.VideoCapture(source)
        if not self.capture.isOpened():
            self.capture = None
            if source_type == "webcam":
                devices = self._list_video_devices()
                if devices:
                    logger.warning(
                        "Could not open webcam index {}. Available devices: {}. Retrying in {}s.",
                        idx,
                        devices,
                        retry_sec,
                    )
                else:
                    logger.warning(
                        "Could not open webcam index {}. No /dev/video* devices found. "
                        "If running in Docker on Linux, pass through /dev/video0 or use RTSP/file. "
                        "Retrying in {}s.",
                        idx,
                        retry_sec,
                    )
            else:
                logger.warning(
                    "Could not open video source {} (type {}). Retrying in {}s.",
                    source,
                    source_type,
                    retry_sec,
                )

    def read_frame(self) -> Optional[np.ndarray]:
        if (self.settings.source_type or "").lower() == "synthetic":
            return self.synthetic_frame()
        self._ensure_capture()
        if self.capture is None:
            return self.synthetic_frame()
        success, frame = self.capture.read()
        if not success:
            logger.warning("Failed to read frame, returning synthetic frame")
            return self.synthetic_frame()
        return frame

    @staticmethod
    def synthetic_frame(width: int = 640, height: int = 480) -> np.ndarray:
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        cv2.putText(frame, "YOLO Guard", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        return frame

    def run_once(self) -> dict:
        frame = self.read_frame()
        if frame is None:
            raise RuntimeError("No frame available")
        started = time.time()
        detections = self.detector.predict(frame)
        latency_ms = (time.time() - started) * 1000
        payload = {
            "timestamp": time.time(),
            "detections": detections,
            "latency_ms": latency_ms,
            "shape": {"width": frame.shape[1], "height": frame.shape[0]},
        }
        logger.debug("Frame processed: {} detections, {:.2f} ms", len(detections), latency_ms)
        return payload
