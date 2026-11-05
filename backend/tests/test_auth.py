"""Integration tests for authentication endpoints."""

from fastapi.testclient import TestClient


def test_register_success(client: TestClient) -> None:
    """Verify that a new user can register successfully."""
    response = client.post(
        "/auth/register",
        json={
            "username": "mario_player",
            "email": "mario@example.com",
            "password": "SuperSecretPassword123",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "mario_player"
    assert data["email"] == "mario@example.com"
    assert "id" in data
    assert "password" not in data
    assert "password_hash" not in data


def test_register_duplicate_username(client: TestClient) -> None:
    """Verify that duplicate username registration is rejected with HTTP 400."""
    user_payload = {
        "username": "mario_player",
        "email": "mario@example.com",
        "password": "Password123",
    }
    # Initial registration
    res1 = client.post("/auth/register", json=user_payload)
    assert res1.status_code == 201

    # Attempt registration with duplicate username and different email
    res2 = client.post(
        "/auth/register",
        json={
            "username": "mario_player",
            "email": "different_mario@example.com",
            "password": "Password456",
        },
    )
    assert res2.status_code == 400
    assert "Username already registered" in res2.json()["detail"]


def test_register_duplicate_email(client: TestClient) -> None:
    """Verify that duplicate email registration is rejected with HTTP 400."""
    user_payload = {
        "username": "mario_player_one",
        "email": "shared@example.com",
        "password": "Password123",
    }
    res1 = client.post("/auth/register", json=user_payload)
    assert res1.status_code == 201

    # Attempt registration with different username and duplicate email
    res2 = client.post(
        "/auth/register",
        json={
            "username": "mario_player_two",
            "email": "shared@example.com",
            "password": "Password456",
        },
    )
    assert res2.status_code == 400
    assert "Email already registered" in res2.json()["detail"]


def test_login_success_and_token(client: TestClient) -> None:
    """Verify that registered user can log in and receive a bearer token."""
    client.post(
        "/auth/register",
        json={
            "username": "luigi",
            "email": "luigi@example.com",
            "password": "GreenCapPassword1",
        },
    )

    # Login with JSON payload
    response = client.post(
        "/auth/login",
        json={"username": "luigi", "password": "GreenCapPassword1"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert len(data["access_token"]) > 20


def test_login_wrong_password(client: TestClient) -> None:
    """Verify that login with incorrect password fails with HTTP 401."""
    client.post(
        "/auth/register",
        json={
            "username": "toad",
            "email": "toad@example.com",
            "password": "CorrectPassword",
        },
    )

    response = client.post(
        "/auth/login",
        json={"username": "toad", "password": "IncorrectPassword"},
    )
    assert response.status_code == 401
    assert "Incorrect username or password" in response.json()["detail"]


def test_auth_me_with_and_without_token(client: TestClient) -> None:
    """Verify GET /auth/me behavior with and without valid authentication."""
    # Register and log in
    client.post(
        "/auth/register",
        json={
            "username": "peach",
            "email": "peach@example.com",
            "password": "PrincessPassword1",
        },
    )
    login_res = client.post(
        "/auth/login",
        json={"username": "peach", "password": "PrincessPassword1"},
    )
    token = login_res.json()["access_token"]

    # 1. Access /auth/me without token -> 401
    unauth_res = client.get("/auth/me")
    assert unauth_res.status_code == 401

    # 2. Access /auth/me with invalid token -> 401
    invalid_res = client.get(
        "/auth/me",
        headers={"Authorization": "Bearer invalid_token_123"},
    )
    assert invalid_res.status_code == 401

    # 3. Access /auth/me with valid token -> 200 with user profile
    auth_res = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert auth_res.status_code == 200
    user_data = auth_res.json()
    assert user_data["username"] == "peach"
    assert user_data["email"] == "peach@example.com"
    assert "id" in user_data

