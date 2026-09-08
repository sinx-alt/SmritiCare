from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, model_validator


class GameResult(BaseModel):
    patientId: str
    gameId: Literal[
        "memory_match",
        "pattern_recall",
        "number_sequence",
        "adaptive_chess",
        "focus_flight",
        "object_association",
        "ner_memory_quiz",
    ]
    sessionId: str

    score: float
    accuracy: float = Field(ge=0, le=1)
    reactionTime: float = Field(ge=0)
    mistakes: int = Field(ge=0)
    attempts: int = Field(ge=0)

    difficulty: int = Field(ge=1)
    duration: int = Field(ge=0)
    timestamp: datetime

    @model_validator(mode="after")
    def check_mistakes_within_attempts(self):
        if self.mistakes > self.attempts:
            raise ValueError("mistakes cannot exceed attempts")
        return self
