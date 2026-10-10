from fastapi.testclient import TestClient
from app.api import app

client = TestClient(app, raise_server_exceptions=False)

def test_force_app_error():
    response = client.get("/force-app-error")
    assert response.status_code == 404
    assert response.json() == {"detail": "Word not found", "code": "WORD_NOT_FOUND"}

def test_force_unexpected_error():
    response = client.get("/force-error")
    assert response.status_code == 500
    assert response.json() == {"detail": "An unexpected error occurred.", "code": "INTERNAL_SERVER_ERROR"}
