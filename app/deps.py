from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.auth import decode_token
from app.models import User
from fastapi import Header
from app.config import settings
from sqlalchemy import select
from app.models import CaregiverLink

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")
    user = await db.get(User, payload["sub"])
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")
    return user

def require_role(*roles: str):
    async def checker(user: User = Depends(get_current_user)) -> User:
        if user.role.value not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient permissions")
        return user
    return checker

async def require_service_token(x_service_token: str = Header(...)):
    if x_service_token != settings.service_token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid service token")
    return True

async def verify_caregiver_access(caregiver_id, patient_id, db: AsyncSession) -> bool:
    stmt = select(CaregiverLink).where(
        CaregiverLink.caregiver_id == caregiver_id,
        CaregiverLink.patient_id == patient_id,
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none() is not None