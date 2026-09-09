"""
SmritiCare — app/models.py
Single source of truth for the PostgreSQL schema. All models share one Base.
"""
import uuid
import enum
from datetime import datetime

from sqlalchemy import (
    Column, String, Boolean, Integer, Float, DateTime, ForeignKey,
    Enum as SAEnum, UniqueConstraint, Index, Text, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


def uuid_pk():
    return Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)


# ---------- Enums ----------

class UserRole(str, enum.Enum):
    patient = "patient"
    caregiver = "caregiver"
    admin = "admin"


class GameId(str, enum.Enum):
    memory_match = "memory_match"
    pattern_recall = "pattern_recall"
    number_sequence = "number_sequence"
    adaptive_chess = "adaptive_chess"
    focus_flight = "focus_flight"
    object_association = "object_association"
    ner_memory_quiz = "ner_memory_quiz"


class ReminderType(str, enum.Enum):
    medicine = "medicine"
    appointment = "appointment"
    meal = "meal"
    hydration = "hydration"
    exercise = "exercise"
    event = "event"
    contact = "contact"
    note = "note"


class RepeatType(str, enum.Enum):
    once = "once"
    daily = "daily"
    weekly = "weekly"


class SyncStatus(str, enum.Enum):
    pending = "pending"
    synced = "synced"
    failed = "failed"


class CaregiverAccessLevel(str, enum.Enum):
    full = "full"
    view_only = "view_only"


# ---------- Core identity ----------

class User(Base):
    __tablename__ = "users"

    id = uuid_pk()
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(SAEnum(UserRole), nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    patient_profile = relationship("Patient", back_populates="user", uselist=False)
    caregiver_links = relationship("PatientCaregiverLink", back_populates="caregiver")
    push_tokens = relationship("PushToken", back_populates="user")


class Patient(Base):
    __tablename__ = "patients"

    id = uuid_pk()
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    dob = Column(DateTime, nullable=True)
    region = Column(String, nullable=True)
    locale = Column(String, nullable=False, default="en")
    dementia_stage = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="patient_profile")
    caregiver_links = relationship("PatientCaregiverLink", back_populates="patient")
    game_sessions = relationship("GameSession", back_populates="patient")
    reminders = relationship("Reminder", back_populates="patient")
    contacts = relationship("Contact", back_populates="patient")
    notes = relationship("Note", back_populates="patient")
    recommendations = relationship("AIRecommendation", back_populates="patient")
    baseline_completed = Column(Boolean, default=False, nullable=False)



class PatientCaregiverLink(Base):
    __tablename__ = "patient_caregiver_links"

    id = uuid_pk()
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    caregiver_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    relation = Column(String, nullable=True)
    access_level = Column(SAEnum(CaregiverAccessLevel), default=CaregiverAccessLevel.full, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (UniqueConstraint("patient_id", "caregiver_id", name="uq_patient_caregiver"),)

    patient = relationship("Patient", back_populates="caregiver_links")
    caregiver = relationship("User", back_populates="caregiver_links")


# ---------- Game results ----------

class GameSession(Base):
    __tablename__ = "game_sessions"

    id = uuid_pk()
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False, index=True)
    game_id = Column(SAEnum(GameId), nullable=False)
    session_id = Column(String, unique=True, nullable=False)

    score = Column(Float, nullable=False)
    accuracy = Column(Float, nullable=False)
    reaction_time = Column(Float, nullable=False)
    mistakes = Column(Integer, nullable=False)
    attempts = Column(Integer, nullable=False)
    hints_used = Column(Integer, default=0, nullable=False)
    difficulty = Column(Integer, nullable=False)
    duration = Column(Integer, nullable=False)
    completed = Column(Boolean, nullable=False)
    played_at = Column(DateTime, nullable=False)
    sync_status = Column(SAEnum(SyncStatus), default=SyncStatus.pending, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    patient = relationship("Patient", back_populates="game_sessions")

    __table_args__ = (Index("ix_game_sessions_patient_game", "patient_id", "game_id"),)


class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = uuid_pk()
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False, index=True)
    game_id = Column(SAEnum(GameId), nullable=True)
    recommended_difficulty = Column(Integer, nullable=True)
    recommended_next_game = Column(SAEnum(GameId), nullable=True)
    confidence = Column(Float, nullable=True)
    model_version = Column(String, nullable=True)
    generated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    patient = relationship("Patient", back_populates="recommendations")
    duration = Column(Integer, nullable=True)
    reason = Column(String, nullable=True)
    change_flag = Column(Boolean, default=False, nullable=False)


# ---------- Memory Assistant (mirrors Member 5's local schema) ----------

class Reminder(Base):
    __tablename__ = "reminders"

    id = uuid_pk()
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False, index=True)
    type = Column(SAEnum(ReminderType), nullable=False)
    title = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    time = Column(String, nullable=False)
    date = Column(String, nullable=True)
    repeat = Column(SAEnum(RepeatType), nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False)
    language = Column(String, nullable=False, default="en")
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    patient = relationship("Patient", back_populates="reminders")

    __table_args__ = (Index("ix_reminders_patient_time", "patient_id", "time"),)


class Contact(Base):
    __tablename__ = "contacts"

    id = uuid_pk()
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    relation = Column(String, nullable=False)
    phone = Column(String, nullable=True)

    patient = relationship("Patient", back_populates="contacts")


class Note(Base):
    __tablename__ = "notes"

    id = uuid_pk()
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    patient = relationship("Patient", back_populates="notes")


# ---------- Push notifications ----------

class PushToken(Base):
    __tablename__ = "push_tokens"

    id = uuid_pk()
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    fcm_token = Column(String, unique=True, nullable=False)
    platform = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_used_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="push_tokens")


# ---------- Security / compliance ----------

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = uuid_pk()
    actor_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    resource_type = Column(String, nullable=False)
    resource_id = Column(String, nullable=True)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=True, index=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    meta = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)