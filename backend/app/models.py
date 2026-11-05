"""SQLAlchemy declarative database models for Mario Analytics."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class User(Base):
    """User account entity for authentication and telemetry ownership."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    runs: Mapped[List["Run"]] = relationship("Run", back_populates="user", cascade="all, delete-orphan")
    profile: Mapped[Optional["PlayerProfile"]] = relationship("PlayerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Level(Base):
    """Game level entity describing map properties and base difficulty."""

    __tablename__ = "levels"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(20), nullable=False, default="normal")
    width_tiles: Mapped[int] = mapped_column(Integer, nullable=False)

    # Relationships
    runs: Mapped[List["Run"]] = relationship("Run", back_populates="level", cascade="all, delete-orphan")


class Run(Base):
    """Individual playthrough run record containing gameplay summary metrics."""

    __tablename__ = "runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    level_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("levels.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    coins: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    enemies_stomped: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    deaths: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    duration_sec: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    difficulty_used: Mapped[str] = mapped_column(String(20), nullable=False, default="normal")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="runs")
    level: Mapped["Level"] = relationship("Level", back_populates="runs")
    events: Mapped[List["Event"]] = relationship("Event", back_populates="run", cascade="all, delete-orphan")


class Event(Base):
    """Fine-grained telemetry event logged during a run."""

    __tablename__ = "events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    run_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("runs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    event_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    x: Mapped[float] = mapped_column(Float, nullable=False)
    y: Mapped[float] = mapped_column(Float, nullable=False)
    t_ms: Mapped[int] = mapped_column(Integer, nullable=False)
    meta: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSONB().with_variant(JSON, "sqlite"),
        nullable=True,
    )

    # Relationships
    run: Mapped["Run"] = relationship("Run", back_populates="events")


class PlayerProfile(Base):
    """Player skill summary and aggregated analytics."""

    __tablename__ = "player_profiles"

    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    skill_label: Mapped[str] = mapped_column(String(50), nullable=False, default="novice")
    avg_deaths: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    avg_time: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="profile")
