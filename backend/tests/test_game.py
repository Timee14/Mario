"""Integration tests for game routers (levels, runs, leaderboard)."""

from fastapi.testclient import TestClient


def get_auth_token(client: TestClient, username: str = "player1") -> str:
    """Helper to register and login a user, returning JWT token."""
    client.post(
        "/auth/register",
        json={
            "username": username,
            "email": f"{username}@example.com",
            "password": "Password123!",
        },
    )
    login_res = client.post(
        "/auth/login",
        json={"username": username, "password": "Password123!"},
    )
    return login_res.json()["access_token"]


def test_get_levels(client: TestClient) -> None:
    """Verify that GET /levels returns the list of levels."""
    response = client.get("/levels")
    assert response.status_code == 200
    levels = response.json()
    assert len(levels) >= 1
    assert levels[0]["name"] == "World 1-1"


def test_create_run_unauthorized(client: TestClient) -> None:
    """Verify that submitting a run without authentication returns 401."""
    response = client.post(
        "/runs",
        json={
            "level_id": 1,
            "score": 1500,
            "coins": 10,
            "enemies_stomped": 3,
            "deaths": 0,
            "duration_sec": 45.5,
            "completed": True,
            "difficulty_used": "normal",
        },
    )
    assert response.status_code == 401


def test_create_run_success(client: TestClient) -> None:
    """Verify that an authenticated user can submit a run."""
    token = get_auth_token(client, "runner1")
    response = client.post(
        "/runs",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "level_id": 1,
            "score": 2500,
            "coins": 15,
            "enemies_stomped": 4,
            "deaths": 1,
            "duration_sec": 62.3,
            "completed": True,
            "difficulty_used": "normal",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["score"] == 2500
    assert data["coins"] == 15
    assert data["completed"] is True
    assert "id" in data


def test_create_run_validation_error(client: TestClient) -> None:
    """Verify that negative score or invalid data returns HTTP 422."""
    token = get_auth_token(client, "runner2")
    response = client.post(
        "/runs",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "level_id": 1,
            "score": -500,  # Invalid negative score
            "coins": 0,
            "completed": True,
        },
    )
    assert response.status_code == 422


def test_create_run_invalid_level(client: TestClient) -> None:
    """Verify that submitting a run for a non-existent level returns 404."""
    token = get_auth_token(client, "runner3")
    response = client.post(
        "/runs",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "level_id": 9999,  # Non-existent level
            "score": 1000,
            "coins": 5,
            "completed": True,
        },
    )
    assert response.status_code == 404


def test_get_my_runs(client: TestClient) -> None:
    """Verify that GET /runs/me returns only the user's runs."""
    token1 = get_auth_token(client, "user_a")
    token2 = get_auth_token(client, "user_b")

    # User A submits a run
    client.post(
        "/runs",
        headers={"Authorization": f"Bearer {token1}"},
        json={"level_id": 1, "score": 1000, "completed": True},
    )

    # User B submits a run
    client.post(
        "/runs",
        headers={"Authorization": f"Bearer {token2}"},
        json={"level_id": 1, "score": 2000, "completed": True},
    )

    # User A checks personal runs
    res_a = client.get("/runs/me", headers={"Authorization": f"Bearer {token1}"})
    assert res_a.status_code == 200
    runs_a = res_a.json()
    assert len(runs_a) == 1
    assert runs_a[0]["score"] == 1000

    # Unauthorized check
    unauth = client.get("/runs/me")
    assert unauth.status_code == 401


def test_leaderboard_view_and_filtering(client: TestClient) -> None:
    """Verify that GET /leaderboard returns top 10 completed runs ordered by score desc."""
    token_p1 = get_auth_token(client, "pro_gamer")
    token_p2 = get_auth_token(client, "speedrunner")
    token_p3 = get_auth_token(client, "casual_player")

    # Pro gamer completes run with 3000 pts
    client.post(
        "/runs",
        headers={"Authorization": f"Bearer {token_p1}"},
        json={"level_id": 1, "score": 3000, "duration_sec": 50, "completed": True},
    )

    # Speedrunner completes run with 5000 pts
    client.post(
        "/runs",
        headers={"Authorization": f"Bearer {token_p2}"},
        json={"level_id": 1, "score": 5000, "duration_sec": 30, "completed": True},
    )

    # Casual player plays but does NOT complete the run (game over)
    client.post(
        "/runs",
        headers={"Authorization": f"Bearer {token_p3}"},
        json={"level_id": 1, "score": 4000, "duration_sec": 60, "completed": False},
    )

    # Query leaderboard
    res = client.get("/leaderboard?level_id=1")
    assert res.status_code == 200
    board = res.json()

    # Incomplete run (casual_player) MUST NOT appear on leaderboard
    usernames = [entry["username"] for entry in board]
    assert "casual_player" not in usernames
    assert len(board) == 2

    # Top score first (speedrunner = 5000, pro_gamer = 3000)
    assert board[0]["username"] == "speedrunner"
    assert board[0]["score"] == 5000
    assert board[1]["username"] == "pro_gamer"
    assert board[1]["score"] == 3000
