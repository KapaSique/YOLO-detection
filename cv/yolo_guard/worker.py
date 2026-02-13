import signal
import time

from loguru import logger

from .config import settings
from .pipeline import DetectionPipeline


class Worker:
    def __init__(self):
        self.pipeline = DetectionPipeline(settings=settings)
        self.running = True

    def run(self):
        logger.info("Starting CV worker with source {}", settings.source)
        while self.running:
            payload = self.pipeline.run_once()
            logger.debug("Detections payload: {}", payload)
            time.sleep(max(0, 1 / 5))  # limit to ~5 Hz until connected to RTSP timing

    def stop(self, *_args):
        logger.info("CV worker received stop signal, shutting down")
        self.running = False


def main():
    worker = Worker()
    signal.signal(signal.SIGTERM, worker.stop)
    signal.signal(signal.SIGINT, worker.stop)
    try:
        worker.run()
    except KeyboardInterrupt:
        worker.stop()


if __name__ == "__main__":
    main()
