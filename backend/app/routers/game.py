"""Game router handling level metadata, run submissions, personal runs, and leaderboard."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, text
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Level, PlayerProfile, Run, User
from app.schemas import LeaderboardEntry, LevelOut, RunCreate, RunOut, RunUpdate
from app.security import get_current_user

router = APIRouter()


@router.get("/levels", response_model=List[LevelOut])
def get_levels(db: Session = Depends(get_db)) -> List[Level]:
    """Return all available levels in the game."""
    return db.query(Level).order_by(Level.id.asc()).all()


@router.post("/runs", response_model=RunOut, status_code=status.HTTP_201_CREATED)
def create_run(
    run_in: RunCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Run:
    """Submit a completed or terminated game run."""
    level = db.query(Level).filter(Level.id == run_in.level_id).first()
    if not level:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Level with id {run_in.level_id} not found",
        )

    run = Run(
        user_id=current_user.id,
        level_id=run_in.level_id,
        score=run_in.score,
        coins=run_in.coins,
        enemies_stomped=run_in.enemies_stomped,
        deaths=run_in.deaths,
        duration_sec=run_in.duration_sec,
        completed=run_in.completed,
        difficulty_used=run_in.difficulty_used,
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    # Recalculate user player profile aggregates
    stats = (
        db.query(
            func.avg(Run.deaths).label("avg_deaths"),
            func.avg(Run.duration_sec).label("avg_time"),
        )
        .filter(Run.user_id == current_user.id)
        .first()
    )

    profile = db.query(PlayerProfile).filter(PlayerProfile.user_id == current_user.id).first()
    if profile:
        profile.avg_deaths = float(stats.avg_deaths or 0.0)
        profile.avg_time = float(stats.avg_time or 0.0)
        db.commit()

    return run


@router.patch("/runs/{run_id}", response_model=RunOut)
def update_run(
    run_id: int,
    run_in: RunUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Run:
    """Update an existing game run upon completion or game over."""
    run = db.query(Run).filter(Run.id == run_id).first()
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Run with id {run_id} not found",
        )

    if run.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this run",
        )

    update_data = run_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(run, key, value)

    db.commit()
    db.refresh(run)

    # Recalculate user player profile aggregates
    stats = (
        db.query(
            func.avg(Run.deaths).label("avg_deaths"),
            func.avg(Run.duration_sec).label("avg_time"),
        )
        .filter(Run.user_id == current_user.id)
        .first()
    )

    profile = db.query(PlayerProfile).filter(PlayerProfile.user_id == current_user.id).first()
    if profile:
        profile.avg_deaths = float(stats.avg_deaths or 0.0)
        profile.avg_time = float(stats.avg_time or 0.0)
        db.commit()

    return run


@router.get("/runs/me", response_model=List[RunOut])
def get_my_runs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[Run]:
    """Retrieve run history for the currently authenticated user."""
    return (
        db.query(Run)
        .filter(Run.user_id == current_user.id)
        .order_by(Run.created_at.desc())
        .all()
    )


@router.get("/leaderboard", response_model=List[LeaderboardEntry])
def get_leaderboard(
    level_id: Optional[int] = Query(default=None, description="Filter leaderboard by level ID"),
    db: Session = Depends(get_db),
) -> List[LeaderboardEntry]:
    """Retrieve top 10 runs by score from the v_leaderboard view (completed runs only)."""
    if level_id is not None:
        stmt = text("""
            SELECT run_id, user_id, username, level_id, score, coins,
                   enemies_stomped, deaths, duration_sec, difficulty_used, created_at
            FROM v_leaderboard
            WHERE level_id = :level_id
            ORDER BY score DESC, duration_sec ASC
            LIMIT 10
        """)
        rows = db.execute(stmt, {"level_id": level_id}).mappings().all()
    else:
        stmt = text("""
            SELECT run_id, user_id, username, level_id, score, coins,
                   enemies_stomped, deaths, duration_sec, difficulty_used, created_at
            FROM v_leaderboard
            ORDER BY score DESC, duration_sec ASC
            LIMIT 10
        """)
        rows = db.execute(stmt).mappings().all()

    return [LeaderboardEntry(**dict(row)) for row in rows]

