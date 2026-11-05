"""Database seeding script for Mario Analytics."""

import sys
from pathlib import Path

# Ensure backend root is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.database import SessionLocal
from app.models import Level


def seed_data() -> None:
    """Seed initial level data into the database."""
    db = SessionLocal()
    try:
        # Check if the initial level already exists
        existing_level = db.query(Level).filter(Level.name == "World 1-1").first()
        if existing_level:
            print(f"Level already exists: id={existing_level.id}, name={existing_level.name}, difficulty={existing_level.difficulty}, width_tiles={existing_level.width_tiles}")
            return

        level = Level(
            name="World 1-1",
            difficulty="normal",
            width_tiles=100,
        )
        db.add(level)
        db.commit()
        db.refresh(level)
        print(f"Successfully seeded level: id={level.id}, name={level.name}, difficulty={level.difficulty}, width_tiles={level.width_tiles}")
    except Exception as exc:
        db.rollback()
        print(f"Error during seeding: {exc}", file=sys.stderr)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()

