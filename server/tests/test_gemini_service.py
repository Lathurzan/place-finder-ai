"""
tests/test_gemini_service.py
Unit tests for services/gemini_service.py
All Gemini SDK calls are mocked — no real API key required.
Run:  pytest tests/test_gemini_service.py -v
"""
import pytest
import io as _io
import base64 as _b64
from unittest.mock import patch, MagicMock
from services.gemini_service import (
    chat_with_gemini,
    analyze_image,
    generate_itinerary,
    recommend_places,
    _strip_fences,
    _normalise_history,
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _fake_response(text: str):
    """Build a mock Gemini response object."""
    resp = MagicMock()
    resp.text = text
    resp.usage_metadata = MagicMock()
    resp.usage_metadata.prompt_token_count = 10
    resp.usage_metadata.candidates_token_count = 20
    resp.usage_metadata.total_token_count = 30
    return resp


def _make_jpeg_b64() -> str:
    """Return base64 of a tiny real JPEG so PIL.Image.open succeeds."""
    from PIL import Image as _Img
    img = _Img.new("RGB", (10, 10), color=(0, 0, 0))
    buf = _io.BytesIO()
    img.save(buf, format="JPEG")
    return _b64.b64encode(buf.getvalue()).decode()


# ── _strip_fences ─────────────────────────────────────────────────────────────

class TestStripFences:
    def test_removes_json_fence(self):
        text = "```json\n{\"key\": \"value\"}\n```"
        assert _strip_fences(text) == '{"key": "value"}'

    def test_removes_plain_fence(self):
        text = "```\nhello\n```"
        assert _strip_fences(text) == "hello"

    def test_leaves_plain_text_unchanged(self):
        text = "just plain text"
        assert _strip_fences(text) == "just plain text"

    def test_strips_whitespace(self):
        text = "  hello  "
        assert _strip_fences(text) == "hello"


# ── _normalise_history ────────────────────────────────────────────────────────

class TestNormaliseHistory:
    def test_string_parts_converted_to_list(self):
        history = [{"role": "user", "parts": "Hello"}]
        result = _normalise_history(history)
        # Result is now google.genai Content objects; check role attribute
        assert len(result) == 1
        assert result[0].role == "user"

    def test_list_parts_accepted(self):
        history = [{"role": "user", "parts": ["Hello"]}]
        result = _normalise_history(history)
        assert len(result) == 1

    def test_malformed_entry_skipped(self):
        history = [{"no_role": True}]
        result = _normalise_history(history)
        assert result == []

    def test_empty_history_returns_empty(self):
        assert _normalise_history([]) == []


# ── chat_with_gemini ──────────────────────────────────────────────────────────

class TestChatWithGemini:
    def test_success_returns_reply(self):
        fake_chat = MagicMock()
        fake_chat.send_message.return_value = _fake_response("Hello!")
        with patch("services.gemini_service._client") as mock_client:
            mock_client.chats.create.return_value = fake_chat
            result = chat_with_gemini("Hi there")

        assert result["success"] is True
        assert result["response"] == "Hello!"

    def test_empty_message_returns_error(self):
        result = chat_with_gemini("")
        assert result["success"] is False
        assert "error" in result

    def test_history_is_accepted(self):
        history = [{"role": "user", "parts": ["Previous msg"]}]
        fake_chat = MagicMock()
        fake_chat.send_message.return_value = _fake_response("Response")
        with patch("services.gemini_service._client") as mock_client:
            mock_client.chats.create.return_value = fake_chat
            result = chat_with_gemini("Follow-up", chat_history=history)

        assert result["success"] is True

    def test_exception_returns_error_dict(self):
        with patch("services.gemini_service._client") as mock_client:
            mock_client.chats.create.side_effect = RuntimeError("boom")
            result = chat_with_gemini("test")

        assert result["success"] is False
        assert "error" in result


# ── analyze_image ─────────────────────────────────────────────────────────────

class TestAnalyzeImage:
    def test_success_returns_analysis(self):
        with patch("services.gemini_service._client") as mock_client:
            mock_client.models.generate_content.return_value = _fake_response("It's a park.")
            result = analyze_image(_make_jpeg_b64())

        assert result["success"] is True
        assert result["analysis"] == "It's a park."

    def test_invalid_base64_returns_error(self):
        result = analyze_image("not-valid-base64!!!")
        assert result["success"] is False
        assert "error" in result

    def test_custom_prompt_accepted(self):
        with patch("services.gemini_service._client") as mock_client:
            mock_client.models.generate_content.return_value = _fake_response("A bridge.")
            result = analyze_image(_make_jpeg_b64(), prompt="Name this bridge")

        assert result["success"] is True

    def test_exception_returns_error_dict(self):
        with patch("services.gemini_service._client") as mock_client:
            mock_client.models.generate_content.side_effect = RuntimeError("api error")
            result = analyze_image(_make_jpeg_b64())

        assert result["success"] is False


# ── generate_itinerary ────────────────────────────────────────────────────────

class TestGenerateItinerary:
    ITINERARY_JSON = '{"days": [{"day": 1, "activities": ["Visit museum"]}]}'

    def test_success_returns_itinerary(self):
        with patch("services.gemini_service._client") as mock_client:
            mock_client.models.generate_content.return_value = _fake_response(self.ITINERARY_JSON)
            result = generate_itinerary("Paris", num_days=2)

        assert result["success"] is True
        assert "itinerary" in result

    def test_exception_returns_error_dict(self):
        with patch("services.gemini_service._client") as mock_client:
            mock_client.models.generate_content.side_effect = RuntimeError("quota exceeded")
            result = generate_itinerary("Paris", num_days=1)

        assert result["success"] is False


# ── recommend_places ──────────────────────────────────────────────────────────

class TestRecommendPlaces:
    PLACES_JSON = '[{"name": "Kelvingrove Art Gallery", "description": "Famous museum"}]'

    def test_success_returns_places(self):
        with patch("services.gemini_service._client") as mock_client:
            mock_client.models.generate_content.return_value = _fake_response(self.PLACES_JSON)
            result = recommend_places("Glasgow")

        assert result["success"] is True
        assert "data" in result

    def test_exception_returns_error_dict(self):
        with patch("services.gemini_service._client") as mock_client:
            mock_client.models.generate_content.side_effect = RuntimeError("network error")
            result = recommend_places("Glasgow")

        assert result["success"] is False
