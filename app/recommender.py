from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import GameSession, AIRecommendation

GAME_ROTATION = [
    "memory_match", "pattern_recall", "number_sequence",
    "adaptive_chess", "focus_flight", "object_association", "ner_memory_quiz",
]

async def generate_stub_recommendation(patient_id, db: AsyncSession) -> AIRecommendation:
    """Simple rule-based fallback until M3's real model is wired in.
    Same output shape as the real AI service -> swappable later without touching the API."""
    stmt = (
        select(GameSession)
        .where(GameSession.patient_id == patient_id)
        .order_by(GameSession.created_at.desc())
        .limit(5)
    )
    result = await db.execute(stmt)
    recent = result.scalars().all()

    if not recent:
        next_game = GAME_ROTATION[0]
        difficulty = 1
        reason = "no prior sessions — starting baseline"
        change_flag = False
    else:
        avg_accuracy = sum(s.accuracy for s in recent) / len(recent)
        last = recent[0]
        current_idx = GAME_ROTATION.index(last.game_id) if last.game_id in GAME_ROTATION else 0
        next_game = GAME_ROTATION[(current_idx + 1) % len(GAME_ROTATION)]

        if avg_accuracy >= 0.85:
            difficulty = min(last.difficulty + 1, 5)
            reason = f"recent accuracy {avg_accuracy:.0%} — increasing difficulty"
        elif avg_accuracy < 0.50:
            difficulty = max(last.difficulty - 1, 1)
            reason = f"recent accuracy {avg_accuracy:.0%} — simplifying"
        else:
            difficulty = last.difficulty
            reason = f"recent accuracy {avg_accuracy:.0%} — maintaining difficulty"

        change_flag = avg_accuracy < 0.40  # crude persistent-deviation flag for now

    rec = AIRecommendation(
        patient_id=patient_id,
        next_game=next_game,
        difficulty=difficulty,
        duration=8,
        reason=reason,
        change_flag=change_flag,
    )
    db.add(rec)
    await db.commit()
    await db.refresh(rec)
    return rec