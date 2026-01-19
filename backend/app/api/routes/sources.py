from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ... import schemas
from ...db import get_db
from ...deps import get_current_user, require_role
from ...models import Role, Source, SourceType, User

router = APIRouter(prefix="/api/sources", tags=["sources"])


@router.get("", response_model=list[schemas.SourceRead])
def list_sources(db: Session = Depends(get_db), _: User = Depends(get_current_user)) -> list[Source]:
    return db.query(Source).order_by(Source.created_at.desc()).all()


@router.post("", response_model=schemas.SourceRead, status_code=status.HTTP_201_CREATED)
def create_source(
    payload: schemas.SourceCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(Role.admin, Role.operator)),
) -> Source:
    source = Source(**payload.model_dump())
    db.add(source)
    db.commit()
    db.refresh(source)
    return source


@router.get("/{source_id}", response_model=schemas.SourceRead)
def get_source(
    source_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> Source:
    source = db.get(Source, source_id)
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")
    return source


@router.put("/{source_id}", response_model=schemas.SourceRead)
def update_source(
    source_id: int,
    payload: schemas.SourceUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(Role.admin, Role.operator)),
) -> Source:
    source = db.get(Source, source_id)
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(source, key, value)
    db.commit()
    db.refresh(source)
    return source


@router.delete("/{source_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_source(
    source_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(Role.admin)),
) -> None:
    source = db.get(Source, source_id)
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")
    db.delete(source)
    db.commit()


@router.post("/{source_id}/start")
def start_source(source_id: int, db: Session = Depends(get_db), _: User = Depends(require_role(Role.operator, Role.admin))):
    source = db.get(Source, source_id)
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")
    return {"status": "started", "source_id": source_id}


@router.post("/{source_id}/stop")
def stop_source(source_id: int, db: Session = Depends(get_db), _: User = Depends(require_role(Role.operator, Role.admin))):
    source = db.get(Source, source_id)
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")
    return {"status": "stopped", "source_id": source_id}


@router.post("/{source_id}/test")
def test_source(source_id: int, db: Session = Depends(get_db), _: User = Depends(require_role(Role.operator, Role.admin))):
    source = db.get(Source, source_id)
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")
    return {"status": "ok", "source_id": source_id, "type": source.type.value}
