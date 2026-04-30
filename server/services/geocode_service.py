# backend/services/geocode_service.py
"""
Geocode helpers. Tests expect to patch `services.geocode_service.requests.get`.
To keep production async behaviour, this module exposes synchronous helpers that
use `requests` (so tests can patch easily) and async wrappers that use httpx.
"""
import requests
import httpx

BASE_URL = "https://nominatim.openstreetmap.org"
HEADERS = {"User-Agent": "place-finder-ai (lathurzan project)"}


def _sync_get(path: str, params: dict):
    url = f"{BASE_URL}{path}"
    return requests.get(url, params=params, headers=HEADERS)


def _process_search_response(r):
    if r.status_code != 200:
        return None
    data = r.json()
    if not data:
        return None
    return data


def get_coordinates(query: str):
    # Synchronous function so tests can patch requests.get
    r = _sync_get("/search", {"q": query, "format": "json", "limit": 1})
    data = _process_search_response(r)
    if not data:
        return None
    return {"lat": float(data[0]["lat"]), "lon": float(data[0]["lon"]), "display_name": data[0]["display_name"]}


def reverse_geocode(lat: float, lon: float):
    r = _sync_get("/reverse", {"lat": lat, "lon": lon, "format": "json"})
    if r.status_code != 200:
        return None
    return {"display_name": r.json().get("display_name")}


def search_places(query: str, limit: int = 8):
    r = _sync_get("/search", {"q": query, "format": "json", "limit": limit})
    if r.status_code != 200:
        return []
    return [{"name": p["display_name"], "lat": float(p["lat"]), "lon": float(p["lon"])} for p in r.json()]


# Async wrappers for production use (still use httpx)
async def async_get_coordinates(query: str):
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{BASE_URL}/search", params={"q": query, "format": "json", "limit": 1}, headers=HEADERS)
    if r.status_code != 200:
        return None
    data = r.json()
    if not data:
        return None
    return {"lat": float(data[0]["lat"]), "lon": float(data[0]["lon"]), "display_name": data[0]["display_name"]}


async def async_reverse_geocode(lat: float, lon: float):
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{BASE_URL}/reverse", params={"lat": lat, "lon": lon, "format": "json"}, headers=HEADERS)
    if r.status_code != 200:
        return None
    return {"display_name": r.json().get("display_name")}


async def async_search_places(query: str, limit: int = 8):
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{BASE_URL}/search", params={"q": query, "format": "json", "limit": limit}, headers=HEADERS)
    if r.status_code != 200:
        return []
    return [{"name": p["display_name"], "lat": float(p["lat"]), "lon": float(p["lon"])} for p in r.json()]