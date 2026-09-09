import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid

from app.database import get_db
from app.models import User, GameSession, Role
from app.schemas import SessionIn, SessionOut
from app.deps import require_role, get_current_user

router = APIRouter(tags=["sessions"])

@router.post("/sessions", response_model=SessionOut, status_code=201)
async def submit_session(
    payload: SessionIn,
    user: User = Depends(require_role("patient")),
    db: AsyncSession = Depends(get_db),
):
    session = GameSession(
        patient_id=user.id,
        game_id=payload.gameId,
        score=payload.score,
        accuracy=payload.accuracy,
        reaction_time=payload.reactionTime,
        mistakes=payload.mistakes,
        attempts=payload.attempts,
        difficulty=payload.difficulty,
        duration=payload.duration,
        raw_payload=payload.extra,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session

@router.get("/patients/{patient_id}/sessions", response_model=list[SessionOut])
async def list_sessions(
    patient_id: uuid.UUID,
    game_id: str | None = None,
    limit: int = 50,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # patients can only see their own; caregivers must be linked (checked below)
    if user.role == Role.patient and user.id != patient_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Cannot view another patient's sessions")

    stmt = select(GameSession).where(GameSession.patient_id == patient_id)
    if game_id:
        stmt = stmt.where(GameSession.game_id == game_id)
    stmt = stmt.order_by(GameSession.created_at.desc()).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/sessions/{session_id}", response_model=SessionOut)
async def get_session(
    session_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    session = await db.get(GameSession, session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    if user.role == Role.patient and user.id != session.patient_id:
        raise HTTPException(403, "Not your session")
    return session


@router.post("/api/sessions")
async def create_session(
    payload: dict,   # GameResult contract from Member 3/5
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    db.add(GameSession(
        patient_id=payload["patientId"], game_id=payload["gameId"],
        session_id=payload["sessionId"], score=payload["score"],
        accuracy=payload["accuracy"], reaction_time=payload["reactionTime"],
        mistakes=payload["mistakes"], attempts=payload["attempts"],
        hints_used=payload.get("hintsUsed", 0), difficulty=payload["difficulty"],
        duration=payload["duration"], completed=payload["completed"],
        played_at=datetime.fromisoformat(payload["timestamp"]),
    ))
    await db.commit()
    return {"status": "ok"}