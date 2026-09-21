# app/audit.py
import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import AuditLog


async def write_audit_log(
    db: AsyncSession,
    actor_user_id: Optional[uuid.UUID],
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    patient_id: Optional[uuid.UUID] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    meta: Optional[dict] = None,
):
    entry = AuditLog(
        actor_user_id=actor_user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        patient_id=patient_id,
        ip_address=ip_address,
        user_agent=user_agent,
        meta=meta,
    )
    db.add(entry)
    await db.commit()