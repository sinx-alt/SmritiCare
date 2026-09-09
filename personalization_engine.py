from schemas import GameResult

from feature_extractor import extract_features
from baseline import calculate_baseline
from trend_analysis import analyze_trend

from difficulty_recommendation import (
    recommend_difficulty
)

from next_game_recommendation import (
    recommend_next_game
)

from session_duration_recommendation import (
    recommend_session_duration
)


def build_personalization(
    game_results: list[GameResult],
    patient_id: str,
    current_game_id: str,
    recent_sessions: int = 3
) -> dict:
    """
    Build the complete SmritiCare personalization recommendation.

    Pipeline:

        GameResult
            ↓
        Feature Extraction
            ↓
        Baseline + Trend Analysis
            ↓
        Difficulty Recommendation
            ↓
        Next Game Recommendation
            ↓
        Session Duration Recommendation
            ↓
        Final Recommendation

    The engine is patient-specific and uses historical
    game results to personalize the next session.
    """

    # Validate input

    if not isinstance(game_results, list):
        raise ValueError(
            "game_results must be a list"
        )

    if not game_results:
        raise ValueError(
            "At least one game result is required"
        )

    if not isinstance(patient_id, str) or not patient_id:
        raise ValueError(
            "patient_id must be a non-empty string"
        )

    if not isinstance(current_game_id, str) or not current_game_id:
        raise ValueError(
            "current_game_id must be a non-empty string"
        )

    if (
        not isinstance(recent_sessions, int)
        or isinstance(recent_sessions, bool)
        or recent_sessions < 1
    ):
        raise ValueError(
            "recent_sessions must be a positive integer"
        )

    # Convert GameResults into feature records

    feature_records = []

    for game_result in game_results:

        # Accept either a GameResult object or a dictionary.
        if isinstance(game_result, GameResult):

            validated_result = game_result

        elif isinstance(game_result, dict):

            validated_result = GameResult(
                **game_result
            )

        else:

            raise ValueError(
                "Each game result must be a GameResult "
                "or a dictionary"
            )

        # Only use data belonging to this patient.
        if validated_result.patientId != patient_id:
            continue

        features = extract_features(
            validated_result
        )

        feature_records.append(features)

    if not feature_records:
        raise ValueError(
            "No game results found for the specified patient"
        )

    # Find the current game's latest session

    current_game_records = [
        record
        for record in feature_records
        if record["gameId"] == current_game_id
    ]

    if not current_game_records:
        raise ValueError(
            f"No game results found for current game: "
            f"{current_game_id}"
        )

    # Sort sessions chronologically.
    current_game_records.sort(
        key=lambda record: record["timestamp"]
    )

    # Latest session represents current performance.
    latest_record = current_game_records[-1]

    current_accuracy = float(
        latest_record["accuracy"]
    )

    current_mistake_rate = float(
        latest_record["mistake_rate"]
    )

    current_difficulty = int(
        latest_record["difficulty"]
    )

    current_duration = int(
        latest_record["duration"]
    )

    # Calculate baseline for current game

    current_baseline = calculate_baseline(
        feature_records=feature_records,
        patient_id=patient_id,
        game_id=current_game_id
    )

    # Analyze trend for current game

    current_trend = analyze_trend(
        feature_records=feature_records,
        patient_id=patient_id,
        game_id=current_game_id,
        recent_sessions=recent_sessions
    )

    trend = current_trend["trend"]

    total_change_score = current_trend.get(
        "total_change_score",
        0.0
    )

    # Difficulty recommendation

    difficulty_result = recommend_difficulty(
        current_difficulty=current_difficulty,
        accuracy=current_accuracy,
        mistake_rate=current_mistake_rate,
        trend=trend,
        total_change_score=total_change_score
    )

    # Build performance summary for every game

    game_ids = sorted({
        record["gameId"]
        for record in feature_records
    })

    game_performances = []

    for game_id in game_ids:

        # Analyze trend for this game.
        game_trend = analyze_trend(
            feature_records=feature_records,
            patient_id=patient_id,
            game_id=game_id,
            recent_sessions=recent_sessions
        )

        # Use recent performance when enough history exists.
        if (
            game_trend["trend"] != "insufficient_data"
            and "recent_performance" in game_trend
        ):

            accuracy = float(
                game_trend["recent_performance"]["accuracy"]
            )

            mistake_rate = float(
                game_trend["recent_performance"]["mistake_rate"]
            )

            # Match session count to the recent data
            # used to calculate the performance.
            session_count = game_trend.get(
                "recent_session_count",
                0
            )

        else:

            # Fall back to baseline when there is not
            # enough history for trend analysis.
            game_baseline = calculate_baseline(
                feature_records=feature_records,
                patient_id=patient_id,
                game_id=game_id
            )

            accuracy = game_baseline["accuracy"]
            mistake_rate = game_baseline["mistake_rate"]

            # No usable performance data.
            if (
                accuracy is None
                or mistake_rate is None
            ):
                continue

            session_count = game_baseline.get(
                "session_count",
                0
            )

        game_performances.append({
            "gameId": game_id,
            "accuracy": accuracy,
            "mistake_rate": mistake_rate,
            "trend": game_trend["trend"],
            "total_change_score": game_trend.get(
                "total_change_score",
                0.0
            ),
            "session_count": session_count
        })

    # Next-game recommendation

    next_game_result = recommend_next_game(
        game_performances=game_performances,
        current_game_id=current_game_id
    )

    # Session-duration recommendation

    # Consistency score is intentionally not passed here.
    #
    # trend_analysis.py currently returns several standard
    # deviation values, while session_duration_recommendation.py
    # expects one normalized 0-1 consistency score.
    #
    # Until a defined conversion formula is established,
    # the duration engine uses:
    # accuracy + mistake_rate + trend.

    duration_result = recommend_session_duration(
        current_duration=current_duration,
        accuracy=current_accuracy,
        mistake_rate=current_mistake_rate,
        trend=trend
    )

    # Build final machine-readable response

    return {
        "patientId": patient_id,

        "currentGame": current_game_id,

        "currentPerformance": {
            "accuracy": current_accuracy,
            "mistake_rate": current_mistake_rate,
            "difficulty": current_difficulty,
            "duration": current_duration
        },

        "baseline": {
            "accuracy": current_baseline["accuracy"],
            "mistake_rate": current_baseline["mistake_rate"],
            "reaction_time": current_baseline["reaction_time"],
            "score": current_baseline["score"],
            "session_count": current_baseline["session_count"]
        },

        "trend": {
            "status": trend,
            "total_change_score": current_trend.get(
                "total_change_score",
                0.0
            ),
            "baseline_session_count": current_trend.get(
                "baseline_session_count",
                0
            ),
            "recent_session_count": current_trend.get(
                "recent_session_count",
                0
            )
        },

        "recommendations": {

            "difficulty": {
                "current": difficulty_result[
                    "current_difficulty"
                ],
                "recommended": difficulty_result[
                    "recommended_difficulty"
                ],
                "action": difficulty_result[
                    "action"
                ],
                "reason": difficulty_result[
                    "reason"
                ]
            },

            "nextGame": {
                "gameId": next_game_result[
                    "nextGame"
                ],
                "priorityScore": next_game_result[
                    "priority_score"
                ],
                "trend": next_game_result[
                    "trend"
                ],
                "reason": next_game_result[
                    "reason"
                ]
            },

            "sessionDuration": {
                "current": duration_result[
                    "current_duration"
                ],
                "recommended": duration_result[
                    "recommended_duration"
                ],
                "unit": duration_result[
                    "duration_unit"
                ],
                "action": duration_result[
                    "action"
                ],
                "reason": duration_result[
                    "reason"
                ]
            }
        }
    }
