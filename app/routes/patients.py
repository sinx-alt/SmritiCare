from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid

from app.database import get_db
from app.models import User, PatientProfile, CaregiverLink, Role
from app.schemas import PatientProfileOut, PatientProfileUpdate, CaregiverLinkIn
from app.deps import get_current_user, require_role

router = APIRouter(tags=["patients"])

@router.get("/patients/{patient_id}", response_model=PatientProfileOut)
async def get_patient(
    patient_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if user.role == Role.patient and user.id != patient_id:
        raise HTTPException(403, "Cannot view another patient's profile")
    profile = await db.get(PatientProfile, patient_id)
    patient_user = await db.get(User, patient_id)
    if not profile or not patient_user:
        raise HTTPException(404, "Patient not found")
    return PatientProfileOut(
        user_id=patient_user.id,
        fullName=patient_user.full_name,
        email=patient_user.email,
        language_pref=profile.language_pref,
        baseline_completed=profile.baseline_completed,
    )

@router.patch("/patients/{patient_id}", response_model=PatientProfileOut)
async def update_patient(
    patient_id: uuid.UUID,
    payload: PatientProfileUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if user.role == Role.patient and user.id != patient_id:
        raise HTTPException(403, "Cannot edit another patient's profile")
    profile = await db.get(PatientProfile, patient_id)
    if not profile:
        raise HTTPException(404, "Patient not found")
    if payload.languagePref is not None:
        profile.language_pref = payload.languagePref
    if payload.baselineCompleted is not None:
        profile.baseline_completed = payload.baselineCompleted
    await db.commit()
    await db.refresh(profile)
    patient_user = await db.get(User, patient_id)
    return PatientProfileOut(
        user_id=patient_user.id,
        fullName=patient_user.full_name,
        email=patient_user.email,
        language_pref=profile.language_pref,
        baseline_completed=profile.baseline_completed,
    )

@router.post("/caregiver-links", status_code=201)
async def link_caregiver(
    payload: CaregiverLinkIn,
    user: User = Depends(require_role("caregiver")),
    db: AsyncSession = Depends(get_db),
):
    patient = await db.scalar(select(User).where(User.email == payload.patientEmail))
    if not patient or patient.role != Role.patient:
        raise HTTPException(404, "Patient not found")
    link = CaregiverLink(caregiver_id=user.id, patient_id=patient.id)
    db.add(link)
    await db.commit()
    return {"caregiverId": str(user.id), "patientId": str(patient.id)}