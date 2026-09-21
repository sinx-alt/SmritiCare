"""
SmritiCare — app/models.py
Matches the schema created by your applied migrations:
c68542d0a467_init_auth_and_core_tables, b9cf0d6643a0_add_attempts_to_game_sessions.
AuditLog and PushToken are new — not yet migrated (see migration step below).
"""
import uuid
import enum
from datetime import datetime

from sqlalchemy import (
    Column, String, Boolean, Integer, Float, DateTime, ForeignKey,
    Enum as SAEnum, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


def uuid_pk():
    return Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)


class Role(str, enum.Enum):
    patient = "patient"
    caregiver = "caregiver"


class User(Base):
    __tablename__ = "users"

    id = uuid_pk()
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(SAEnum(Role, name="role"), nullable=False)
    full_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    patient_profile = relationship("PatientProfile", back_populates="user", uselist=False)


class CaregiverLink(Base):
    __tablename__ = "caregiver_links"

    id = uuid_pk()
    caregiver_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    relationship_label = Column(String, nullable=True)


class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    language_pref = Column(String, nullable=False, default="en")
    baseline_completed = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="patient_profile")


class GameSession(Base):
    __tablename__ = "game_sessions"

    id = uuid_pk()
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    game_id = Column(String, nullable=False, index=True)
    score = Column(Float, nullable=False)
    accuracy = Column(Float, nullable=False)
    reaction_time = Column(Float, nullable=True)
    mistakes = Column(Integer, nullable=False)
    attempts = Column(Integer, nullable=False)
    difficulty = Column(Integer, nullable=False)
    duration = Column(Integer, nullable=False)
    raw_payload = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Reminder(Base):
    __tablename__ = "reminders"

    id = uuid_pk()
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    category = Column(String, nullable=False)
    title = Column(String, nullable=False)
    scheduled_time = Column(DateTime, nullable=False)
    is_recurring = Column(Boolean, default=False, nullable=False)
    completed = Column(Boolean, default=False, nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)


class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = uuid_pk()
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("game_sessions.id"), nullable=True)
    next_game = Column(String, nullable=False)
    difficulty = Column(Integer, nullable=False)
    duration = Column(Integer, nullable=True)
    reason = Column(String, nullable=True)
    change_flag = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


# ---------- New (Day 2 security) — additive, needs a new migration, see below ----------

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = uuid_pk()
    actor_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    resource_type = Column(String, nullable=False)
    resource_id = Column(String, nullable=True)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    meta = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)


class PushToken(Base):
    __tablename__ = "push_tokens"

    id = uuid_pk()
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    fcm_token = Column(String, unique=True, nullable=False)
    platform = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)