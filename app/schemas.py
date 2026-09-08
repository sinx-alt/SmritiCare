# app/schemas.py
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, EmailStr, Field, model_validator
import uuid



class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    role: str  # "patient" | "caregiver"
    full_name: str

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: uuid.UUID
    email: EmailStr
    role: str
    full_name: str

    class Config:
        from_attributes = True

GameId = Literal[
    "memory_match",
    "pattern_recall",
    "number_sequence",
    "adaptive_chess",
    "focus_flight",
    "object_association",
    "ner_memory_quiz",
]

class SessionIn(BaseModel):
    gameId: GameId
    score: float
    accuracy: float = Field(ge=0.0, le=1.0)
    reactionTime: float = Field(ge=0)
    mistakes: int = Field(ge=0, default=0)
    attempts: int = Field(ge=0, default=0)
    difficulty: int = Field(ge=1)
    duration: int = Field(ge=0)
    extra: dict = {}

    @model_validator(mode="after")
    def check_mistakes_within_attempts(self):
        if self.mistakes > self.attempts:
            raise ValueError("mistakes cannot exceed attempts")
        return self

class SessionOut(BaseModel):
    sessionId: uuid.UUID = Field(validation_alias="id")
    patientId: uuid.UUID = Field(validation_alias="patient_id")
    gameId: str = Field(validation_alias="game_id")
    score: float
    accuracy: float
    reactionTime: float | None = Field(validation_alias="reaction_time", default=None)
    mistakes: int
    attempts: int
    difficulty: int
    duration: int
    timestamp: datetime = Field(validation_alias="created_at")

    class Config:
        from_attributes = True
        populate_by_name = True

class PatientProfileOut(BaseModel):
    userId: uuid.UUID = Field(validation_alias="user_id")
    fullName: str
    email: str
    languagePref: str = Field(validation_alias="language_pref")
    baselineCompleted: bool = Field(validation_alias="baseline_completed")

    class Config:
        from_attributes = True
        populate_by_name = True

class PatientProfileUpdate(BaseModel):
    languagePref: str | None = None
    baselineCompleted: bool | None = None

class CaregiverLinkIn(BaseModel):
    patientEmail: str

class RecommendationIn(BaseModel):
    patientId: uuid.UUID
    nextGame: GameId
    difficulty: int = Field(ge=1)
    duration: int | None = None
    reason: str | None = None
    changeFlag: bool = False

class RecommendationOut(BaseModel):
    id: uuid.UUID
    patientId: uuid.UUID = Field(validation_alias="patient_id")
    nextGame: str = Field(validation_alias="next_game")
    difficulty: int
    duration: int | None = None
    reason: str | None = None
    changeFlag: bool = Field(validation_alias="change_flag")
    createdAt: datetime = Field(validation_alias="created_at")

    class Config:
        from_attributes = True
        populate_by_name = True


ReminderCategory = Literal["medicine", "appointment", "meal", "hydration", "exercise", "family"]

class ReminderIn(BaseModel):
    category: ReminderCategory
    title: str
    scheduledTime: datetime
    isRecurring: bool = False

class ReminderOut(BaseModel):
    id: uuid.UUID
    patientId: uuid.UUID = Field(validation_alias="patient_id")
    category: str
    title: str
    scheduledTime: datetime = Field(validation_alias="scheduled_time")
    isRecurring: bool = Field(validation_alias="is_recurring")
    completed: bool

    class Config:
        from_attributes = True
        populate_by_name = True

class DashboardToday(BaseModel):
    patientId: uuid.UUID
    dueReminders: list[ReminderOut]
    latestRecommendation: RecommendationOut | None
    recentSessions: list[SessionOut]

class TrendPoint(BaseModel):
    skill: str
    score: float

class CaregiverDashboard(BaseModel):
    patientId: uuid.UUID
    patientName: str
    lastSession: SessionOut | None
    trends: list[TrendPoint]
    nextSession: RecommendationOut | None
    changeFlag: bool
    totalSessions: int