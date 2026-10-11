from fastapi import Security
from fastapi.security import APIKeyHeader
from app.db.database import SessionLocal
from app.core.config import settings
from app.core.errors import AuthenticationFailed

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_api_key(api_key: str = Security(api_key_header)):
    if not api_key or api_key != settings.API_KEY:
        raise AuthenticationFailed()
    return api_key

