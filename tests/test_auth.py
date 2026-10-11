import pytest
from fastapi.testclient import TestClient
from app.api import app
from app.core.config import settings

def test_missing_api_key_returns_403(db):
    # Create client with NO authentication header
    with TestClient(app, raise_server_exceptions=False) as unauth_client:
        response = unauth_client.get("/words/due/")
        assert response.status_code == 403
        data = response.json()
        assert data["code"] == "INVALID_API_KEY"
        assert "Forbidden" in data["detail"]

def test_invalid_api_key_returns_403(db):
    # Create client with wrong key
    with TestClient(app, raise_server_exceptions=False, headers={"X-API-Key": "wrong-key-12345"}) as bad_client:
        response = bad_client.get("/words/due/")
        assert response.status_code == 403
        data = response.json()
        assert data["code"] == "INVALID_API_KEY"

def test_valid_api_key_allows_access(db):
    # Create client with correct key
    with TestClient(app, raise_server_exceptions=False, headers={"X-API-Key": settings.API_KEY}) as good_client:
        response = good_client.get("/words/due/")
        assert response.status_code == 200

def test_public_root_accessible_without_api_key():
    with TestClient(app, raise_server_exceptions=False) as unauth_client:
        response = unauth_client.get("/")
        assert response.status_code == 200
        assert "Welcome" in response.json()["message"]
