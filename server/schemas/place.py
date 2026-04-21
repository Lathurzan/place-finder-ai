from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class PlaceResponse(BaseModel):
    id:          int
    name:        str
    description: Optional[str]
    category:    Optional[str]
    city:        Optional[str]
    country:     Optional[str]
    rating:      Optional[float]
    view_count:  int
    image_url:   Optional[str]
    best_season: Optional[str]

    model_config = {"from_attributes": True}


class PlaceNearbyResponse(PlaceResponse):
    distance_m: Optional[float] = None


class BookmarkCreate(BaseModel):
    place_id: int
    note:     Optional[str] = None


class BookmarkResponse(BaseModel):
    id:        int
    place_id:  int
    note:      Optional[str]
    created_at: datetime
    place:     Optional[PlaceResponse]

    model_config = {"from_attributes": True}


class ItineraryCreate(BaseModel):
    title:         str = Field(..., min_length=2)
    destination:   Optional[str] = None
    country:       Optional[str] = None
    duration_days: int = Field(..., gt=0)
    place_id:      Optional[int] = None
    day_plan:      list = []


class ItineraryResponse(BaseModel):
    id:            int
    title:         str
    destination:   Optional[str]
    country:       Optional[str]
    duration_days: int
    day_plan:      list
    created_at:    datetime

    model_config = {"from_attributes": True}