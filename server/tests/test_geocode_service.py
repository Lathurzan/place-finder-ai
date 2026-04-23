"""
tests/test_geocode_service.py
Unit tests for services/geocode_service.py
All HTTP calls are mocked — no network required.
Run:  pytest tests/test_geocode_service.py -v
"""
import pytest
from unittest.mock import patch, MagicMock
from services.geocode_service import get_coordinates, reverse_geocode, search_places


NOMINATIM_SEARCH_RESPONSE = [
    {
        "lat": "55.8617",
        "lon": "-4.2583",
        "display_name": "Glasgow, Scotland, United Kingdom",
    }
]

NOMINATIM_REVERSE_RESPONSE = {
    "display_name": "George Square, Glasgow, Scotland, United Kingdom"
}

NOMINATIM_MULTI_RESPONSE = [
    {"lat": "55.8617", "lon": "-4.2583", "display_name": "Glasgow, Scotland"},
    {"lat": "51.5074", "lon": "-0.1278", "display_name": "London, England"},
]


def _mock_response(json_data, status_code=200):
    mock = MagicMock()
    mock.status_code = status_code
    mock.json.return_value = json_data
    return mock


# ── get_coordinates ───────────────────────────────────────────────────────────

class TestGetCoordinates:
    def test_returns_lat_lon_and_name(self):
        with patch("services.geocode_service.requests.get",
                   return_value=_mock_response(NOMINATIM_SEARCH_RESPONSE)):
            result = get_coordinates("Glasgow")

        assert result is not None
        assert result["lat"] == pytest.approx(55.8617, rel=1e-3)
        assert result["lon"] == pytest.approx(-4.2583, rel=1e-3)
        assert "Glasgow" in result["display_name"]

    def test_returns_none_on_empty_response(self):
        with patch("services.geocode_service.requests.get",
                   return_value=_mock_response([])):
            result = get_coordinates("nowhere_xyz")

        assert result is None

    def test_returns_none_on_http_error(self):
        with patch("services.geocode_service.requests.get",
                   return_value=_mock_response({}, status_code=500)):
            result = get_coordinates("Glasgow")

        assert result is None

    def test_passes_query_to_nominatim(self):
        with patch("services.geocode_service.requests.get",
                   return_value=_mock_response(NOMINATIM_SEARCH_RESPONSE)) as mock_get:
            get_coordinates("Tokyo")

        call_kwargs = mock_get.call_args
        params = call_kwargs[1]["params"] if "params" in call_kwargs[1] else call_kwargs[0][1]
        assert params["q"] == "Tokyo"


# ── reverse_geocode ───────────────────────────────────────────────────────────

class TestReverseGeocode:
    def test_returns_display_name(self):
        with patch("services.geocode_service.requests.get",
                   return_value=_mock_response(NOMINATIM_REVERSE_RESPONSE)):
            result = reverse_geocode(55.8617, -4.2583)

        assert result is not None
        assert "display_name" in result
        assert "Glasgow" in result["display_name"]

    def test_returns_none_on_http_error(self):
        with patch("services.geocode_service.requests.get",
                   return_value=_mock_response({}, status_code=404)):
            result = reverse_geocode(0.0, 0.0)

        assert result is None


# ── search_places ─────────────────────────────────────────────────────────────

class TestSearchPlaces:
    def test_returns_list_of_places(self):
        with patch("services.geocode_service.requests.get",
                   return_value=_mock_response(NOMINATIM_MULTI_RESPONSE)):
            results = search_places("London")

        assert isinstance(results, list)
        assert len(results) == 2
        assert results[0]["name"] == "Glasgow, Scotland"
        assert results[0]["lat"] == pytest.approx(55.8617, rel=1e-3)

    def test_returns_empty_list_on_error(self):
        with patch("services.geocode_service.requests.get",
                   return_value=_mock_response({}, status_code=500)):
            results = search_places("anywhere")

        assert results == []

    def test_returns_empty_list_on_no_results(self):
        with patch("services.geocode_service.requests.get",
                   return_value=_mock_response([])):
            results = search_places("xyzzy_nonexistent")

        assert results == []

    def test_result_shape(self):
        with patch("services.geocode_service.requests.get",
                   return_value=_mock_response(NOMINATIM_MULTI_RESPONSE)):
            results = search_places("test")

        for place in results:
            assert "name" in place
            assert "lat" in place
            assert "lon" in place
