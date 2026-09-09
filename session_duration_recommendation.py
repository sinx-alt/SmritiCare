import math


MIN_DURATION = 5
MAX_DURATION = 12
DEFAULT_DURATION = 8

STEP = 2

# Fraction of active signals that must agree
# before an increase/decrease is triggered.
MAJORITY_FRACTION = 0.66


def recommend_session_duration(
    current_duration: int = DEFAULT_DURATION,
    accuracy: float = 0.0,
    mistake_rate: float = 0.0,
    trend: str = "stable",
    consistency_score: float | None = None
) -> dict:
    """
    Recommend the next session duration based on
    recent performance and performance trend.

    Duration is kept within a fixed MVP range and
    changes gradually to avoid sudden jumps.

    Active signals:
    - accuracy
    - mistake rate
    - trend
    - consistency (optional)

    A majority of active signals must agree before
    the duration is increased or decreased.

    When trend is "insufficient_data", increasing the
    session duration is blocked until enough history
    is available.
    """

    # Validate inputs

    if (
        not isinstance(current_duration, int)
        or isinstance(current_duration, bool)
    ):
        raise ValueError(
            "current_duration must be an integer"
        )

    if not 0 <= accuracy <= 1:
        raise ValueError(
            "accuracy must be between 0 and 1"
        )

    if not 0 <= mistake_rate <= 1:
        raise ValueError(
            "mistake_rate must be between 0 and 1"
        )

    valid_trends = {
        "improving",
        "declining",
        "stable",
        "insufficient_data"
    }

    if trend not in valid_trends:
        raise ValueError(
            f"Invalid trend: {trend}"
        )

    if consistency_score is not None:

        if not 0 <= consistency_score <= 1:
            raise ValueError(
                "consistency_score must be between 0 and 1"
            )

    # Keep current duration within allowed range

    current_duration = max(
        MIN_DURATION,
        min(MAX_DURATION, current_duration)
    )

    # Calculate performance signals

    performance_signal = 0
    signal_count = 0

    # Accuracy signal
    if accuracy >= 0.85:
        performance_signal += 1

    elif accuracy < 0.50:
        performance_signal -= 1

    signal_count += 1

    # Mistake-rate signal
    if mistake_rate <= 0.15:
        performance_signal += 1

    elif mistake_rate > 0.50:
        performance_signal -= 1

    signal_count += 1

    # Trend signal
    if trend == "improving":
        performance_signal += 1

    elif trend == "declining":
        performance_signal -= 1

    signal_count += 1

    # Optional consistency signal
    if consistency_score is not None:

        if consistency_score >= 0.75:
            performance_signal += 1

        elif consistency_score < 0.40:
            performance_signal -= 1

        signal_count += 1

    # Decide duration action

    required = math.ceil(
        signal_count * MAJORITY_FRACTION
    )

    if performance_signal >= required:
        action = "increase"

    elif performance_signal <= -required:
        action = "decrease"

    else:
        action = "maintain"

    # Without enough history, do not increase duration.
    if (
        trend == "insufficient_data"
        and action == "increase"
    ):
        action = "maintain"

    # Calculate recommended duration

    if action == "increase":

        recommended_duration = (
            current_duration + STEP
        )

    elif action == "decrease":

        recommended_duration = (
            current_duration - STEP
        )

    else:

        recommended_duration = current_duration

    # Keep duration within allowed limits.
    recommended_duration = max(
        MIN_DURATION,
        min(MAX_DURATION, recommended_duration)
    )

    # Generate explanation

    if action == "increase":

        reason = (
            "strong performance suggests the user "
            "can handle a slightly longer session"
        )

    elif action == "decrease":

        reason = (
            "weak performance suggests a shorter "
            "session may be more suitable"
        )

    elif trend == "insufficient_data":

        reason = (
            "not enough trend history yet to safely "
            "increase session duration"
        )

    else:

        reason = (
            "performance is suitable for the "
            "current session duration"
        )

    # Return machine-readable result

    return {
        "current_duration": current_duration,
        "recommended_duration": recommended_duration,
        "duration_unit": "minutes",
        "action": action,
        "performance_signal": performance_signal,
        "signal_count": signal_count,
        "reason": reason
    }
