"""
tests/test_itineraries_route.py
Basic tests for itineraries route
"""
from fastapi import FastAPI
from fastapi.testclient import TestClient
from api.routes.itineraries import router

app = FastAPI()
app.include_router(router, prefix="/itineraries")
client = TestClient(app)


def test_get_itineraries_ok():
    resp = client.get("/itineraries")
    assert resp.status_code in (200, 404)
