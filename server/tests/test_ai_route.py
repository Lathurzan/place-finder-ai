"""
tests/test_ai_route.py
Unit tests for api/routes/ai.py
All Gemini service calls are mocked.
Run:  pytest tests/test_ai_route.py -v
"""
import pytest
import sys
import types

# Stub models.user before importing anything that pulls in DB models
if "models.user" not in sys.modules:
    mod_user = types.ModuleType("models.user")
    class _User:
        pass
    mod_user.User = _User
    sys.modules["models.user"] = mod_user

from unittest.mock import patch
from fastapi.testclient import TestClient
from fastapi import FastAPI
from api.routes.ai import router

app = FastAPI()
app.include_router(router, prefix="/ai")
client = TestClient(app)


SUCCESS_CHAT = {"success": True, "reply": "Paris is lovely.", "tokens": {}}
SUCCESS_IMAGE = {"success": True, "analysis": "Eiffel Tower.", "tokens": {}}
SUCCESS_ITINERARY = {"success": True, "itinerary": {"days": []}, "tokens": {}}
SUCCESS_RECOMMEND = {"success": True, "places": [], "tokens": {}}
FAIL_RESULT = {"success": False, "error": "quota exceeded"}


class TestHealthEndpoint:
    def test_returns_ok(self):
        resp = client.get("/ai/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"


class TestGenerateEndpoint:
    def test_valid_prompt_returns_200(self):
        with patch("api.routes.ai.chat_with_gemini", return_value=SUCCESS_CHAT):
            resp = client.post("/ai/generate", json={"prompt": "Tell me about Paris"})
        assert resp.status_code == 200

    def test_message_field_also_accepted(self):
        with patch("api.routes.ai.chat_with_gemini", return_value=SUCCESS_CHAT):
            resp = client.post("/ai/generate", json={"message": "Tell me about Paris"})
        assert resp.status_code == 200

    def test_empty_body_returns_422_or_400(self):
        resp = client.post("/ai/generate", json={})
        assert resp.status_code in (400, 422)

    def test_gemini_failure_returns_502(self):
        with patch("api.routes.ai.chat_with_gemini", return_value=FAIL_RESULT):
            resp = client.post("/ai/generate", json={"prompt": "hello"})
        assert resp.status_code == 502


class TestChatEndpoint:
    def test_valid_message_returns_200(self):
        with patch("api.routes.ai.chat_with_gemini", return_value=SUCCESS_CHAT):
            resp = client.post("/ai/chat", json={"message": "What about Rome?"})
        assert resp.status_code == 200

    def test_with_history(self):
        history = [{"role": "user", "parts": ["Tell me about Paris"]},
                   {"role": "model", "parts": ["Paris is in France."]}]
        with patch("api.routes.ai.chat_with_gemini", return_value=SUCCESS_CHAT):
            resp = client.post("/ai/chat", json={"message": "And Rome?", "history": history})
        assert resp.status_code == 200

    def test_missing_message_returns_422(self):
        resp = client.post("/ai/chat", json={})
        assert resp.status_code == 422


class TestAnalyzeImageEndpoint:
    def test_valid_image_data_returns_200(self):
        import base64
        fake_b64 = base64.b64encode(b"fakeimagedata").decode()
        with patch("api.routes.ai.analyze_image", return_value=SUCCESS_IMAGE):
            resp = client.post("/ai/analyze-image", json={"image_data": fake_b64})
        assert resp.status_code == 200

    def test_gemini_failure_returns_502(self):
        import base64
        fake_b64 = base64.b64encode(b"fakeimagedata").decode()
        with patch("api.routes.ai.analyze_image", return_value=FAIL_RESULT):
            resp = client.post("/ai/analyze-image", json={"image_data": fake_b64})
        assert resp.status_code == 502

    def test_missing_image_data_returns_422(self):
        resp = client.post("/ai/analyze-image", json={})
        assert resp.status_code == 422


class TestItineraryEndpoint:
    def test_valid_request_returns_200(self):
        with patch("api.routes.ai.generate_itinerary", return_value=SUCCESS_ITINERARY):
            resp = client.post("/ai/itinerary", json={"destination": "Tokyo", "num_days": 3})
        assert resp.status_code == 200

    def test_missing_destination_returns_422(self):
        resp = client.post("/ai/itinerary", json={"num_days": 3})
        assert resp.status_code == 422

    def test_gemini_failure_returns_502(self):
        with patch("api.routes.ai.generate_itinerary", return_value=FAIL_RESULT):
            resp = client.post("/ai/itinerary", json={"destination": "Tokyo", "num_days": 1})
        assert resp.status_code == 502


class TestRecommendEndpoint:
    def test_valid_request_returns_200(self):
        with patch("api.routes.ai.recommend_places", return_value=SUCCESS_RECOMMEND):
            resp = client.post("/ai/recommend", json={"location": "Glasgow"})
        assert resp.status_code == 200

    def test_alias_recommend_places_works(self):
        with patch("api.routes.ai.recommend_places", return_value=SUCCESS_RECOMMEND):
            resp = client.post("/ai/recommend-places", json={"location": "Glasgow"})
        assert resp.status_code == 200

    def test_missing_location_returns_422(self):
        resp = client.post("/ai/recommend", json={})
        assert resp.status_code == 422

    def test_gemini_failure_returns_502(self):
        with patch("api.routes.ai.recommend_places", return_value=FAIL_RESULT):
            resp = client.post("/ai/recommend", json={"location": "Glasgow"})
        assert resp.status_code == 502
