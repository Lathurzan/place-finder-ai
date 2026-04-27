"""
tests/test_ml_csv.py
Unit tests for api/routes/ml_csv.py
Run: pytest tests/test_ml_csv.py -v
"""
from fastapi import FastAPI
from fastapi.testclient import TestClient
from unittest.mock import patch

from api.routes.ml_csv import router

app = FastAPI()
app.include_router(router, prefix="/ml")
client = TestClient(app)


def sample_rows():
    return [
        {"id": 1, "name": "Place A", "similarity": 0.9},
        {"id": 2, "name": "Place B", "similarity": 0.8},
        {"id": 3, "name": "Place C", "similarity": 0.7},
    ]


def test_returns_top_n_default():
    with patch("services.recommendation_loader.load_recommendations", return_value=sample_rows()):
        resp = client.get("/ml/recommendations-csv")
    assert resp.status_code == 200
    body = resp.json()
    assert body["source"] == "CSV Model Output"
    assert body["count"] == 3
    assert isinstance(body["recommendations"], list)


def test_respects_top_n():
    with patch("services.recommendation_loader.load_recommendations", return_value=sample_rows()):
        resp = client.get("/ml/recommendations-csv?top_n=2")
    assert resp.status_code == 200
    body = resp.json()
    assert body["count"] == 2


def test_filters_by_user_id_when_present():
    rows = [
        {"id": 1, "name": "A", "user_id": "1", "similarity": 0.5},
        {"id": 2, "name": "B", "user_id": "2", "similarity": 0.6},
    ]
    with patch("services.recommendation_loader.load_recommendations", return_value=rows):
        resp = client.get("/ml/recommendations-csv?user_id=2")
    assert resp.status_code == 200
    body = resp.json()
    assert body["count"] == 1
    assert body["recommendations"][0]["user_id"] == "2"
