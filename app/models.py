import uuid, enum
from datetime import datetime
from sqlalchemy import String, ForeignKey, Enum, Float, Integer, JSON, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship, DeclarativeBase
from sqlalchemy.dialects.postgresql import UUID

class Base(DeclarativeBase):
    pass

class Role(str, enum.Enum):
    patient = "patient"
    caregiver = "caregiver"

class User(Base):
    __tablename__ = "users"
    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String)
    role: Mapped[Role] = mapped_column(Enum(Role))
    full_name: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    patient_profile: Mapped["PatientProfile"] = relationship(back_populates="user", uselist=False)
    caregiver_links = relationship("PatientCaregiverLink", back_populates="caregiver")
    push_tokens = relationship("PushToken", back_populates="user")
    

class CaregiverLink(Base):
    __tablename__ = "caregiver_links"
    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    caregiver_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    patient_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    relationship_label: Mapped[str] = mapped_column(String, nullable=True)


class Patient(Base):
    __tablename__ = "patients"
    id = uuid_pk()
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    dob = Column(DateTime, nullable=True)
    region = Column(String, nullable=True)          # e.g. "Assam"
    locale = Column(String, nullable=False, default="en")  # e.g. "as", "hi", "en"
    dementia_stage = Column(String, nullable=True)  # free text / clinician-set
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="patient_profile")
    caregiver_links = relationship("PatientCaregiverLink", back_populates="patient")
    game_sessions = relationship("GameSession", back_populates="patient")
    reminders = relationship("Reminder", back_populates="patient")
    contacts = relationship("Contact", back_populates="patient")
    notes = relationship("Note", back_populates="patient")
    recommendations = relationship("AIRecommendation", back_populates="patient")


class PatientCaregiverLink(Base):
    """Many-to-many: supports multiple caregivers per patient (e.g. two children)."""
    __tablename__ = "patient_caregiver_links"
    id = uuid_pk()
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    caregiver_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    relation = Column(String, nullable=True)  # "daughter", "son", "nurse"
    access_level = Column(SAEnum(CaregiverAccessLevel), default=CaregiverAccessLevel.full, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (UniqueConstraint("patient_id", "caregiver_id", name="uq_patient_caregiver"),)

    patient = relationship("Patient", back_populates="caregiver_links")
    caregiver = relationship("User", back_populates="caregiver_links")


class GameSession(Base):
    __tablename__ = "game_sessions"
    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    game_id: Mapped[str] = mapped_column(String, index=True)
    score: Mapped[float] = mapped_column(Float)
    accuracy: Mapped[float] = mapped_column(Float)
    reaction_time: Mapped[float] = mapped_column(Float, nullable=True)
    mistakes: Mapped[int] = mapped_column(Integer, default=0)
    attempts: Mapped[int] = mapped_column(Integer, default=0)   # NEW
    difficulty: Mapped[int] = mapped_column(Integer)
    duration: Mapped[int] = mapped_column(Integer)
    raw_payload: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"
    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("game_sessions.id"), nullable=True)
    next_game: Mapped[str] = mapped_column(String)
    difficulty: Mapped[int] = mapped_column(Integer)
    duration: Mapped[int] = mapped_column(Integer, nullable=True)
    reason: Mapped[str] = mapped_column(String, nullable=True)
    change_flag: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Reminder(Base):
    __tablename__ = "reminders"
    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    category: Mapped[str] = mapped_column(String)
    title: Mapped[str] = mapped_column(String)
    scheduled_time: Mapped[datetime] = mapped_column(DateTime)
    is_recurring: Mapped[bool] = mapped_column(Boolean, default=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))