from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import User, Role, PatientProfile
from app.schemas import RegisterIn, LoginIn, TokenOut, UserOut
from app.auth import hash_password, verify_password, create_access_token, create_refresh_token
from app.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserOut, status_code=201)
async def register(payload: RegisterIn, db: AsyncSession = Depends(get_db)):
    existing = await db.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(400, "Email already registered")
    if payload.role not in ("patient", "caregiver"):
        raise HTTPException(400, "role must be 'patient' or 'caregiver'")

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=Role(payload.role),
        full_name=payload.full_name,
    )
    db.add(user)
    await db.flush()

    if user.role == Role.patient:
        db.add(PatientProfile(user_id=user.id))

    await db.commit()
    await db.refresh(user)
    return user

@router.post("/login", response_model=TokenOut)
async def login(payload: LoginIn, db: AsyncSession = Depends(get_db)):
    user = await db.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(401, "Incorrect email or password")
    return TokenOut(
        access_token=create_access_token(str(user.id), user.role.value),
        refresh_token=create_refresh_token(str(user.id)),
    )

@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)):
    return user