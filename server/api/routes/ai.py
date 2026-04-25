# api/routes/ai.py
from __future__ import annotations

import base64
import os
from typing import Any, Dict, List, Optional

import google.generativeai as genai
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator
from starlette.concurrency import run_in_threadpool

from services.gemini_service import (
    analyze_image as gemini_analyze_image,
    chat_with_gemini,
    generate_itinerary,
    recommend_places,
)

# Configure Gemini SDK once at module level
genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

router = APIRouter()


# ── Request schemas ───────────────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    prompt:     Optional[str] = None
    message:    Optional[str] = None
    max_tokens: int = 1024

    @field_validator("prompt", mode="before")
    @classmethod
    def _require_prompt_or_message(cls, v, info):
        return v


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, Any]]] = None


class ImageAnalysisRequest(BaseModel):
    image_data: str                    # base64 string — data-URI prefix is stripped automatically
    prompt:     Optional[str] = "Identify the location or landmark in this image. Return ONLY the place name and country, e.g. 'Eiffel Tower, Paris, France'."
    mime_type:  str = "image/jpeg"


class ItineraryRequest(BaseModel):
    destination:  str
    num_days:     int = 3
    interests:    Optional[List[str]] = None
    budget:       str = "moderate"
    travel_style: str = "balanced"
    start_date:   Optional[str] = None


class RecommendRequest(BaseModel):
    location:    str
    category:    str = "tourist attractions"
    preferences: Optional[List[str]] = None
    radius_km:   int = 10


# ── Helper ────────────────────────────────────────────────────────────────────

def _raise_if_failed(result: dict, label: str) -> None:
    if not result.get("success"):
        raise HTTPException(
            status_code=502,
            detail=f"{label}: {result.get('error', 'Unknown error')}",
        )


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/health", tags=["AI"])
async def ai_health():
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
            "POST /api/ai/recommend-places",
        ],
    }


@router.post("/generate", tags=["AI"])
async def generate(body: GenerateRequest):
    text = (body.prompt or body.message or "").strip()
    if not text:
        raise HTTPException(status_code=422, detail="Provide 'prompt' or 'message'.")
    result = await run_in_threadpool(chat_with_gemini, text, [])
    _raise_if_failed(result, "Text generation")
    return result


@router.post("/chat", tags=["AI"])
async def chat(body: ChatRequest):
    result = await run_in_threadpool(
        chat_with_gemini, body.message, body.history or []
    )
    _raise_if_failed(result, "Chat")
    return result


@router.post("/analyze-image", tags=["AI"])
async def analyse_image_endpoint(body: ImageAnalysisRequest):
    """
    Accepts a base64 image (with or without the data-URI prefix).
    First tries the gemini_service wrapper; if that returns a non-success
    result it falls back to a direct Gemini SDK call so image search
    always works even if the service layer isn't fully wired yet.
    """
    allowed_types = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if body.mime_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image type '{body.mime_type}'. Use: {', '.join(allowed_types)}",
        )

    # Strip data-URI prefix if the frontend sent one (e.g. "data:image/jpeg;base64,...")
    raw_b64 = body.image_data
    if "," in raw_b64:
        raw_b64 = raw_b64.split(",", 1)[1]

    # Validate base64
    try:
        image_bytes = base64.b64decode(raw_b64)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 image data.")

    # ── Try gemini_service wrapper first ─────────────────────────────────
    try:
        result = await run_in_threadpool(
            gemini_analyze_image, raw_b64, body.prompt, body.mime_type
        )
        if result.get("success"):
            return result
    except Exception:
        pass  # fall through to direct SDK call

    # ── Direct Gemini Vision call (fallback) ─────────────────────────────
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content([
            {"mime_type": body.mime_type, "data": image_bytes},
            body.prompt or "Identify the location or landmark in this image.",
        ])
        text = (response.text or "").strip()
        if not text:
            raise HTTPException(status_code=500, detail="AI returned an empty response.")
        return {"success": True, "response": text}

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Image analysis failed: {exc}")


@router.post("/itinerary", tags=["AI"])
async def itinerary(body: ItineraryRequest):
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
@router.post("/recommend-places", tags=["AI"], include_in_schema=False)
async def recommend(body: RecommendRequest):
    result = await run_in_threadpool(
        recommend_places,
        body.location,
        body.category,
        body.preferences,
        body.radius_km,
    )
    _raise_if_failed(result, "Place recommendations")
    return result