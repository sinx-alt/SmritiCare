import json

from schemas import GameResult
from personalization_engine import build_personalization


# ---------------------------------------------------------
# LOAD MOCK DATA
# ---------------------------------------------------------

with open(
    "mock_game_results.json",
    "r",
    encoding="utf-8"
) as file:
    mock_data = json.load(file)

scenarios = mock_data["scenarios"]


VALID_GAMES = {
    "memory_match",
    "pattern_recall",
    "number_sequence",
    "adaptive_chess",
    "prakriti_spotter",
    "object_association",
    "ner_memory_quiz"
}


EXPECTED_TRENDS = {
    "improving_patient": "improving",
    "declining_patient": "declining",
    "stable_patient": "stable",
    "insufficient_history_patient": "insufficient_data",
    "unplayed_games_patient": "insufficient_data"
}


# ---------------------------------------------------------
# RUN ALL SCENARIOS
# ---------------------------------------------------------

for scenario_name, scenario in scenarios.items():

    print("\n")
    print("=" * 70)
    print(f"SCENARIO: {scenario_name}")
    print("=" * 70)

    patient_id = scenario["patient_id"]
    current_game_id = scenario["current_game_id"]
    recent_sessions = scenario["recent_sessions"]
    raw_results = scenario["game_results"]

    # -----------------------------------------------------
    # CONVERT JSON TO GameResult OBJECTS
    # -----------------------------------------------------

    game_results = [
        GameResult(**data)
        for data in raw_results
    ]

    print(f"\nPatient ID: {patient_id}")
    print(f"Current Game: {current_game_id}")
    print(f"Recent Sessions Used: {recent_sessions}")
    print(f"Total Mock Sessions: {len(game_results)}")

    # -----------------------------------------------------
    # RUN PERSONALIZATION ENGINE
    # -----------------------------------------------------

    result = build_personalization(
        game_results=game_results,
        patient_id=patient_id,
        current_game_id=current_game_id,
        recent_sessions=recent_sessions
    )

    # -----------------------------------------------------
    # CURRENT PERFORMANCE
    # -----------------------------------------------------

    print("\n--- CURRENT PERFORMANCE ---")

    print(
        f"Accuracy: "
        f"{result['currentPerformance']['accuracy']}"
    )

    print(
        f"Mistake Rate: "
        f"{result['currentPerformance']['mistake_rate']}"
    )

    print(
        f"Difficulty: "
        f"{result['currentPerformance']['difficulty']}"
    )

    print(
        f"Duration: "
        f"{result['currentPerformance']['duration']} minutes"
    )

    # -----------------------------------------------------
    # BASELINE
    # -----------------------------------------------------

    print("\n--- BASELINE ---")

    print(
        f"Accuracy: "
        f"{result['baseline']['accuracy']}"
    )

    print(
        f"Mistake Rate: "
        f"{result['baseline']['mistake_rate']}"
    )

    print(
        f"Reaction Time: "
        f"{result['baseline']['reaction_time']}"
    )

    print(
        f"Score: "
        f"{result['baseline']['score']}"
    )

    print(
        f"Sessions Used: "
        f"{result['baseline']['session_count']}"
    )

    # -----------------------------------------------------
    # TREND
    # -----------------------------------------------------

    print("\n--- PERFORMANCE TREND ---")

    print(
        f"Status: "
        f"{result['trend']['status']}"
    )

    print(
        f"Change Score: "
        f"{result['trend']['total_change_score']}"
    )

    print(
        f"Baseline Sessions: "
        f"{result['trend']['baseline_session_count']}"
    )

    print(
        f"Recent Sessions: "
        f"{result['trend']['recent_session_count']}"
    )

    # -----------------------------------------------------
    # DIFFICULTY
    # -----------------------------------------------------

    difficulty = (
        result["recommendations"]["difficulty"]
    )

    print("\n--- DIFFICULTY RECOMMENDATION ---")

    print(
        f"Current: "
        f"{difficulty['current']}"
    )

    print(
        f"Recommended: "
        f"{difficulty['recommended']}"
    )

    print(
        f"Action: "
        f"{difficulty['action']}"
    )

    print(
        f"Reason: "
        f"{difficulty['reason']}"
    )

    # -----------------------------------------------------
    # NEXT GAME
    # -----------------------------------------------------

    next_game = (
        result["recommendations"]["nextGame"]
    )

    print("\n--- NEXT GAME RECOMMENDATION ---")

    print(
        f"Recommended Game: "
        f"{next_game['gameId']}"
    )

    print(
        f"Priority Score: "
        f"{next_game['priorityScore']}"
    )

    print(
        f"Trend: "
        f"{next_game['trend']}"
    )

    print(
        f"Reason: "
        f"{next_game['reason']}"
    )

    # -----------------------------------------------------
    # SESSION DURATION
    # -----------------------------------------------------

    duration = (
        result["recommendations"]["sessionDuration"]
    )

    print("\n--- SESSION DURATION RECOMMENDATION ---")

    print(
        f"Current: "
        f"{duration['current']} minutes"
    )

    print(
        f"Recommended: "
        f"{duration['recommended']} minutes"
    )

    print(
        f"Action: "
        f"{duration['action']}"
    )

    print(
        f"Reason: "
        f"{duration['reason']}"
    )

    # =====================================================
    # ASSERTIONS
    # =====================================================

    # -----------------------------------------------------
    # BASIC OUTPUT STRUCTURE
    # -----------------------------------------------------

    assert result["patientId"] == patient_id
    assert result["currentGame"] == current_game_id

    assert "currentPerformance" in result
    assert "baseline" in result
    assert "trend" in result
    assert "recommendations" in result

    assert "difficulty" in result["recommendations"]
    assert "nextGame" in result["recommendations"]
    assert "sessionDuration" in result["recommendations"]

    # -----------------------------------------------------
    # TREND VALIDATION
    # -----------------------------------------------------

    expected_trend = EXPECTED_TRENDS[
        scenario_name
    ]

    actual_trend = result["trend"]["status"]

    assert actual_trend == expected_trend, (
        f"Expected trend '{expected_trend}' "
        f"but got '{actual_trend}'"
    )

    # -----------------------------------------------------
    # CHANGE SCORE VALIDATION
    # -----------------------------------------------------

    if actual_trend == "insufficient_data":

        assert (
            result["trend"]["baseline_session_count"]
            == 0
        )

        assert (
            result["trend"]["recent_session_count"]
            == 0
        )

    else:

        assert (
            result["trend"]["baseline_session_count"]
            >= 1
        )

        assert (
            result["trend"]["recent_session_count"]
            >= 1
        )

    # -----------------------------------------------------
    # DIFFICULTY VALIDATION
    # -----------------------------------------------------

    recommended_difficulty = (
        result["recommendations"]
        ["difficulty"]
        ["recommended"]
    )

    assert 1 <= recommended_difficulty <= 4

    # Insufficient history should not increase difficulty.
    if actual_trend == "insufficient_data":

        assert (
            result["recommendations"]
            ["difficulty"]
            ["action"]
            != "increase"
        )

    # -----------------------------------------------------
    # SESSION DURATION VALIDATION
    # -----------------------------------------------------

    recommended_duration = (
        result["recommendations"]
        ["sessionDuration"]
        ["recommended"]
    )

    assert 5 <= recommended_duration <= 12

    # Insufficient history should not increase duration.
    if actual_trend == "insufficient_data":

        assert (
            result["recommendations"]
            ["sessionDuration"]
            ["action"]
            != "increase"
        )

    # -----------------------------------------------------
    # NEXT GAME VALIDATION
    # -----------------------------------------------------

    recommended_game = (
        result["recommendations"]
        ["nextGame"]
        ["gameId"]
    )

    assert recommended_game in VALID_GAMES

    # If there are multiple possible games,
    # the next game should not be the current game.
    assert recommended_game != current_game_id

    # -----------------------------------------------------
    # SCENARIO PASSED
    # -----------------------------------------------------

    print("\n✓ SCENARIO PASSED")


# ---------------------------------------------------------
# FINAL RESULT
# ---------------------------------------------------------

print("\n")
print("=" * 70)
print("ALL MOCK PERSONALIZATION SCENARIOS PASSED!")
print("=" * 70)
