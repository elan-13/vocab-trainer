import os

class Settings:
    PROJECT_NAME = "Spaced Repetition Vocabulary Trainer"
    BACKEND_CORS_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ]
    DATABASE_URL = "sqlite:///./vocab.db"
    API_KEY = os.getenv("API_KEY", "srs-dev-secret-key-2026")

settings = Settings()

