from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ... import schemas
from ...db import get_db
from ...deps import get_current_user, require_role
from ...models import Role, Source, Zone

router = APIRouter(prefix="/api/zones", tags=["zones"])


@router.get("", response_model=list[schemas.ZoneRead])
def list_zones(
    source_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
) -> list[Zone]:
    query = db.query(Zone)
    if source_id:
        query = query.filter(Zone.source_id == source_id)
    return query.order_by(Zone.created_at.desc()).all()


@router.post("", response_model=schemas.ZoneRead, status_code=status.HTTP_201_CREATED)
def create_zone(
    payload: schemas.ZoneCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_role(Role.admin, Role.operator)),
) -> Zone:
    if not db.get(Source, payload.source_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")
    zone = Zone(**payload.model_dump())
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return zone


@router.put("/{zone_id}", response_model=schemas.ZoneRead)
def update_zone(
    zone_id: int,
    payload: schemas.ZoneUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_role(Role.admin, Role.operator)),
) -> Zone:
    zone = db.get(Zone, zone_id)
    if not zone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zone not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(zone, key, value)
    db.commit()
    db.refresh(zone)
    return zone


@router.delete("/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_role(Role.admin)),
) -> None:
    zone = db.get(Zone, zone_id)
    if not zone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zone not found")
    db.delete(zone)
    db.commit()
