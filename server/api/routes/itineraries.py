from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel

from core.database import get_db

router = APIRouter()


# In-memory store for quick prototyping. Replace with DB-backed implementation later.
ITEMS = [
    {
        "id": 1,
        "title": "Tokyo & Kyoto Spring",
        "destination": "Japan",
        "dates": "May 3 – May 14, 2026",
        "days": 11,
        "status": "planned",
        "places": 18,
        "cover": "🗾",
        "tags": ["Culture", "Food", "Nature"],
    },
    {
        "id": 2,
        "title": "Santorini Getaway",
        "destination": "Greece",
        "dates": "Jun 20 – Jun 27, 2026",
        "days": 7,
        "status": "planned",
        "places": 9,
        "cover": "🏝️",
        "tags": ["Beach", "Relaxation"],
    },
]


class ItineraryCreate(BaseModel):
    title: str
    destination: str
    dates: Optional[str] = None
    days: Optional[int] = 0
    places: Optional[int] = 0
    status: Optional[str] = "planned"
    tags: Optional[List[str]] = []
    cover: Optional[str] = "🗺️"


class Itinerary(ItineraryCreate):
    id: int


@router.get("/itineraries")
async def get_itineraries(db: AsyncSession = Depends(get_db)):
    """Return a list of itineraries for the current user.
    For now this returns simple mock-like objects that the frontend expects.
    """
    try:
        return ITEMS
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/itineraries", status_code=201, response_model=Itinerary)
async def create_itinerary(payload: ItineraryCreate, db: AsyncSession = Depends(get_db)):
    """Create a new itinerary (in-memory for now). Returns the created object with an id.
    This is a stop-gap implementation until a database-backed model is added.
    """
    try:
        new_id = max((item["id"] for item in ITEMS), default=0) + 1
        item = payload.dict()
        item["id"] = new_id
        # Ensure defaults are present
        item.setdefault("dates", payload.dates or "")
        item.setdefault("days", payload.days or 0)
        item.setdefault("places", payload.places or 0)
        item.setdefault("status", payload.status or "planned")
        item.setdefault("tags", payload.tags or [])
        item.setdefault("cover", payload.cover or "🗺️")
        ITEMS.append(item)
        return item
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
