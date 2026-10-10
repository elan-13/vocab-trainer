from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging, LoggingMiddleware
from app.core.errors import AppError, app_error_handler, catch_all_exception_handler

setup_logging()

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(LoggingMiddleware)

app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(Exception, catch_all_exception_handler)

from app.routers import words

app.include_router(words.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Spaced Repetition Vocabulary Trainer API. Go to /docs for the API documentation."}

@app.get("/force-error")
def force_error():
    raise Exception("This is a forced unexpected error")

@app.get("/force-app-error")
def force_app_error():
    from app.core.errors import WordNotFound
    raise WordNotFound()
