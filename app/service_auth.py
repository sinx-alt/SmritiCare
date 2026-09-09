from typing import Optional
from fastapi import Header, HTTPException, status
from app.config import settings

async def require_service_credentials(
    x_service_token: Optional[str] = Header(default=None),
    x_service_key: Optional[str] = Header(default=None),
):
    if x_service_token != settings.service_token or x_service_key != settings.service_key:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid service credentials")