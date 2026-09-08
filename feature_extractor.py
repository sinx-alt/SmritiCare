from schemas import GameResult


def extract_features(game_result: GameResult) -> dict:
    """
    Extract personalization features from a validated GameResult.
    """

    # Calculate mistake rate safely
    if game_result.attempts > 0:
        mistake_rate = game_result.mistakes / game_result.attempts
    else:
        mistake_rate = 0.0

    features = {
        # Traceability / metadata
        "patientId": game_result.patientId,
        "gameId": game_result.gameId,
        "sessionId": game_result.sessionId,
        "timestamp": game_result.timestamp,

        # Personalization features
        "accuracy": game_result.accuracy,
        "mistake_rate": mistake_rate,
        "reaction_time": game_result.reactionTime,
        "score": game_result.score,
        "difficulty": game_result.difficulty,
        "duration": game_result.duration,
    }

    return features
