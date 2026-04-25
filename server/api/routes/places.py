# api/routes/places.py
from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, Query
import logging
from sqlalchemy import desc, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.place import Place
from services.geocode_service import (
    get_coordinates,
    reverse_geocode,
    search_places,
)
from services.opentripmap_service import (
    get_popular_destinations,
    search_places_otm,
)

router = APIRouter()
logger = logging.getLogger("uvicorn.error")

# ── Category mapping: frontend → DB ──────────────────────────────────────────
_CAT_MAP = {
    "beaches":   "beach",
    "cities":    "city",
    "mountains": "mountain",
    "culture":   "cultural",
    "food":      "other",
}


# ─────────────────────────────────────────────────────────────────────────────
#  /explore  — primary endpoint for the Explore page
# ─────────────────────────────────────────────────────────────────────────────

import os
from fastapi.responses import JSONResponse

@router.get("/explore")
async def explore_places(
    search:   Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    sort:     Optional[str] = Query("Trending"),
    db: AsyncSession = Depends(get_db),
):
    logger.info(f"[EXPLORE] search={search} category={category} sort={sort}")
    cat = (category or "all").strip().lower()
    # 1. Ensure API key is loaded
    api_key = os.getenv("OPENTRIPMAP_API_KEY", "")
    if not api_key:
        logger.error("[EXPLORE] OpenTripMap API key not set")
        return []

    # 2. Always use OpenTripMap, even if no search (use 'world' as default query)
    query = search.strip() if search and search.strip() else "world"
    try:
        otm = await search_places_otm(
            query=query,
            category=cat,
            sort=sort or "Trending",
            limit=100,
            radius=50000,
            top_n=80,
        )
        if not otm or len(otm) < 1:
            logger.info("[EXPLORE] No results from OTM")
            return []
        if cat != "all":
            db_cat = _CAT_MAP.get(cat, cat)
            filtered = [p for p in otm if db_cat in p.get("category", "")]
            otm = filtered if filtered else otm
        if sort == "Top Rated":
            otm.sort(key=lambda p: p.get("rating", 0), reverse=True)
        elif sort == "Most Reviewed":
            otm.sort(key=lambda p: p.get("review_count", 0), reverse=True)
        else:
            otm.sort(
                key=lambda p: (int(p.get("trending", False)), p.get("rating", 0)),
                reverse=True,
            )
        # Ensure consistent marker format for frontend
        for p in otm:
            p["lat"] = float(p.get("lat", 0))
            p["lon"] = float(p.get("lon", 0))
            p["name"] = p.get("name", "")
        return otm[:100]
    except Exception as exc:
        logger.error(f"[OTM] error: {exc}")
        return []


# ─────────────────────────────────────────────────────────────────────────────
#  Geocoding endpoints (unchanged)
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/search")
async def search_location(q: str = Query(..., min_length=1)):
    logger.info(f"[SEARCH] Geocoding query: {q}")
    result = await get_coordinates(q)
    if not result:
        logger.warning(f"[SEARCH] No result for: {q}")
        return {}
    # Ensure consistent marker format
    return {
        "lat": float(result.get("lat", 0)),
        "lon": float(result.get("lon", 0)),
        "name": result.get("display_name", q)
    }


@router.get("/search-multiple")
async def search_multiple(q: str = Query(..., min_length=1)):
    logger.info(f"[SEARCH-MULTIPLE] Multi-geocode: {q}")
    results = await search_places(q)
    if not results:
        logger.info(f"[SEARCH-MULTIPLE] No results for: {q}")
        return []
    # Ensure consistent marker format
    return [
        {
            "lat": float(r.get("lat", 0)),
            "lon": float(r.get("lon", 0)),
            "name": r.get("display_name", r.get("name", q))
        }
        for r in results
    ]


@router.get("/reverse")
async def reverse(lat: float = Query(...), lon: float = Query(...)):
    logger.info(f"[REVERSE] Reverse geocode: {lat}, {lon}")
    result = await reverse_geocode(lat, lon)
    if not result:
        logger.warning(f"[REVERSE] No reverse result for: {lat},{lon}")
        return {}
    # Ensure consistent marker format
    return {
        "lat": float(result.get("lat", lat)),
        "lon": float(result.get("lon", lon)),
        "name": result.get("display_name", "")
    }