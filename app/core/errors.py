from fastapi import Request, status
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger("vocab_trainer")

class AppError(Exception):
    def __init__(self, detail: str, code: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        self.detail = detail
        self.code = code
        self.status_code = status_code

class WordNotFound(AppError):
    def __init__(self, detail: str = "Word not found"):
        super().__init__(detail, "WORD_NOT_FOUND", status.HTTP_404_NOT_FOUND)

class DuplicateWord(AppError):
    def __init__(self, detail: str = "Word already exists in this language"):
        super().__init__(detail, "DUPLICATE_WORD", status.HTTP_409_CONFLICT)

class AuthenticationFailed(AppError):
    def __init__(self, detail: str = "Forbidden: Invalid or missing API Key"):
        super().__init__(detail, "INVALID_API_KEY", status.HTTP_403_FORBIDDEN)


def app_error_handler(request: Request, exc: AppError):
    logger.error(f"AppError: {exc.detail} (Code: {exc.code})")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "code": exc.code},
    )

def catch_all_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred.", "code": "INTERNAL_SERVER_ERROR"},
    )
