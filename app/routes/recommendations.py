from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
from app.recommender import generate_stub_recommendation

from app.database import get_db
from app.models import User, AIRecommendation, Role
from app.schemas import RecommendationIn, RecommendationOut
from app.deps import get_current_user, require_service_token

router = APIRouter(tags=["recommendations"])

@router.post("/recommendations", response_model=RecommendationOut, status_code=201)
async def submit_recommendation(
    payload: RecommendationIn,
    _: bool = Depends(require_service_token),
    db: AsyncSession = Depends(get_db),
):
    rec = AIRecommendation(
        patient_id=payload.patientId,
        next_game=payload.nextGame,
        difficulty=payload.difficulty,
        duration=payload.duration,
        reason=payload.reason,
        change_flag=payload.changeFlag,
    )
    db.add(rec)
    await db.commit()
    await db.refresh(rec)
    return rec

@router.get("/patients/{patient_id}/recommendations/latest", response_model=RecommendationOut)
async def latest_recommendation(
    patient_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if user.role == Role.patient and user.id != patient_id:
        raise HTTPException(403, "Cannot view another patient's recommendations")

    stmt = (
        select(AIRecommendation)
        .where(AIRecommendation.patient_id == patient_id)
        .order_by(AIRecommendation.created_at.desc())
        .limit(1)
    )
    result = await db.execute(stmt)
    rec = result.scalar_one_or_none()
    if not rec:
        raise HTTPException(404, "No recommendation yet for this patient")
    return rec

@router.post("/patients/{patient_id}/recommendations/generate-stub", 
             response_model=RecommendationOut,
               include_in_schema=False, 
             )
async def trigger_stub_recommendation(
    patient_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Dev-only endpoint — remove or restrict once M3's real service is live."""
    if user.role == Role.patient and user.id != patient_id:
        raise HTTPException(403, "Cannot generate for another patient")
    return await generate_stub_recommendation(patient_id, db)