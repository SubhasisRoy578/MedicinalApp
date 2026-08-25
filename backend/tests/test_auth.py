import pytest
from fastapi.testclient import TestClient

def test_health_check(client: TestClient):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_register_and_login_patient(client: TestClient):
    # 1. Register Patient
    payload = {
        "name": "Priya Sen",
        "email": "priya.sen@example.com",
        "password": "Password@123",
        "role": "PATIENT",
        "phone": "+91 9988776655",
        "date_of_birth": "1992-04-12",
        "gender": "Female",
        "blood_group": "O+",
        "preferred_language": "Bengali"
    }
    reg_resp = client.post("/api/auth/register", json=payload)
    assert reg_resp.status_code == 201
    reg_data = reg_resp.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == "priya.sen@example.com"
    assert reg_data["user"]["role"] == "PATIENT"

    # 2. Login with valid credentials
    login_resp = client.post("/api/auth/login", json={
        "email": "priya.sen@example.com",
        "password": "Password@123"
    })
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert "access_token" in login_data

    # 3. Login with invalid password
    bad_login = client.post("/api/auth/login", json={
        "email": "priya.sen@example.com",
        "password": "WrongPassword!"
    })
    assert bad_login.status_code == 401

def test_duplicate_registration_fails(client: TestClient):
    payload = {
        "name": "Duplicate User",
        "email": "priya.sen@example.com",
        "password": "Password@123",
        "role": "PATIENT"
    }
    resp = client.post("/api/auth/register", json=payload)
    assert resp.status_code == 400
