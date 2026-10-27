import app as m
import pytest

@pytest.fixture
def client(monkeypatch):
    m._hits.clear()
    monkeypatch.setattr(m, "call_gemini", lambda p: {"ideas": ["x"]})
    return m.app.test_client()

GOOD = {"event_type": "wedding", "budget": 5000, "guests": 50}

def test_health(client): assert client.get("/health").json["status"] == "ok"
def test_plan_ok(client): assert client.post("/api/plan", json=GOOD).json["ideas"] == ["x"]
def test_bad_type(client): assert client.post("/api/plan", json={**GOOD, "event_type": "x"}).status_code == 400
def test_bad_budget(client): assert client.post("/api/plan", json={**GOOD, "budget": -1}).status_code == 400
def test_non_json(client): assert client.post("/api/plan", data="hi").status_code == 400
def test_headers(client): assert client.get("/health").headers["X-Frame-Options"] == "DENY"
def test_rate_limit(client):
    codes = [client.post("/api/plan", json=GOOD).status_code for _ in range(12)]
    assert 429 in codes
def test_error_hidden(client, monkeypatch):
    def boom(p): raise RuntimeError("secret")
    monkeypatch.setattr(m, "call_gemini", boom)
    r = client.post("/api/plan", json=GOOD)
    assert r.status_code == 502 and "secret" not in r.text

def test_missing_key_message(client, monkeypatch):
    def boom(p): raise KeyError("GEMINI_API_KEY")
    monkeypatch.setattr(m, "call_gemini", boom)
    assert "not set" in client.post("/api/plan", json=GOOD).json["error"]

def test_busy_message(client, monkeypatch):
    def boom(p): raise RuntimeError("503 UNAVAILABLE")
    monkeypatch.setattr(m, "call_gemini", boom)
    assert "busy" in client.post("/api/plan", json=GOOD).json["error"]
