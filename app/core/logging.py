import logging
import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

logger = logging.getLogger("vocab_trainer")

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        response = None
        try:
            response = await call_next(request)
            return response
        finally:
            process_time = time.time() - start_time
            status_code = response.status_code if response else 500
            logger.info(
                f"{request.method} {request.url.path} "
                f"- Status: {status_code} "
                f"- Time: {process_time:.4f}s"
            )
