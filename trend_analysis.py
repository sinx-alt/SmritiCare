import pandas as pd
import numpy as np


REQUIRED_FEATURES = [
    "accuracy",
    "mistake_rate",
    "reaction_time",
    "score"
]

# Metrics where a LOWER value is better — direction gets flipped for these
LOWER_IS_BETTER = {"mistake_rate", "reaction_time"}

# Small constant to avoid divide-by-zero when a baseline has no variance
EPSILON = 1e-6

# Thresholds on the summed normalized change, tuned for interpretability
IMPROVING_THRESHOLD = 0.5
DECLINING_THRESHOLD = -0.5


def analyze_trend(
    feature_records: list[dict],
    patient_id: str,
    game_id: str,
    recent_sessions: int = 3
) -> dict:
    """
    Analyze performance trend for one patient and one game.

    Older sessions establish a baseline (mean + std per metric).
    Recent sessions are compared against that baseline using a
    normalized (z-score-style), magnitude-aware change signal,
    rather than a simple direction vote — so a large swing in one
    metric can outweigh small noise in the others.

    Trend:
        improving
        declining
        stable
        insufficient_data
    """

    if not feature_records:
        return {
            "trend": "insufficient_data",
            "session_count": 0
        }

    df = pd.DataFrame(feature_records)

    # Check identification fields
    for field in ["patientId", "gameId"]:
        if field not in df.columns:
            raise ValueError(f"Missing required field: {field}")

    # Filter to this patient and game
    df = df[
        (df["patientId"] == patient_id) &
        (df["gameId"] == game_id)
    ].copy()

    # Check required performance features exist
    missing_features = [
        feature
        for feature in REQUIRED_FEATURES
        if feature not in df.columns
    ]
    if missing_features:
        raise ValueError(
            f"Missing required feature(s): {', '.join(missing_features)}"
        )

    # Track and remove invalid sessions (consistent with baseline.py)
    invalid_session_count = int(
        df[REQUIRED_FEATURES].isna().any(axis=1).sum()
    )
    df = df.dropna(subset=REQUIRED_FEATURES)

    # Sort chronologically
    if "timestamp" in df.columns:
        df = df.sort_values("timestamp")

    total_sessions = len(df)

    if total_sessions < 2:
        return {
            "trend": "insufficient_data",
            "session_count": total_sessions,
            "invalid_session_count": invalid_session_count
        }

    recent_count = min(recent_sessions, total_sessions - 1)

    baseline_df = df.iloc[:-recent_count].copy()
    recent_df = df.tail(recent_count).copy()

    baseline_mean = {
        feature: baseline_df[feature].mean()
        for feature in REQUIRED_FEATURES
    }
    baseline_std = {
        feature: baseline_df[feature].std()
        for feature in REQUIRED_FEATURES
    }
    recent_mean = {
        feature: recent_df[feature].mean()
        for feature in REQUIRED_FEATURES
    }

    # --- Magnitude-aware change signal ---
    # For each metric: how many baseline-std-deviations did the recent
    # mean move, in the "good" direction? Summed across metrics, this
    # lets one large genuine swing outweigh several tiny fluctuations,
    # which a plain +1/-1 vote could not do.
    per_metric_change = {}
    total_change_score = 0.0

    for feature in REQUIRED_FEATURES:
        std = baseline_std[feature]
        std = std if pd.notna(std) and std > EPSILON else EPSILON

        raw_change = recent_mean[feature] - baseline_mean[feature]

        # Flip sign so "positive" always means "improvement"
        if feature in LOWER_IS_BETTER:
            raw_change = -raw_change

        normalized_change = raw_change / std
        per_metric_change[feature] = float(normalized_change)
        total_change_score += normalized_change

    if total_change_score >= IMPROVING_THRESHOLD:
        trend = "improving"
    elif total_change_score <= DECLINING_THRESHOLD:
        trend = "declining"
    else:
        trend = "stable"

    # Consistency of recent sessions (std of a single-row window is NaN —
    # cast happens after, so downstream code gets None instead of NaN)
    consistency_raw = {
        f"{feature}_std": recent_df[feature].std()
        for feature in REQUIRED_FEATURES
    }
    consistency = {
        key: (float(value) if pd.notna(value) else None)
        for key, value in consistency_raw.items()
    }

    return {
        "trend": trend,
        "total_change_score": round(float(total_change_score), 3),
        "per_metric_change": {
            k: round(v, 3) for k, v in per_metric_change.items()
        },
        "session_count": total_sessions,
        "invalid_session_count": invalid_session_count,
        "baseline_session_count": len(baseline_df),
        "recent_session_count": len(recent_df),
        "baseline_performance": {
            k: float(v) for k, v in baseline_mean.items()
        },
        "recent_performance": {
            k: float(v) for k, v in recent_mean.items()
        },
        "consistency": consistency
    }
