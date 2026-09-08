import pandas as pd


REQUIRED_FEATURES = [
    "accuracy",
    "mistake_rate",
    "reaction_time",
    "score"
]


def calculate_baseline(
    feature_records: list[dict],
    patient_id: str,
    game_id: str
) -> dict:
    """
    Calculate baseline performance for one patient and one game.

    Invalid sessions with missing required feature values
    are excluded instead of stopping the entire calculation.
    """

    # No data provided
    if not feature_records:
        return {
            "accuracy": None,
            "mistake_rate": None,
            "reaction_time": None,
            "score": None,
            "session_count": 0,
            "invalid_session_count": 0
        }

    # Convert feature records into a Pandas DataFrame
    df = pd.DataFrame(feature_records)

    # Check that identification fields exist
    required_ids = ["patientId", "gameId"]

    for field in required_ids:
        if field not in df.columns:
            raise ValueError(f"Missing required field: {field}")

    # Select only the requested patient and game
    filtered_df = df[
        (df["patientId"] == patient_id) &
        (df["gameId"] == game_id)
    ].copy()

    # No sessions found for this patient and game
    if filtered_df.empty:
        return {
            "accuracy": None,
            "mistake_rate": None,
            "reaction_time": None,
            "score": None,
            "session_count": 0,
            "invalid_session_count": 0
        }

    # Check that required performance features exist
    missing_features = [
        feature
        for feature in REQUIRED_FEATURES
        if feature not in filtered_df.columns
    ]

    if missing_features:
        raise ValueError(
            f"Missing required feature(s): {', '.join(missing_features)}"
        )

    # Count sessions containing missing feature values
    invalid_session_count = (
        filtered_df[REQUIRED_FEATURES]
        .isna()
        .any(axis=1)
        .sum()
    )

    # Remove invalid sessions
    filtered_df = filtered_df.dropna(
        subset=REQUIRED_FEATURES
    )

    # If all matching sessions were invalid
    if filtered_df.empty:
        return {
            "accuracy": None,
            "mistake_rate": None,
            "reaction_time": None,
            "score": None,
            "session_count": 0,
            "invalid_session_count": int(invalid_session_count)
        }

    # Calculate baseline from valid sessions
    baseline = {
        "accuracy": float(filtered_df["accuracy"].mean()),
        "mistake_rate": float(filtered_df["mistake_rate"].mean()),
        "reaction_time": float(filtered_df["reaction_time"].mean()),
        "score": float(filtered_df["score"].mean()),
        "session_count": len(filtered_df),
        "invalid_session_count": int(invalid_session_count)
    }

    return baseline
