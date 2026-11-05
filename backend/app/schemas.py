"""Pydantic schemas for request validation and response serialization."""

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class UserCreate(BaseModel):
    """Schema for registering a new user."""

    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    """Schema for user login credentials."""

    username: str
    password: str


class UserOut(BaseModel):
    """Schema for serialized user data output."""

    id: int
    username: str
    email: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    """Schema for JWT access token response."""

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for decoded JWT token payload claims."""

    username: Optional[str] = None


class LevelOut(BaseModel):
    """Schema for game level details."""

    id: int
    name: str
    difficulty: str
    width_tiles: int

    model_config = ConfigDict(from_attributes=True)


class RunCreate(BaseModel):
    """Schema for initiating or submitting a game run."""

    level_id: int
    score: int = Field(default=0, ge=0, description="Run score must be non-negative")
    coins: int = Field(default=0, ge=0, description="Collected coins must be non-negative")
    enemies_stomped: int = Field(default=0, ge=0, description="Enemies stomped must be non-negative")
    deaths: int = Field(default=0, ge=0, description="Number of deaths must be non-negative")
    duration_sec: float = Field(default=0.0, ge=0.0, description="Duration in seconds must be non-negative")
    completed: bool = Field(default=False, description="Whether the run reached the goal flag")
    difficulty_used: str = Field(default="normal", description="Difficulty used during run")


class RunUpdate(BaseModel):
    """Schema for updating run metrics upon completion."""

    score: Optional[int] = Field(default=None, ge=0, description="Run score must be non-negative")
    coins: Optional[int] = Field(default=None, ge=0, description="Collected coins must be non-negative")
    enemies_stomped: Optional[int] = Field(default=None, ge=0, description="Enemies stomped must be non-negative")
    deaths: Optional[int] = Field(default=None, ge=0, description="Number of deaths must be non-negative")
    duration_sec: Optional[float] = Field(default=None, ge=0.0, description="Duration in seconds must be non-negative")
    completed: Optional[bool] = Field(default=None, description="Whether the run reached the goal flag")
    difficulty_used: Optional[str] = Field(default=None, description="Difficulty used during run")


class RunOut(BaseModel):
    """Schema for serialized game run output."""

    id: int
    user_id: int
    level_id: int
    score: int
    coins: int
    enemies_stomped: int
    deaths: int
    duration_sec: float
    completed: bool
    difficulty_used: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LeaderboardEntry(BaseModel):
    """Schema for entries returned by the leaderboard view."""

    run_id: int
    user_id: int
    username: str
    level_id: int
    score: int
    coins: int
    enemies_stomped: int
    deaths: int
    duration_sec: float
    difficulty_used: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TelemetryEventIn(BaseModel):
    """Schema for an individual telemetry event logged during gameplay."""

    event_type: Literal["death", "coin", "stomp", "checkpoint", "jump"]
    x: float = Field(..., description="Player X coordinate")
    y: float = Field(..., description="Player Y coordinate")
    t_ms: int = Field(..., ge=0, description="Timestamp in milliseconds since run start")
    meta: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Arbitrary event metadata")


class TelemetryBatchIn(BaseModel):
    """Schema for batch ingestion of gameplay telemetry events."""

    run_id: int
    events: List[TelemetryEventIn] = Field(..., max_length=500, description="List of events up to 500")


class TelemetryBatchOut(BaseModel):
    """Schema for telemetry batch ingestion response."""

    status: str = "ok"
    inserted: int
