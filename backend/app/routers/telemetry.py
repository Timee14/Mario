"""Telemetry router for ingesting player gameplay event batches."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Event, Run, User
from app.schemas import TelemetryBatchIn, TelemetryBatchOut
from app.security import get_current_user

router = APIRouter()


@router.post("/batch", response_model=TelemetryBatchOut, status_code=status.HTTP_201_CREATED)
def submit_telemetry_batch(
    batch_in: TelemetryBatchIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TelemetryBatchOut:
    """Ingest a batch of gameplay telemetry events for an active or completed run."""
    run = db.query(Run).filter(Run.id == batch_in.run_id).first()
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Run with id {batch_in.run_id} not found",
        )

    if run.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to submit telemetry for this run",
        )

    if not batch_in.events:
        return TelemetryBatchOut(status="ok", inserted=0)

    events_to_insert = [
        Event(
            run_id=batch_in.run_id,
            event_type=evt.event_type,
            x=evt.x,
            y=evt.y,
            t_ms=evt.t_ms,
            meta=evt.meta,
        )
        for evt in batch_in.events
    ]

    db.add_all(events_to_insert)
    db.commit()

    return TelemetryBatchOut(status="ok", inserted=len(events_to_insert))

