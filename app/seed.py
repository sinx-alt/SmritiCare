import asyncio
from datetime import datetime, timedelta
import random
from app.database import async_session
from app.models import User, Role, PatientProfile, GameSession
from app.auth import hash_password

GAME_IDS = ["memory_match", "pattern_recall", "number_sequence",
            "adaptive_chess", "focus_flight", "object_association", "ner_memory_quiz"]

async def seed():
    async with async_session() as db:
        patient = User(
            email="demo.patient@example.com",
            hashed_password=hash_password("test1234"),
            role=Role.patient,
            full_name="Demo Patient",
        )
        db.add(patient)
        await db.flush()
        db.add(PatientProfile(user_id=patient.id))

        for i in range(20):
            game = random.choice(GAME_IDS)
            db.add(GameSession(
                patient_id=patient.id,
                game_id=game,
                score=round(random.uniform(40, 95), 1),
                accuracy=round(random.uniform(0.4, 0.95), 2),
                reaction_time=round(random.uniform(0.8, 3.0), 2),
                mistakes=random.randint(0, 6),
                difficulty=random.randint(1, 4),
                duration=random.randint(120, 600),
                raw_payload={"seeded": True},
                created_at=datetime.utcnow() - timedelta(days=20 - i),
            ))
        await db.commit()
        print(f"Seeded patient: {patient.email} / password: test1234, id: {patient.id}")

if __name__ == "__main__":
    asyncio.run(seed())