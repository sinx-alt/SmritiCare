import time, logging
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("smriticare.request")

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        start = time.time()
        response = await call_next(request)
        duration_ms = round((time.time() - start) * 1000, 2)
        logger.info(f"{request.method} {request.url.path} {response.status_code} {duration_ms}ms")
        return response