"""Pytest fixtures and test database configuration."""

from typing import Generator
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import Level

# In-memory SQLite engine for fast, isolated tests
TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    """Provide a fresh SQLite schema with v_leaderboard view for each test."""
    Base.metadata.create_all(bind=test_engine)

    # Create the v_leaderboard view for tests
    with test_engine.connect() as conn:
        conn.execute(
            text("""
            CREATE VIEW IF NOT EXISTS v_leaderboard AS
            SELECT 
                r.id AS run_id,
                r.user_id,
                u.username,
                r.level_id,
                r.score,
                r.coins,
                r.enemies_stomped,
                r.deaths,
                r.duration_sec,
                r.difficulty_used,
                r.created_at
            FROM runs r
            JOIN users u ON r.user_id = u.id
            WHERE r.completed = 1;
            """)
        )
        conn.commit()

    session = TestingSessionLocal()
    # Seed a default level 1
    level = Level(id=1, name="World 1-1", difficulty="normal", width_tiles=100)
    session.add(level)
    session.commit()

    try:
        yield session
    finally:
        session.close()
        with test_engine.connect() as conn:
            conn.execute(text("DROP VIEW IF EXISTS v_leaderboard;"))
            conn.commit()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """Provide a FastAPI test client wired to the isolated test database."""
    def override_get_db() -> Generator[Session, None, None]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
