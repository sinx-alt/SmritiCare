# Games available in SmritiCare
VALID_GAMES = {
    "memory_match",
    "pattern_recall",
    "number_sequence",
    "adaptive_chess",
    "prakriti_spotter",
    "object_association",
    "ner_memory_quiz",
}

# Deterministic order used for tie-breaking.
# This prevents input order from affecting the recommendation.
GAME_PRIORITY = {
    game_id: index
    for index, game_id in enumerate(sorted(VALID_GAMES))
}

# A game needs at least this many sessions before its
# performance score is considered fully reliable.
MIN_CONFIDENT_SESSIONS = 5

# Neutral weakness used for games with little or no data.
NEUTRAL_WEAKNESS = 0.5


def calculate_game_performance(
    accuracy: float,
    mistake_rate: float
) -> float:
    """
    Calculate recent performance for one game.

    Accuracy has a higher weight because mistake_rate
    can overlap with accuracy.

    Higher score = better performance.
    """

    error_performance = 1 - mistake_rate

    performance_score = (
        0.80 * accuracy
        + 0.20 * error_performance
    )

    return float(performance_score)


def calculate_priority_score(
    performance_score: float,
    trend: str,
    total_change_score: float = 0.0,
    session_count: int = 0
) -> float:
    """
    Calculate how strongly a game should be recommended.

    Higher priority = stronger reason to recommend the game.

    Priority is influenced by:
    - performance weakness
    - performance trend
    - trend magnitude
    - confidence based on session count
    """

    # Lower performance means higher weakness.
    raw_weakness = 1 - performance_score

    # Confidence increases as more sessions become available.
    # 0 sessions = 0 confidence
    # 5+ sessions = full confidence
    confidence = min(
        session_count / MIN_CONFIDENT_SESSIONS,
        1.0
    )

    # Pull low-confidence results toward a neutral value.
    # This prevents one unusual session from dominating.
    weakness_score = (
        confidence * raw_weakness
        + (1 - confidence) * NEUTRAL_WEAKNESS
    )

    # Basic trend adjustment.
    if trend == "declining":
        trend_adjustment = 0.15

    elif trend == "improving":
        trend_adjustment = -0.10

    else:
        trend_adjustment = 0.0

    # Consider the magnitude of the trend.
    trend_strength = min(
        abs(float(total_change_score)) / 3.0,
        1.0
    )

    if trend == "declining":
        magnitude_adjustment = 0.10 * trend_strength

    elif trend == "improving":
        magnitude_adjustment = -0.05 * trend_strength

    else:
        magnitude_adjustment = 0.0

    priority_score = (
        weakness_score
        + trend_adjustment
        + magnitude_adjustment
    )

    return float(priority_score)


def recommend_next_game(
    game_performances: list[dict],
    current_game_id: str | None = None
) -> dict:
    """
    Recommend the next game based on performance across
    all available SmritiCare games.
    """

    # Validate main input

    if not isinstance(game_performances, list):
        raise ValueError(
            "game_performances must be a list"
        )

    # Validate optional current game.
    if current_game_id is not None:
        if current_game_id not in VALID_GAMES:
            raise ValueError(
                f"Unknown current_game_id: {current_game_id}"
            )

    played_by_id = {}

    # Validate and store supplied game records

    for game in game_performances:

        if not isinstance(game, dict):
            raise ValueError(
                "Each game performance must be a dictionary"
            )

        required_fields = [
            "gameId",
            "accuracy",
            "mistake_rate"
        ]

        for field in required_fields:
            if field not in game:
                raise ValueError(
                    f"Missing required field: {field}"
                )

        game_id = game["gameId"]

        # Validate game ID.
        if game_id not in VALID_GAMES:
            raise ValueError(
                f"Unknown gameId: {game_id}"
            )

        # Reject duplicate game records.
        # One aggregated record is expected per game.
        if game_id in played_by_id:
            raise ValueError(
                f"Duplicate gameId: {game_id}. "
                "Only one performance record is allowed per game."
            )

        # Validate performance values

        try:
            accuracy = float(game["accuracy"])
            mistake_rate = float(game["mistake_rate"])
        except (TypeError, ValueError):
            raise ValueError(
                f"accuracy and mistake_rate must be numeric "
                f"for {game_id}"
            )

        if not 0 <= accuracy <= 1:
            raise ValueError(
                f"accuracy must be between 0 and 1 "
                f"for {game_id}"
            )

        if not 0 <= mistake_rate <= 1:
            raise ValueError(
                f"mistake_rate must be between 0 and 1 "
                f"for {game_id}"
            )

        # Validate session count

        session_count = game.get(
            "session_count",
            0
        )

        if (
            not isinstance(session_count, int)
            or isinstance(session_count, bool)
            or session_count < 0
        ):
            raise ValueError(
                f"session_count must be a "
                f"non-negative integer for {game_id}"
            )

        # Store validated record.
        played_by_id[game_id] = {
            **game,
            "accuracy": accuracy,
            "mistake_rate": mistake_rate,
            "session_count": session_count
        }

    # Process ALL seven games

    processed_games = []

    for game_id in sorted(VALID_GAMES):

        game = played_by_id.get(game_id)

        # Game has never been played

        if game is None:

            processed_games.append({
                "gameId": game_id,
                "performance_score": None,
                "trend": None,
                "priority_score": NEUTRAL_WEAKNESS,
                "session_count": 0
            })

            continue

        # Game has been played

        accuracy = game["accuracy"]
        mistake_rate = game["mistake_rate"]
        session_count = game["session_count"]

        performance_score = calculate_game_performance(
            accuracy,
            mistake_rate
        )

        trend = game.get(
            "trend",
            "stable"
        )

        total_change_score = game.get(
            "total_change_score",
            0.0
        )

        try:
            total_change_score = float(
                total_change_score
            )
        except (TypeError, ValueError):
            raise ValueError(
                f"total_change_score must be numeric "
                f"for {game_id}"
            )

        priority_score = calculate_priority_score(
            performance_score=performance_score,
            trend=trend,
            total_change_score=total_change_score,
            session_count=session_count
        )

        processed_games.append({
            "gameId": game_id,
            "performance_score": performance_score,
            "trend": trend,
            "priority_score": priority_score,
            "session_count": session_count
        })

    # Avoid immediately repeating current game

    candidates = [
        game
        for game in processed_games
        if game["gameId"] != current_game_id
    ]

    # If there is no alternative, allow the current game.
    if not candidates:
        candidates = processed_games

    # Select highest-priority game

    # Tie-breaking:
    #
    # 1. Higher priority score
    # 2. Fewer sessions
    # 3. Alphabetically earlier game ID
    #
    # Negative values are used because max() is being used.

    recommended_game = max(
        candidates,
        key=lambda game: (
            game["priority_score"],
            -game["session_count"],
            -GAME_PRIORITY[game["gameId"]]
        )
    )

    # Generate explanation

    if recommended_game["session_count"] == 0:

        reason = (
            "recommended because this game "
            "has not been played yet"
        )

    elif recommended_game["trend"] == "declining":

        reason = (
            "recommended because recent performance "
            "is weak or declining"
        )

    elif recommended_game["trend"] == "stable":

        reason = (
            "recommended because it currently "
            "has lower performance"
        )

    else:

        reason = (
            "recommended based on recent performance "
            "and personalization history"
        )

    # Return machine-readable result

    return {
        "nextGame": recommended_game["gameId"],

        "performance_score": (
            round(
                recommended_game["performance_score"],
                3
            )
            if recommended_game["performance_score"] is not None
            else None
        ),

        "trend": recommended_game["trend"],

        "priority_score": round(
            recommended_game["priority_score"],
            3
        ),

        "session_count": recommended_game["session_count"],

        "reason": reason
    }
