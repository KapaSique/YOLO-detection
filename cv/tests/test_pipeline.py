from yolo_guard.config import Settings
from yolo_guard.pipeline import DetectionPipeline


class FakeDetector:
    def predict(self, frame):
        return [{"bbox": [0, 0, 10, 10], "class_id": 0, "confidence": 0.9, "track_id": None}]


def test_pipeline_run_once_returns_payload():
    settings = Settings(source="synthetic", source_type="file")
    pipeline = DetectionPipeline(settings=settings, detector=FakeDetector())
    payload = pipeline.run_once()
    assert payload["detections"][0]["class_id"] == 0
    assert payload["shape"]["width"] > 0
