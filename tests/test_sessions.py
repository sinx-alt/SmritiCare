def test_session_requires_auth(client):
    resp = client.post("/sessions", json={
        "gameId": "memory_match", "score": 80, "accuracy": 0.8,
        "difficulty": 2, "duration": 300
    })
    assert resp.status_code == 401