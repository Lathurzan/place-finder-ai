"""
api/routes/ai.py  –  FastAPI router for all Gemini AI endpoints.

Fixes vs original:
  • /generate body now accepts {"prompt": "...", "max_tokens": 1024}  (422 was
    caused by FastAPI receiving {"message": ...} for a model that expected "prompt")
  • /recommend-places alias added so both /recommend and /recommend-places work
  • run_in_threadpool wraps every sync service call (avoids blocking the event loop)
  • All 502 errors now surface the real Gemini error message in the detail field
  • ChatRequest.history field accepts both str parts and list parts
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator
from starlette.concurrency import run_in_threadpool

from services.gemini_service import (
    analyze_image,
    chat_with_gemini,
    generate_itinerary,
    recommend_places,
)

router = APIRouter()


# ── Request schemas ───────────────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    """Single-turn text generation.  Accepts 'prompt' OR 'message' for flexibility."""
    prompt:     Optional[str] = None
    message:    Optional[str] = None   # alias so /chat and /generate accept same body
    max_tokens: int = 1024

    @field_validator("prompt", mode="before")
    @classmethod
    def _require_prompt_or_message(cls, v, info):
        # Resolved in the endpoint — just pass through here
        return v


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, Any]]] = None   # Gemini-format chat history


class ImageAnalysisRequest(BaseModel):
    image_data: str                    # base64-encoded image (data-URI ok)
    prompt:     Optional[str] = None
    mime_type:  str = "image/jpeg"


class ItineraryRequest(BaseModel):
    destination:  str
    num_days:     int = 3
    interests:    Optional[List[str]] = None
    budget:       str = "moderate"     # budget | moderate | luxury
    travel_style: str = "balanced"     # relaxed | balanced | packed
    start_date:   Optional[str] = None # YYYY-MM-DD


class RecommendRequest(BaseModel):
    location:    str
    category:    str = "tourist attractions"
    preferences: Optional[List[str]] = None
    radius_km:   int = 10


# ── Helpers ───────────────────────────────────────────────────────────────────

def _raise_if_failed(result: dict, label: str) -> None:
    """Raise a 502 with the upstream error message if the service call failed."""
    if not result.get("success"):
        raise HTTPException(
            status_code=502,
            detail=f"{label}: {result.get('error', 'Unknown error')}",
        )


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/health", tags=["AI"])
async def ai_health():
    """Health-check for the AI router."""
    return {
        "status":  "ok",
        "service": "Gemini AI",
        "endpoints": [
            "GET  /api/ai/health",
            "POST /api/ai/generate",
            "POST /api/ai/chat",
            "POST /api/ai/analyze-image",
            "POST /api/ai/itinerary",
            "POST /api/ai/recommend",
            "POST /api/ai/recommend-places",   # alias
        ],
    }


@router.post("/generate", tags=["AI"])
async def generate(body: GenerateRequest):
    """
    Single-turn text generation.

    Body:
        {"prompt": "What are the best cafes in Glasgow?"}
        OR
        {"message": "What are the best cafes in Glasgow?"}
    """
    text = (body.prompt or body.message or "").strip()
    if not text:
        raise HTTPException(status_code=422, detail="Provide 'prompt' or 'message'.")

    result = await run_in_threadpool(chat_with_gemini, text, [])
    _raise_if_failed(result, "Text generation")
    return result


@router.post("/chat", tags=["AI"])
async def chat(body: ChatRequest):
    """
    Multi-turn chat.  Pass previous turns in 'history'.

    Body:
        {
            "message": "What about museums?",
            "history": [
                {"role": "user",  "parts": ["Tell me about Paris"]},
                {"role": "model", "parts": ["Paris is the capital of France…"]}
            ]
        }
    """
    result = await run_in_threadpool(
        chat_with_gemini, body.message, body.history or []
    )
    _raise_if_failed(result, "Chat")
    return result


@router.post("/analyze-image", tags=["AI"])
async def analyse_image_endpoint(body: ImageAnalysisRequest):
    """
    Analyse a base64-encoded image for place / location insights.

    Body:
        {
            "image_data": "<base64 or data-URI string>",
            "prompt": "What landmark is this?",   // optional
            "mime_type": "image/jpeg"              // optional
        }
    """
    result = await run_in_threadpool(
        analyze_image, body.image_data, body.prompt, body.mime_type
    )
    _raise_if_failed(result, "Image analysis")
    return result


@router.post("/itinerary", tags=["AI"])
async def itinerary(body: ItineraryRequest):
    """
    Generate a detailed day-by-day travel itinerary.

    Body:
        {
            "destination": "Edinburgh, Scotland",
            "num_days": 3,
            "interests": ["history", "whisky"],
            "budget": "moderate",
            "travel_style": "balanced",
            "start_date": "2025-07-10"
        }
    """
    result = await run_in_threadpool(
        generate_itinerary,
        body.destination,
        body.num_days,
        body.interests,
        body.budget,
        body.travel_style,
        body.start_date,
    )
    _raise_if_failed(result, "Itinerary generation")
    return result


@router.post("/recommend", tags=["AI"])
@router.post("/recommend-places", tags=["AI"], include_in_schema=False)  # alias
async def recommend(body: RecommendRequest):
    """
    Recommend places near a location.

    Body:
        {
            "location": "Edinburgh Old Town",
            "category": "restaurants",
            "preferences": ["seafood", "outdoor"],
            "radius_km": 3
        }
    """
    result = await run_in_threadpool(
        recommend_places,
        body.location,
        body.category,
        body.preferences,
        body.radius_km,
    )
    _raise_if_failed(result, "Place recommendations")
    return result