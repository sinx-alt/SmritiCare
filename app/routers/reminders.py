from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, date
import uuid

from app.database import get_db
from app.models import User, Reminder, Role
from app.schemas import ReminderIn, ReminderOut
from app.deps import get_current_user

router = APIRouter(tags=["reminders"])

@router.post("/reminders", response_model=ReminderOut, status_code=201)
async def create_reminder(
    payload: ReminderIn,
    patient_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # caregiver creating for a linked patient, or patient creating for themself
    if user.role == Role.patient and user.id != patient_id:
        raise HTTPException(403, "Cannot create reminders for another patient")

    reminder = Reminder(
        patient_id=patient_id,
        category=payload.category,
        title=payload.title,
        scheduled_time=payload.scheduledTime,
        is_recurring=payload.isRecurring,
        created_by=user.id,
    )
    db.add(reminder)
    await db.commit()
    await db.refresh(reminder)
    return reminder

@router.get("/patients/{patient_id}/reminders", response_model=list[ReminderOut])
async def list_reminders(
    patient_id: uuid.UUID,
    date_filter: str | None = None,  # "today" or "YYYY-MM-DD"
    category: str | None = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if user.role == Role.patient and user.id != patient_id:
        raise HTTPException(403, "Cannot view another patient's reminders")

    stmt = select(Reminder).where(Reminder.patient_id == patient_id)

    if date_filter:
        target_date = date.today() if date_filter == "today" else datetime.strptime(date_filter, "%Y-%m-%d").date()
        stmt = stmt.where(func.date(Reminder.scheduled_time) == target_date)

    if category:
        stmt = stmt.where(Reminder.category == category)

    stmt = stmt.order_by(Reminder.scheduled_time.asc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.patch("/reminders/{reminder_id}/complete", response_model=ReminderOut)
async def complete_reminder(
    reminder_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    reminder = await db.get(Reminder, reminder_id)
    if not reminder:
        raise HTTPException(404, "Reminder not found")
    if user.role == Role.patient and user.id != reminder.patient_id:
        raise HTTPException(403, "Not your reminder")

    reminder.completed = True
    await db.commit()
    await db.refresh(reminder)

    # if recurring, spawn the next occurrence (simple daily recurrence for now)
    if reminder.is_recurring:
        from datetime import timedelta
        next_time = reminder.scheduled_time + timedelta(days=1)
        db.add(Reminder(
            patient_id=reminder.patient_id,
            category=reminder.category,
            title=reminder.title,
            scheduled_time=next_time,
            is_recurring=True,
            created_by=reminder.created_by,
        ))
        await db.commit()

    return reminder