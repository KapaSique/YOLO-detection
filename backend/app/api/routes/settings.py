from fastapi import APIRouter, Depends

from ...config import settings
from ...deps import require_role
from ...models import Role


class RuntimeSettingsState:
    def __init__(self):
        self.conf: float = 0.25
        self.iou: float = 0.45
        self.imgsz: int = 640
        self.weights: str = "/app/artifacts/weights/yolov8n.pt"
        self.ws_hz: int = 10
        self.jpeg_quality: int = 85


state = RuntimeSettingsState()
router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("")
def get_settings():
    return state.__dict__


@router.put("")
def update_settings(payload: dict, _: object = Depends(require_role(Role.admin, Role.operator))):
    for key, value in payload.items():
        if hasattr(state, key):
            setattr(state, key, value)
    return state.__dict__
