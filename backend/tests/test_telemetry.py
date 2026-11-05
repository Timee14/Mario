"""Integration tests for telemetry ingestion and run updates."""

from fastapi.testclient import TestClient


def get_auth_token(client: TestClient, username: str) -> str:
    """Helper to register and login a user, returning JWT access token."""
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


def test_submit_telemetry_valid_batch(client: TestClient) -> None:
    """Verify that an authenticated user can submit a valid telemetry batch."""
    token = get_auth_token(client, "telemetry_user1")
    headers = {"Authorization": f"Bearer {token}"}

    # Start an in-progress run
    run_res = client.post("/runs", headers=headers, json={"level_id": 1})
    assert run_res.status_code == 201
    run_id = run_res.json()["id"]

    # Submit valid batch with all 5 event types
    events = [
        {"event_type": "jump", "x": 64.0, "y": 350.0, "t_ms": 120, "meta": {}},
        {"event_type": "coin", "x": 128.5, "y": 300.0, "t_ms": 1500, "meta": {"coin_count": 1}},
        {"event_type": "stomp", "x": 320.0, "y": 352.0, "t_ms": 3200, "meta": {"enemy_id": 1}},
        {"event_type": "checkpoint", "x": 800.0, "y": 300.0, "t_ms": 5000, "meta": {"type": "midpoint"}},
        {"event_type": "death", "x": 950.0, "y": 420.0, "t_ms": 7800, "meta": {"cause": "pit"}},
    ]

    res = client.post(
        "/telemetry/batch",
        headers=headers,
        json={"run_id": run_id, "events": events},
    )
    assert res.status_code == 201
    data = res.json()
    assert data["status"] == "ok"
    assert data["inserted"] == 5


def test_submit_telemetry_wrong_owner(client: TestClient) -> None:
    """Verify that a user cannot submit telemetry for a run belonging to someone else."""
    token_owner = get_auth_token(client, "real_owner")
    token_attacker = get_auth_token(client, "attacker_user")

    # Real owner creates a run
    run_res = client.post(
        "/runs",
        headers={"Authorization": f"Bearer {token_owner}"},
        json={"level_id": 1},
    )
    run_id = run_res.json()["id"]

    # Attacker attempts to submit telemetry for owner's run
    events = [
        {"event_type": "jump", "x": 100.0, "y": 200.0, "t_ms": 100, "meta": {}},
    ]
    res = client.post(
        "/telemetry/batch",
        headers={"Authorization": f"Bearer {token_attacker}"},
        json={"run_id": run_id, "events": events},
    )
    assert res.status_code == 403
    assert "Not authorized" in res.json()["detail"]


def test_submit_telemetry_invalid_type(client: TestClient) -> None:
    """Verify that submitting an unsupported event type returns 422 validation error."""
    token = get_auth_token(client, "telemetry_user2")
    headers = {"Authorization": f"Bearer {token}"}

    run_res = client.post("/runs", headers=headers, json={"level_id": 1})
    run_id = run_res.json()["id"]

    # Invalid event_type 'teleport'
    events = [
        {"event_type": "teleport", "x": 100.0, "y": 200.0, "t_ms": 100, "meta": {}},
    ]
    res = client.post(
        "/telemetry/batch",
        headers=headers,
        json={"run_id": run_id, "events": events},
    )
    assert res.status_code == 422


def test_submit_telemetry_oversized_batch(client: TestClient) -> None:
    """Verify that submitting more than 500 events in a batch returns 422 validation error."""
    token = get_auth_token(client, "telemetry_user3")
    headers = {"Authorization": f"Bearer {token}"}

    run_res = client.post("/runs", headers=headers, json={"level_id": 1})
    run_id = run_res.json()["id"]

    # 501 events (exceeds max 500)
    oversized_events = [
        {"event_type": "jump", "x": float(i), "y": 100.0, "t_ms": i * 10, "meta": {}}
        for i in range(501)
    ]
    res = client.post(
        "/telemetry/batch",
        headers=headers,
        json={"run_id": run_id, "events": oversized_events},
    )
    assert res.status_code == 422


def test_submit_telemetry_unauthorized(client: TestClient) -> None:
    """Verify that telemetry submission without JWT token returns 401."""
    res = client.post(
        "/telemetry/batch",
        json={"run_id": 1, "events": []},
    )
    assert res.status_code == 401


def test_submit_telemetry_nonexistent_run(client: TestClient) -> None:
    """Verify that telemetry submission for a non-existent run returns 404."""
    token = get_auth_token(client, "telemetry_user4")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post(
        "/telemetry/batch",
        headers=headers,
        json={
            "run_id": 99999,
            "events": [{"event_type": "coin", "x": 10.0, "y": 10.0, "t_ms": 100, "meta": {}}],
        },
    )
    assert res.status_code == 404


def test_patch_run_lifecycle(client: TestClient) -> None:
    """Verify updating a run upon completion via PATCH /runs/{id}."""
    token = get_auth_token(client, "patch_runner")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create in-progress run
    create_res = client.post("/runs", headers=headers, json={"level_id": 1})
    assert create_res.status_code == 201
    run_id = create_res.json()["id"]
    assert create_res.json()["score"] == 0
    assert create_res.json()["completed"] is False

    # 2. Update completed run
    patch_res = client.patch(
        f"/runs/{run_id}",
        headers=headers,
        json={
            "score": 3200,
            "coins": 18,
            "enemies_stomped": 3,
            "deaths": 1,
            "duration_sec": 48.2,
            "completed": True,
        },
    )
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["id"] == run_id
    assert updated["score"] == 3200
    assert updated["coins"] == 18
    assert updated["enemies_stomped"] == 3
    assert updated["completed"] is True


def test_patch_run_wrong_owner(client: TestClient) -> None:
    """Verify a user cannot patch another user's run."""
    token_owner = get_auth_token(client, "owner_patch")
    token_intruder = get_auth_token(client, "intruder_patch")

    create_res = client.post(
        "/runs",
        headers={"Authorization": f"Bearer {token_owner}"},
        json={"level_id": 1},
    )
    run_id = create_res.json()["id"]

    patch_res = client.patch(
        f"/runs/{run_id}",
        headers={"Authorization": f"Bearer {token_intruder}"},
        json={"score": 99999},
    )
    assert patch_res.status_code == 403
