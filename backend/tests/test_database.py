"""Tests for database connectivity and models."""

from app.database import SessionLocal
from app.models import Level


def test_database_connection_and_seeded_level() -> None:
    """Verify that the database session can query the seeded level."""
    db = SessionLocal()
    try:
        level = db.query(Level).filter(Level.name == "World 1-1").first()
        assert level is not None
        assert level.name == "World 1-1"
        assert level.difficulty == "normal"
        assert level.width_tiles == 100
    finally:
        db.close()

