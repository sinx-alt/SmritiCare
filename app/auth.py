import uuid
from datetime import datetime, timedelta
from typing import Optional


from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


from app.config import settings
from app.database import get_db
from app.models import User, UserRole, Patient, PatientCaregiverLink
from app.audit import write_audit_log


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_token(data: dict, expires_delta: timedelta) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.utcnow() + expires_delta
    return jwt.encode(to_encode, settings.secret_key, algorithm="HS256")

def create_access_token(user_id: str, role: str) -> str:
    return create_token(
        {"sub": user_id, "role": role, "type": "access"},
        timedelta(minutes=settings.access_token_expire_minutes),
    )

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None or not user.is_active:
        raise credentials_exception
    return user

def create_refresh_token(user_id: str) -> str:
    return create_token(
        {"sub": user_id, "type": "refresh"},
        timedelta(days=settings.refresh_token_expire_days),
    )

def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=["HS256"])
    except JWTError:
        return None

def require_role(*allowed_roles: UserRole):
    def checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed_roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Not permitted for this role")
        return user
    return checker


def require_patient_access(patient_id: uuid.UUID):
    """Row-level check: patient themself, a linked caregiver, or an admin."""
    async def checker(
        request: Request,
        user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ) -> User:
        allowed = False

        if user.role == UserRole.admin:
            allowed = True
        elif user.role == UserRole.patient:
            result = await db.execute(select(Patient).where(Patient.user_id == user.id))
            patient = result.scalar_one_or_none()
            allowed = patient is not None and patient.id == patient_id
        elif user.role == UserRole.caregiver:
            result = await db.execute(
                select(PatientCaregiverLink).where(
                    PatientCaregiverLink.patient_id == patient_id,
                    PatientCaregiverLink.caregiver_id == user.id,
                )
            )
            allowed = result.scalar_one_or_none() is not None

        await write_audit_log(
            db, actor_user_id=user.id, action="READ", resource_type="patient",
            resource_id=str(patient_id), patient_id=patient_id,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
        )

        if not allowed:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "No access to this patient's data")
        return user
    return checker