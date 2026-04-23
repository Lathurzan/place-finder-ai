"""
services/gemini_service.py
Gemini AI Service — handles:
  - General text chat  (chat_with_gemini)
  - Image-based analysis  (analyze_image)
  - Day-by-day itinerary  (generate_itinerary)
  - Place recommendations  (recommend_places)

Migrated from the deprecated `google.generativeai` to `google.genai` (v1+).
"""

from __future__ import annotations

import base64
import io
import json
import logging
import os
import re

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# ── Configure Gemini SDK (google-genai v1+) ───────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise EnvironmentError("GEMINI_API_KEY is not set in .env")

from google import genai                          # noqa: E402
from google.genai import types as genai_types     # noqa: E402

_client = genai.Client(api_key=GEMINI_API_KEY)

# ── Active model name ─────────────────────────────────────────────────────────
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")


# ── Generation configs ────────────────────────────────────────────────────────
_TEXT_CONFIG = genai_types.GenerateContentConfig(
    temperature=0.7,
    top_p=0.95,
    top_k=40,
    max_output_tokens=4096,
)

_VISION_CONFIG = genai_types.GenerateContentConfig(
    temperature=0.5,
    top_p=0.95,
    max_output_tokens=2048,
)


# ── Internal helpers ──────────────────────────────────────────────────────────
def _safe_usage(response) -> dict:
    """Return token counts; returns empty dict if metadata unavailable."""
    try:
        m = response.usage_metadata
        return {
            "prompt_tokens":   m.prompt_token_count,
            "response_tokens": m.candidates_token_count,
            "total_tokens":    m.total_token_count,
        }
    except Exception:
        return {}


def _strip_fences(text: str) -> str:
    """Remove ```json … ``` fences the model sometimes adds despite instructions."""
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$",          "", text)
    return text.strip()


def _normalise_history(history: list) -> list:
    """
    Accept history entries where 'parts' is either a list or a bare string.
    Silently drops malformed entries.
    Returns google.genai Content objects.
    """
    out = []
    for entry in history:
        role  = entry.get("role", "")
        parts = entry.get("parts", [])
        if isinstance(parts, str):
            parts = [parts]
        if role in ("user", "model") and parts:
            out.append(
                genai_types.Content(
                    role=role,
                    parts=[genai_types.Part(text=p) for p in parts],
                )
            )
    return out


# ── 1. General Chat ───────────────────────────────────────────────────────────
def chat_with_gemini(
    user_message: str,
    chat_history: list | None = None,
) -> dict:
    """
    Single- or multi-turn chat with Gemini.

    chat_history format:
        [{"role": "user",  "parts": ["Hello"]},
         {"role": "model", "parts": ["Hi, how can I help?"]}]
    """
    try:
        if not user_message or not user_message.strip():
            return {"success": False, "error": "'message' must not be empty."}

        history = _normalise_history(chat_history or [])

        chat = _client.chats.create(
            model=GEMINI_MODEL,
            config=_TEXT_CONFIG,
            history=history,
        )
        response = chat.send_message(user_message.strip())

        return {
            "success":  True,
            "response": response.text,
            "model":    GEMINI_MODEL,
            "usage":    _safe_usage(response),
        }

    except Exception as exc:
        logger.error("chat_with_gemini error: %s", exc)
        return {"success": False, "error": str(exc)}


# ── 2. Image Analysis ─────────────────────────────────────────────────────────
def analyze_image(
    image_data: str,
    prompt:     str | None = None,
    mime_type:  str        = "image/jpeg",
) -> dict:
    """
    Analyse a base64-encoded image (with or without data-URI prefix).
    Supported mime types: image/jpeg, image/png, image/webp, image/gif
    """
    try:
        # Strip data-URI prefix and infer mime_type from header when present
        if "," in image_data:
            header, image_data = image_data.split(",", 1)
            m = re.search(r"data:([^;]+);base64", header)
            if m:
                mime_type = m.group(1)

        image_bytes = base64.b64decode(image_data, validate=True)

        # Read image metadata (PIL)
        from PIL import Image as PILImage
        img        = PILImage.open(io.BytesIO(image_bytes))
        img_format = img.format
        img_size   = {"width": img.width, "height": img.height}
        img.close()

        default_prompt = (
            "Analyse this image for a place-finder application. "
            "Identify: (1) type of place or landmark, (2) location clues, "
            "(3) notable features, (4) best activities or visit tips, "
            "(5) accessibility notes. Be concise and structured."
        )

        image_part = genai_types.Part.from_bytes(
            data=image_bytes,
            mime_type=mime_type,
        )

        response = _client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[prompt or default_prompt, image_part],
            config=_VISION_CONFIG,
        )

        return {
            "success":      True,
            "analysis":     response.text,
            "image_format": img_format,
            "image_size":   img_size,
            "model":        GEMINI_MODEL,
        }

    except base64.binascii.Error:
        return {"success": False, "error": "Invalid base64 image data."}
    except Exception as exc:
        logger.error("analyze_image error: %s", exc)
        return {"success": False, "error": str(exc)}


# ── 3. Itinerary Generator ────────────────────────────────────────────────────
def generate_itinerary(
    destination:  str,
    num_days:     int,
    interests:    list | None = None,
    budget:       str         = "moderate",
    travel_style: str         = "balanced",
    start_date:   str | None  = None,
) -> dict:
    """Generate a detailed day-by-day travel itinerary as structured JSON."""
    raw = ""
    try:
        num_days = int(num_days)
        if not 1 <= num_days <= 30:
            return {"success": False, "error": "num_days must be between 1 and 30."}

        interests_str = (
            ", ".join(interests) if interests
            else "general sightseeing, local food, culture"
        )
        date_line  = f"Start date  : {start_date}" if start_date else ""
        day1_label = f"Day 1 - {start_date}"       if start_date else "Day 1"

        prompt = f"""
You are an expert travel planner for a place-finder app.
Create a detailed day-by-day itinerary for:

Destination : {destination}
Duration    : {num_days} day(s)
Budget      : {budget}
Travel style: {travel_style}
Interests   : {interests_str}
{date_line}

IMPORTANT: Return ONLY raw valid JSON. No markdown fences, no preamble, no explanation.
Repeat the "day" object for each of the {num_days} days.

{{
  "destination": "{destination}",
  "total_days": {num_days},
  "budget_level": "{budget}",
  "travel_style": "{travel_style}",
  "overview": "2-3 sentence trip summary",
  "best_time_to_visit": "...",
  "estimated_daily_budget": {{
    "accommodation": "price range",
    "food": "price range",
    "activities": "price range",
    "transport": "price range"
  }},
  "days": [
    {{
      "day": 1,
      "date": "{day1_label}",
      "theme": "Arrival & City Centre",
      "morning": {{
        "time": "08:00 - 12:00",
        "activities": ["activity 1"],
        "places": ["place name - brief description"],
        "tips": "practical tip"
      }},
      "afternoon": {{
        "time": "12:00 - 18:00",
        "activities": ["activity 1"],
        "places": ["place name - brief description"],
        "lunch_recommendation": "restaurant or food spot",
        "tips": "practical tip"
      }},
      "evening": {{
        "time": "18:00 - 22:00",
        "activities": ["activity 1"],
        "places": ["place name"],
        "dinner_recommendation": "restaurant or food spot",
        "tips": "practical tip"
      }},
      "accommodation_suggestion": "hotel/hostel type and area",
      "transport_for_day": "how to get around"
    }}
  ],
  "packing_tips": ["tip 1", "tip 2"],
  "important_notes": ["note 1"],
  "emergency_contacts": {{
    "local_emergency": "112",
    "tourist_helpline": "if available"
  }}
}}
"""

        response  = _client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=_TEXT_CONFIG,
        )
        raw       = _strip_fences(response.text)
        itinerary = json.loads(raw)

        return {
            "success":     True,
            "itinerary":   itinerary,
            "model":       GEMINI_MODEL,
            "tokens_used": _safe_usage(response).get("total_tokens"),
        }

    except json.JSONDecodeError as exc:
        logger.error("Itinerary JSON parse error: %s", exc)
        return {
            "success":      False,
            "error":        f"Failed to parse itinerary JSON: {exc}",
            "raw_response": raw,
        }
    except Exception as exc:
        logger.error("generate_itinerary error: %s", exc)
        return {"success": False, "error": str(exc)}


# ── 4. Place Recommendations ──────────────────────────────────────────────────
def recommend_places(
    location:    str,
    category:    str        = "tourist attractions",
    preferences: list | None = None,
    radius_km:   int        = 10,
) -> dict:
    """Recommend places near a location based on category and preferences."""
    try:
        prefs = ", ".join(preferences) if preferences else "no specific preference"

        prompt = f"""
You are a local travel expert for a place-finder app.
Recommend the top places near: {location}
Category   : {category}
Preferences: {prefs}
Radius     : {radius_km} km

IMPORTANT: Return ONLY raw valid JSON. No markdown fences, no preamble.

{{
  "location": "{location}",
  "category": "{category}",
  "recommendations": [
    {{
      "name": "Place Name",
      "type": "museum / park / restaurant / etc.",
      "description": "2-3 sentences",
      "address": "approximate address",
      "rating": "estimated rating / 5",
      "best_time_to_visit": "morning / evening / etc.",
      "entry_fee": "free / price range",
      "duration": "suggested visit duration",
      "highlights": ["highlight 1", "highlight 2"],
      "tips": "insider tip"
    }}
  ],
  "area_overview": "Brief overview of the area",
  "getting_there": "Transport options"
}}
Provide 5-8 recommendations.
"""

        response = _client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=_TEXT_CONFIG,
        )
        raw  = _strip_fences(response.text)
        data = json.loads(raw)

        return {"success": True, "data": data, "model": GEMINI_MODEL}

    except json.JSONDecodeError as exc:
        logger.error("recommend_places JSON parse error: %s", exc)
        return {"success": False, "error": f"JSON parse error: {exc}"}
    except Exception as exc:
        logger.error("recommend_places error: %s", exc)
        return {"success": False, "error": str(exc)}