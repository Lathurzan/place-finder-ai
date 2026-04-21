from pydantic import BaseModel
from typing import Optional


class ImageAnalysisResponse(BaseModel):
    place_name:   str
    country:      str
    city:         Optional[str]
    description:  str
    confidence:   int
    latitude:     float
    longitude:    float
    tags:         list[str] = []


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []


class ChatResponse(BaseModel):
    reply:       str
    place_names: list[str] = []