def recommend_difficulty(
    current_difficulty: int,
    accuracy: float,
    mistake_rate: float,
    trend: str,
    total_change_score: float | None = None,
    min_difficulty: int = 1,
    max_difficulty: int = 4
) -> dict:
    """
    Recommend the next difficulty level based on
    recent performance and performance trend.

    The recommendation uses three signals:
    - accuracy
    - mistake rate
    - performance trend

    Difficulty changes by only one level at a time
    to avoid sudden jumps.

    total_change_score is accepted as additional trend
    information but does not directly control the step size.
    """

    # Validate difficulty boundaries

    if min_difficulty > max_difficulty:
        raise ValueError(
            "min_difficulty cannot be greater than max_difficulty"
        )

    if current_difficulty < min_difficulty:
        current_difficulty = min_difficulty

    if current_difficulty > max_difficulty:
        current_difficulty = max_difficulty

    # Calculate performance signals

    performance_signal = 0

    # Accuracy signal
    if accuracy >= 0.85:
        performance_signal += 1
    elif accuracy < 0.50:
        performance_signal -= 1

    # Mistake-rate signal
    if mistake_rate <= 0.15:
        performance_signal += 1
    elif mistake_rate > 0.50:
        performance_signal -= 1

    # Trend signal
    if trend == "improving":
        performance_signal += 1
    elif trend == "declining":
        performance_signal -= 1

    # Decide difficulty action

    if performance_signal >= 2:
        action = "increase"

    elif performance_signal <= -2:
        action = "decrease"

    else:
        action = "maintain"

    # Change difficulty by only one level

    if action == "increase":
        recommended_difficulty = current_difficulty + 1

    elif action == "decrease":
        recommended_difficulty = current_difficulty - 1

    else:
        recommended_difficulty = current_difficulty

    # Respect difficulty boundaries

    recommended_difficulty = max(
        min_difficulty,
        min(max_difficulty, recommended_difficulty)
    )

    # Generate explanation

    if action == "increase":
        reason = "strong overall performance with positive signals"

    elif action == "decrease":
        reason = "weak overall performance with negative signals"

    else:
        reason = "performance is suitable for the current difficulty"

    # Return recommendation

    return {
        "current_difficulty": current_difficulty,
        "recommended_difficulty": recommended_difficulty,
        "action": action,
        "performance_signal": performance_signal,
        "reason": reason
    }
