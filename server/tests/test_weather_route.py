"""
tests/test_weather_route.py
Unit tests for api/routes/weather.py
All weather service calls are mocked.
Run:  pytest tests/test_weather_route.py -v
"""
import pytest
import asyncio
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from fastapi import FastAPI
from api.routes.weather import router

app = FastAPI()
app.include_router(router, prefix="/weather")
client = TestClient(app)


FAKE_CURRENT_RAW = {
    "weather": [{"description": "clear sky", "icon": "01d"}],
    "main": {"temp": 22.0, "feels_like": 21.0, "humidity": 55, "pressure": 1013},
    "wind": {"speed": 3.0, "deg": 180},
    "name": "London",
}

FAKE_FORECAST_RAW = {"daily": [], "hourly": [], "current": FAKE_CURRENT_RAW}


class TestCurrentEndpoint:
    def test_with_lat_lon(self):
        with patch("api.routes.weather.get_current_weather",
                   new_callable=AsyncMock, return_value=FAKE_CURRENT_RAW):
            resp = client.get("/weather/current?lat=51.5074&lon=-0.1278")

        assert resp.status_code == 200
        data = resp.json()
        assert data["temp"] == pytest.approx(22.0)
        assert data["description"] == "clear sky"

    def test_with_city(self):
        with patch("api.routes.weather.get_current_weather_by_city",
                   new_callable=AsyncMock, return_value=FAKE_CURRENT_RAW):
            resp = client.get("/weather/current?city=London")

        assert resp.status_code == 200
        assert resp.json()["temp"] == pytest.approx(22.0)

    def test_missing_both_returns_400(self):
        resp = client.get("/weather/current")
        assert resp.status_code == 400

    def test_weather_service_error_returns_502(self):
        from services.weather_service import OpenWeatherError
        with patch("api.routes.weather.get_current_weather",
                   new_callable=AsyncMock, side_effect=OpenWeatherError("API down")):
            resp = client.get("/weather/current?lat=0&lon=0")

        assert resp.status_code == 502
        assert "API down" in resp.json()["detail"]


class TestForecastEndpoint:
    def test_with_lat_lon(self):
        with patch("api.routes.weather.get_forecast",
                   new_callable=AsyncMock, return_value=FAKE_FORECAST_RAW):
            resp = client.get("/weather/forecast?lat=51.5&lon=-0.1")

        assert resp.status_code == 200

    def test_with_city(self):
        with patch("api.routes.weather.get_forecast_by_city",
                   new_callable=AsyncMock, return_value=FAKE_FORECAST_RAW):
            resp = client.get("/weather/forecast?city=London")

        assert resp.status_code == 200

    def test_missing_both_returns_400(self):
        resp = client.get("/weather/forecast")
        assert resp.status_code == 400

    def test_with_exclude_param(self):
        with patch("api.routes.weather.get_forecast",
                   new_callable=AsyncMock, return_value=FAKE_FORECAST_RAW) as mock_fc:
            resp = client.get("/weather/forecast?lat=51.5&lon=-0.1&exclude=minutely,alerts")

        assert resp.status_code == 200

    def test_weather_service_error_returns_502(self):
        from services.weather_service import OpenWeatherError
        with patch("api.routes.weather.get_forecast",
                   new_callable=AsyncMock, side_effect=OpenWeatherError("quota")):
            resp = client.get("/weather/forecast?lat=0&lon=0")

        assert resp.status_code == 502
