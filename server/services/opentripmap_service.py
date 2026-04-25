# services/opentripmap_service.py
import httpx
import asyncio
import os

API_KEY  = os.getenv("OPENTRIPMAP_API_KEY", "")
BASE_URL = "https://api.opentripmap.com/0.1/en"

CATEGORY_KINDS: dict[str, str] = {
    "beaches":   "beaches",
    "cities":    "historic,architecture,cultural",
    "mountains": "mountains,natural",
    "culture":   "cultural,museums,historic",
    "food":      "foods",
    "all":       "interesting_places",
}

# Simple in-process cache so repeated page loads don't burn API quota
_cache: dict[str, list[dict]] = {}


def _kind_to_category(kinds: str) -> str:
    k = kinds.lower()
    if "beach"      in k: return "beach"
    if "mountain"   in k: return "mountain"
    if "museum"     in k or "cultural" in k: return "cultural"
    if "historic"   in k: return "historical"
    if "natural"    in k or "nature" in k:   return "nature"
    if "food"       in k or "restaurant" in k: return "other"
    if "architectur"in k or "city" in k:    return "city"
    return "other"


def _kind_to_emoji(kinds: str) -> str:
    k = kinds.lower()
    if "beach"      in k: return "🏖️"
    if "mountain"   in k: return "⛰️"
    if "museum"     in k: return "🏛️"
    if "historic"   in k: return "🏰"
    if "natural"    in k: return "🌿"
    if "food"       in k: return "🍽️"
    if "architectur"in k: return "🏙️"
    return "📍"


async def _fetch_detail(client: httpx.AsyncClient, place: dict) -> dict | None:
    """Fetch full details for a single place xid."""
    xid = place.get("xid", "")
    if not xid:
        return None
    try:
        r = await client.get(
            f"{BASE_URL}/places/xid/{xid}",
            params={"apikey": API_KEY},
            timeout=8.0,
        )
        if r.status_code != 200:
            return None
        d = r.json()
        name = d.get("name") or place.get("name", "")
        if not name or len(name) < 2:
            return None

        kinds_str   = d.get("kinds", "")
        address     = d.get("address", {}) or {}
        city        = (address.get("city") or address.get("town")
                       or address.get("village") or address.get("county") or "")
        country     = address.get("country", "")
        description = (
            (d.get("wikipedia_extracts") or {}).get("text")
            or (d.get("info") or {}).get("descr")
            or ""
        )
        image_url = ((d.get("preview") or {}).get("source") or "")
        rate      = float(place.get("rate", 0))
        rating    = round(min(rate / 7 * 5, 5.0), 1)

        return {
            "id":           abs(hash(xid)) % 10_000_000,
            "xid":          xid,
            "name":         name,
            "country":      country,
            "city":         city,
            "category":     _kind_to_category(kinds_str),
            "rating":       rating,
            "review_count": int(rate * 200),
            "cover":        _kind_to_emoji(kinds_str),
            "tags":         [t.strip() for t in kinds_str.split(",")[:3] if t.strip()],
            "description":  (description[:280] if description
                             else f"A popular attraction in {city or country or 'the world'}."),
            "trending":     rate >= 5,
            "image_url":    image_url,
            "source":       "opentripmap",
        }
    except Exception:
        return None



async def search_places_otm(
    query:    str,
    category: str = "all",
    sort:     str = "Trending",
    limit:    int = 100,
    radius:   int = 50000,
    top_n:    int = 80,
) -> list[dict]:
    if not API_KEY:
        return []

    cache_key = f"{query}|{category}|{limit}|{radius}|{top_n}"
    if cache_key in _cache:
        return _cache[cache_key]

    kinds = CATEGORY_KINDS.get(category, "interesting_places")

    async with httpx.AsyncClient(timeout=20.0) as client:
        # Step 1 — geocode the city name
        try:
            geo_r = await client.get(
                f"{BASE_URL}/places/geoname",
                params={"name": query, "apikey": API_KEY},
            )
            geo = geo_r.json() if geo_r.status_code == 200 else {}
        except Exception:
            return []

        if not geo or "lat" not in geo:
            return []

        lat, lon = geo["lat"], geo["lon"]

        # Step 2 — radius search (default 50 km to get more results)
        try:
            pr = await client.get(
                f"{BASE_URL}/places/radius",
                params={
                    "radius":  radius,
                    "lon":     lon,
                    "lat":     lat,
                    "kinds":   kinds,
                    "rate":    "1",
                    "format":  "json",
                    "limit":   limit,
                    "apikey":  API_KEY,
                },
            )
            raw = pr.json() if pr.status_code == 200 else []
        except Exception:
            return []

        if not isinstance(raw, list) or not raw:
            return []

        # Sort by rate descending, take top_n for detail fetching
        raw.sort(key=lambda p: p.get("rate", 0), reverse=True)
        top = raw[:top_n]

        # Step 3 — fetch details in parallel (batch size 20 for performance)
        results: list[dict] = []
        batch_size = 20
        for i in range(0, len(top), batch_size):
            batch = top[i : i + batch_size]
            tasks = [_fetch_detail(client, p) for p in batch]
            batch_results = await asyncio.gather(*tasks, return_exceptions=True)
            for r in batch_results:
                if isinstance(r, dict):
                    results.append(r)
            if len(results) >= limit:
                break

    _cache[cache_key] = results[:limit]
    return results[:limit]


# Popular world cities for the default (no-search) Explore view
_POPULAR_CITIES = [
    ("Paris",        "culture"),
    ("Tokyo",        "culture"),
    ("Rome",         "culture"),
    ("London",       "cities"),
    ("New York",     "cities"),
    ("Barcelona",    "cities"),
    ("Santorini",    "beaches"),
    ("Bali",         "beaches"),
    ("Maldives",     "beaches"),
    ("Banff",        "mountains"),
    ("Machu Picchu", "culture"),
    ("Kyoto",        "culture"),
    ("Dubai",        "cities"),
    ("Amsterdam",    "cities"),
    ("Istanbul",     "culture"),
]


async def get_popular_destinations(limit: int = 80) -> list[dict]:
    if not API_KEY:
        return []

    cache_key = f"popular|{limit}"
    if cache_key in _cache:
        return _cache[cache_key]

    # Fetch cities in parallel batches of 5
    results: list[dict] = []
    for i in range(0, len(_POPULAR_CITIES), 5):
        batch = _POPULAR_CITIES[i : i + 5]
        tasks = [
            search_places_otm(city, cat, limit=8)
            for city, cat in batch
        ]
        batch_results = await asyncio.gather(*tasks, return_exceptions=True)
        for r in batch_results:
            if isinstance(r, list):
                results.extend(r[:6])   # take up to 6 per city
        if len(results) >= limit:
            break

    # Deduplicate by xid
    seen: set[str] = set()
    unique: list[dict] = []
    for p in results:
        xid = p.get("xid", p.get("name", ""))
        if xid not in seen:
            seen.add(xid)
            unique.append(p)

    _cache[cache_key] = unique[:limit]
    return unique[:limit]