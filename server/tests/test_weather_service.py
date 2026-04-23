"""
tests/test_weather_service.py
Unit tests for services/weather_service.py
All HTTP calls are mocked — no network or API key required.
Run:  pytest tests/test_weather_service.py -v
"""
import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from services.weather_service import (
    get_current_weather,
    get_current_weather_by_city,
    get_forecast,
    geocode_city,
    normalize_current,
    OpenWeatherError,
)


# ── Shared fake payloads ──────────────────────────────────────────────────────

FAKE_CURRENT = {
    "weather": [{"description": "light rain", "icon": "10d"}],
    "main": {"temp": 12.5, "feels_like": 10.0, "humidity": 80, "pressure": 1015},
    "wind": {"speed": 4.2, "deg": 220},
    "name": "Glasgow",
}

FAKE_FORECAST = {"daily": [], "hourly": [], "current": FAKE_CURRENT}

FAKE_GEO = [{"lat": 55.8617, "lon": -4.2583, "name": "Glasgow"}]


def _async_mock_response(json_data, status_code=200):
    """Create an async context-manager mock for httpx.AsyncClient.get"""
    resp = MagicMock()
    resp.status_code = status_code
    resp.json.return_value = json_data
    if status_code >= 400:
        from httpx import HTTPStatusError, Request, Response
        resp.raise_for_status.side_effect = HTTPStatusError(
            message="error", request=MagicMock(), response=MagicMock(status_code=status_code)
        )
    else:
        resp.raise_for_status = MagicMock()

    client_mock = AsyncMock()
    client_mock.get = AsyncMock(return_value=resp)
    return client_mock


# ── normalize_current ─────────────────────────────────────────────────────────

class TestNormalizeCurrent:
    def test_extracts_temp(self):
        norm = normalize_current(FAKE_CURRENT)
        assert norm["temp"] == 12.5

    def test_extracts_humidity(self):
        norm = normalize_current(FAKE_CURRENT)
        assert norm["humidity"] == 80

    def test_extracts_wind_speed(self):
        norm = normalize_current(FAKE_CURRENT)
        assert norm["wind_speed"] == pytest.approx(4.2)

    def test_extracts_description(self):
        norm = normalize_current(FAKE_CURRENT)
        assert norm["description"] == "light rain"

    def test_extracts_icon(self):
        norm = normalize_current(FAKE_CURRENT)
        assert norm["icon"] == "10d"

    def test_raw_field_present(self):
        norm = normalize_current(FAKE_CURRENT)
        assert "raw" in norm

    def test_missing_keys_return_none(self):
        norm = normalize_current({})
        assert norm["temp"] is None
        assert norm["description"] is None


# ── get_current_weather ───────────────────────────────────────────────────────

class TestGetCurrentWeather:
    def test_returns_json_on_success(self, monkeypatch):
        async def run():
            client_mock = _async_mock_response(FAKE_CURRENT)
            with patch("services.weather_service.httpx.AsyncClient") as MockClient:
                MockClient.return_value.__aenter__ = AsyncMock(return_value=client_mock)
                MockClient.return_value.__aexit__ = AsyncMock(return_value=False)
                result = await get_current_weather(55.8617, -4.2583)
            assert result["name"] == "Glasgow"

        asyncio.run(run())

    def test_raises_openweather_error_when_no_key(self, monkeypatch):
        async def run():
            import services.weather_service as ws
            monkeypatch.setattr(ws, "OPENWEATHER_API_KEY", None)
            with pytest.raises(OpenWeatherError, match="not set"):
                await get_current_weather(0, 0)

        asyncio.run(run())

    def test_raises_openweather_error_on_http_error(self, monkeypatch):
        async def run():
            import services.weather_service as ws
            monkeypatch.setattr(ws, "OPENWEATHER_API_KEY", "fakekey")
            client_mock = _async_mock_response({}, status_code=401)
            with patch("services.weather_service.httpx.AsyncClient") as MockClient:
                MockClient.return_value.__aenter__ = AsyncMock(return_value=client_mock)
                MockClient.return_value.__aexit__ = AsyncMock(return_value=False)
                with pytest.raises(OpenWeatherError):
                    await get_current_weather(0, 0)

        asyncio.run(run())


# ── get_current_weather_by_city ───────────────────────────────────────────────

class TestGetCurrentWeatherByCity:
    def test_passes_city_param(self, monkeypatch):
        async def run():
            import services.weather_service as ws
            monkeypatch.setattr(ws, "OPENWEATHER_API_KEY", "fakekey")
            client_mock = _async_mock_response(FAKE_CURRENT)
            with patch("services.weather_service.httpx.AsyncClient") as MockClient:
                MockClient.return_value.__aenter__ = AsyncMock(return_value=client_mock)
                MockClient.return_value.__aexit__ = AsyncMock(return_value=False)
                result = await get_current_weather_by_city("Glasgow")
            assert result["name"] == "Glasgow"

        asyncio.run(run())

    def test_raises_when_no_api_key(self, monkeypatch):
        async def run():
            import services.weather_service as ws
            monkeypatch.setattr(ws, "OPENWEATHER_API_KEY", None)
            with pytest.raises(OpenWeatherError):
                await get_current_weather_by_city("Glasgow")

        asyncio.run(run())


# ── geocode_city ──────────────────────────────────────────────────────────────

class TestGeocodeCity:
    def test_returns_first_result(self, monkeypatch):
        async def run():
            import services.weather_service as ws
            monkeypatch.setattr(ws, "OPENWEATHER_API_KEY", "fakekey")
            client_mock = _async_mock_response(FAKE_GEO)
            with patch("services.weather_service.httpx.AsyncClient") as MockClient:
                MockClient.return_value.__aenter__ = AsyncMock(return_value=client_mock)
                MockClient.return_value.__aexit__ = AsyncMock(return_value=False)
                result = await geocode_city("Glasgow")
            assert result["lat"] == 55.8617

        asyncio.run(run())

    def test_returns_none_on_empty_response(self, monkeypatch):
        async def run():
            import services.weather_service as ws
            monkeypatch.setattr(ws, "OPENWEATHER_API_KEY", "fakekey")
            client_mock = _async_mock_response([])
            with patch("services.weather_service.httpx.AsyncClient") as MockClient:
                MockClient.return_value.__aenter__ = AsyncMock(return_value=client_mock)
                MockClient.return_value.__aexit__ = AsyncMock(return_value=False)
                result = await geocode_city("xyzzy")
            assert result is None

        asyncio.run(run())
