from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from .models import AlertStatus, EventType, Role, SourceType, ZoneType


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str
    role: Role
    exp: int


class UserBase(BaseModel):
    email: EmailStr
    role: Role = Role.operator


class UserCreate(UserBase):
    password: str = Field(min_length=6, max_length=128)


class UserRead(UserBase):
    id: int
    created_at: datetime
    last_login: Optional[datetime] = None

    model_config = {"from_attributes": True}


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class SourceBase(BaseModel):
    name: str
    type: SourceType
    url_or_index: str
    enabled: bool = True


class SourceCreate(SourceBase):
    pass


class SourceUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[SourceType] = None
    url_or_index: Optional[str] = None
    enabled: Optional[bool] = None


class SourceRead(SourceBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ZoneBase(BaseModel):
    name: str
    type: ZoneType
    points_json: dict
    color: Optional[str] = None


class ZoneCreate(ZoneBase):
    source_id: int


class ZoneUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[ZoneType] = None
    points_json: Optional[dict] = None
    color: Optional[str] = None


class ZoneRead(ZoneBase):
    id: int
    source_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class EventRead(BaseModel):
    id: int
    source_id: int
    zone_id: Optional[int]
    class_name: str
    type: EventType
    start_ts: datetime
    end_ts: Optional[datetime]
    max_count: Optional[int]
    avg_conf: Optional[float]
    snapshot_path: Optional[str]
    meta_json: Optional[dict]

    model_config = {"from_attributes": True}


class AlertRuleRead(BaseModel):
    id: int
    name: str
    enabled: bool
    conditions_json: dict
    actions_json: dict
    cooldown_sec: int
    created_at: datetime

    model_config = {"from_attributes": True}


class AlertLogRead(BaseModel):
    id: int
    rule_id: int
    event_id: Optional[int]
    ts: datetime
    status: AlertStatus
    response_json: Optional[dict]

    model_config = {"from_attributes": True}
