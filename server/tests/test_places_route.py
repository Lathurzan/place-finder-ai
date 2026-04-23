"""
tests/test_places_route.py
Unit tests for api/routes/places.py
Mocks geocode_service so no network calls are made.
Run:  pytest tests/test_places_route.py -v
"""
import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from fastapi import FastAPI
from api.routes.places import router

app = FastAPI()
app.include_router(router, prefix="/places")
client = TestClient(app)


FAKE_SINGLE = {"lat": 55.8617, "lon": -4.2583, "display_name": "Glasgow, Scotland"}
FAKE_MULTI = [
    {"name": "Glasgow, Scotland", "lat": 55.8617, "lon": -4.2583},
    {"name": "Glasgow, Kentucky", "lat": 36.9959, "lon": -85.9119},
]


class TestSearchLocation:
    def test_returns_coordinates(self):
        with patch("api.routes.places.get_coordinates", return_value=FAKE_SINGLE):
            resp = client.get("/places/search?q=Glasgow")

        assert resp.status_code == 200
        data = resp.json()
        assert data["lat"] == pytest.approx(55.8617, rel=1e-3)
        assert data["lon"] == pytest.approx(-4.2583, rel=1e-3)

    def test_missing_q_returns_422(self):
        resp = client.get("/places/search")
        assert resp.status_code == 422

    def test_not_found_returns_error_key(self):
        with patch("api.routes.places.get_coordinates", return_value=None):
            resp = client.get("/places/search?q=nowhere")

        assert resp.status_code == 200
        assert "error" in resp.json()


class TestSearchMultiple:
    def test_returns_list(self):
        with patch("api.routes.places.search_places", return_value=FAKE_MULTI):
            resp = client.get("/places/search-multiple?q=Glasgow")

        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 2

    def test_empty_results(self):
        with patch("api.routes.places.search_places", return_value=[]):
            resp = client.get("/places/search-multiple?q=nothing")

        assert resp.status_code == 200
        assert resp.json() == []

    def test_result_shape(self):
        with patch("api.routes.places.search_places", return_value=FAKE_MULTI):
            resp = client.get("/places/search-multiple?q=Glasgow")

        for place in resp.json():
            assert "name" in place
            assert "lat" in place
            assert "lon" in place
