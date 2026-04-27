"""
tests/test_bookmarks_route.py
Basic tests for bookmarks route
"""
from fastapi import FastAPI
from fastapi.testclient import TestClient
from api.routes.bookmarks import router

app = FastAPI()
app.include_router(router, prefix="/bookmarks")
client = TestClient(app)


def test_get_bookmarks_ok():
    resp = client.get("/bookmarks?user_id=1")
    assert resp.status_code in (200, 404)
