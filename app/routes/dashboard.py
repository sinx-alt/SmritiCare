from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid

from app.database import get_db
from app.models import User, Reminder, GameSession, AIRecommendation, Role,Patient
from app.schemas import DashboardToday, CaregiverDashboard, TrendPoint
from app.deps import get_current_user, verify_caregiver_access,require_patient_access

router = APIRouter(tags=["dashboard"])

GAME_SKILL_MAP = {
    "memory_match": "Memory",
    "pattern_recall": "Memory",
    "number_sequence": "Reasoning",
    "adaptive_chess": "Planning",
    "focus_flight": "Attention",
    "object_association": "Reasoning",
    "ner_memory_quiz": "Language",
}

@router.get("/dashboard/today", response_model=DashboardToday)
async def dashboard_today(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if user.role != Role.patient:
        raise HTTPException(403, "Only patients have a today-dashboard")

    from datetime import date
    from sqlalchemy import func

    reminders_stmt = (
        select(Reminder)
        .where(Reminder.patient_id == user.id, func.date(Reminder.scheduled_time) == date.today())
        .order_by(Reminder.scheduled_time.asc())
    )
    reminders = (await db.execute(reminders_stmt)).scalars().all()

    rec_stmt = (
        select(AIRecommendation)
        .where(AIRecommendation.patient_id == user.id)
        .order_by(AIRecommendation.created_at.desc())
        .limit(1)
    )
    latest_rec = (await db.execute(rec_stmt)).scalar_one_or_none()

    sessions_stmt = (
        select(GameSession)
        .where(GameSession.patient_id == user.id)
        .order_by(GameSession.created_at.desc())
        .limit(5)
    )
    recent_sessions = (await db.execute(sessions_stmt)).scalars().all()

    return DashboardToday(
        patientId=user.id,
        dueReminders=reminders,
        latestRecommendation=latest_rec,
        recentSessions=recent_sessions,
    )


@router.get("/dashboard/caregiver/{patient_id}", response_model=CaregiverDashboard)
async def dashboard_caregiver(
    patient_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if user.role == Role.caregiver:
        allowed = await verify_caregiver_access(user.id, patient_id, db)
        if not allowed:
            raise HTTPException(403, "Not linked to this patient")
    elif user.role == Role.patient and user.id != patient_id:
        raise HTTPException(403, "Cannot view another patient's dashboard")

    patient = await db.get(User, patient_id)
    if not patient:
        raise HTTPException(404, "Patient not found")

    sessions_stmt = (
        select(GameSession)
        .where(GameSession.patient_id == patient_id)
        .order_by(GameSession.created_at.desc())
        .limit(30)
    )
    sessions = (await db.execute(sessions_stmt)).scalars().all()

    last_session = sessions[0] if sessions else None
    total_sessions = len(sessions)

    # simple per-skill average accuracy, most recent 30 sessions
    skill_totals: dict[str, list[float]] = {}
    for s in sessions:
        skill = GAME_SKILL_MAP.get(s.game_id, "General")
        skill_totals.setdefault(skill, []).append(s.accuracy)
    trends = [
        TrendPoint(skill=skill, score=round(sum(vals) / len(vals) * 100, 1))
        for skill, vals in skill_totals.items()
    ]

    rec_stmt = (
        select(AIRecommendation)
        .where(AIRecommendation.patient_id == patient_id)
        .order_by(AIRecommendation.created_at.desc())
        .limit(1)
    )
    latest_rec = (await db.execute(rec_stmt)).scalar_one_or_none()
    change_flag = latest_rec.change_flag if latest_rec else False

    return CaregiverDashboard(
        patientId=patient_id,
        patientName=patient.full_name,
        lastSession=last_session,
        trends=trends,
        nextSession=latest_rec,
        changeFlag=change_flag,
        totalSessions=total_sessions,
    )


@router.get("/api/dashboard/{patient_id}/overview")
async def get_overview(
    patient_id: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(require_patient_access),
):
    patient_row = (await db.execute(
        select(Patient, User).join(User, Patient.user_id == User.id).where(Patient.id == patient_id)
    )).first()
    if not patient_row:
        raise HTTPException(404, "Patient not found")
    patient, u = patient_row

    sessions = (await db.execute(
        select(GameSession).where(GameSession.patient_id == patient_id)
        .order_by(GameSession.played_at.desc()).limit(10)
    )).scalars().all()

    rec = (await db.execute(
        select(AIRecommendation).where(AIRecommendation.patient_id == patient_id)
        .order_by(AIRecommendation.generated_at.desc()).limit(1)
    )).scalar_one_or_none()

    return {
        "patient": {
            "userId": str(u.id), "fullName": u.full_name, "email": u.email,
            "languagePref": patient.locale, "baselineCompleted": patient.baseline_completed,
        },
        "sessions": [
            {"sessionId": s.session_id, "patientId": str(s.patient_id), "gameId": s.game_id.value,
             "score": s.score, "accuracy": s.accuracy, "reactionTime": s.reaction_time,
             "mistakes": s.mistakes, "attempts": s.attempts, "difficulty": s.difficulty,
             "duration": s.duration, "timestamp": s.played_at.isoformat()}
            for s in sessions
        ],
        "recommendation": {
            "id": str(rec.id), "patientId": str(rec.patient_id), "nextGame": rec.recommended_next_game.value,
            "difficulty": rec.recommended_difficulty, "duration": rec.duration,
            "reason": rec.reason, "changeFlag": rec.change_flag,
        } if rec else None,
    }
    # pull recent game_sessions, active reminders, latest recommendation
    # return them as one combined JSON object
    ...