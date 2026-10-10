class Settings:
    PROJECT_NAME = "Spaced Repetition Vocabulary Trainer"
    BACKEND_CORS_ORIGINS = ["http://localhost:3000"]
    DATABASE_URL = "sqlite:///./vocab.db"

settings = Settings()
