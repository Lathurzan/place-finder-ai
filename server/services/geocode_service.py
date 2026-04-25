# backend/services/geocode_service.py
import httpx

BASE_URL = "https://nominatim.openstreetmap.org"
HEADERS  = {"User-Agent": "place-finder-ai (lathurzan project)"}

async def get_coordinates(query: str):
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{BASE_URL}/search",
            params={"q": query, "format": "json", "limit": 1},
            headers=HEADERS,
        )
    if r.status_code != 200:
        return None
    data = r.json()
    if not data:
        return None
    return {
        "lat":          float(data[0]["lat"]),
        "lon":          float(data[0]["lon"]),
        "display_name": data[0]["display_name"],
    }


async def reverse_geocode(lat: float, lon: float):
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{BASE_URL}/reverse",
            params={"lat": lat, "lon": lon, "format": "json"},
            headers=HEADERS,
        )
    if r.status_code != 200:
        return None
    return {"display_name": r.json().get("display_name")}


async def search_places(query: str, limit: int = 8):
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{BASE_URL}/search",
            params={"q": query, "format": "json", "limit": limit},
            headers=HEADERS,
        )
    if r.status_code != 200:
        return []
    return [
        {
            "name": p["display_name"],
            "lat":  float(p["lat"]),
            "lon":  float(p["lon"]),
        }
        for p in r.json()
    ]