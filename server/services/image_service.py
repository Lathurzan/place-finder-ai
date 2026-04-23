"""
services/image_service.py
Image handling service — covers:
  - Validating uploaded files (type, size)
  - Resizing / compressing images before AI analysis
  - Converting images to base64 for the Gemini vision API
  - Extracting basic image metadata (dimensions, format, size)
  - High-level analyse_uploaded_image() that chains all of the above
    and calls gemini_service.analyze_image()
"""

from __future__ import annotations

import base64
import io
import logging
import os
from typing import Optional

from PIL import Image, UnidentifiedImageError

logger = logging.getLogger(__name__)

# ── Configuration ─────────────────────────────────────────────────────────────
MAX_FILE_SIZE_MB: int = int(os.getenv("IMAGE_MAX_MB", "10"))
MAX_FILE_SIZE_BYTES: int = MAX_FILE_SIZE_MB * 1024 * 1024

# Longest side is scaled down to this before sending to Gemini.
# Gemini vision works well at 1024–2048 px; larger images waste quota.
MAX_DIMENSION_PX: int = int(os.getenv("IMAGE_MAX_DIM", "1536"))

# JPEG quality used when re-encoding (0–95)
JPEG_QUALITY: int = int(os.getenv("IMAGE_JPEG_QUALITY", "85"))

# Allowed MIME types and their PIL format names
ALLOWED_MIME_TYPES: dict[str, str] = {
    "image/jpeg":  "JPEG",
    "image/jpg":   "JPEG",
    "image/png":   "PNG",
    "image/webp":  "WEBP",
    "image/gif":   "GIF",
    "image/bmp":   "BMP",
    "image/tiff":  "TIFF",
}


# ── Exceptions ────────────────────────────────────────────────────────────────
class ImageServiceError(Exception):
    """Raised for recoverable validation / processing errors."""


# ── Validation ────────────────────────────────────────────────────────────────
def validate_image_file(data: bytes, filename: str = "") -> str:
    """
    Validate *data* as an image.

    Returns the detected MIME type string (e.g. ``"image/jpeg"``).
    Raises :class:`ImageServiceError` if the file is invalid or too large.
    """
    if not data:
        raise ImageServiceError("Empty file received.")

    if len(data) > MAX_FILE_SIZE_BYTES:
        raise ImageServiceError(
            f"File is too large ({len(data) / 1024 / 1024:.1f} MB). "
            f"Maximum allowed size is {MAX_FILE_SIZE_MB} MB."
        )

    try:
        img = Image.open(io.BytesIO(data))
        img.verify()  # detects truncated / corrupt files
    except UnidentifiedImageError:
        raise ImageServiceError("File is not a recognised image format.")
    except Exception as exc:
        raise ImageServiceError(f"Image validation failed: {exc}")

    # Re-open after verify() (verify() closes the internal buffer)
    img = Image.open(io.BytesIO(data))
    pil_format = (img.format or "").upper()

    # Map PIL format → MIME type
    format_to_mime = {v: k for k, v in ALLOWED_MIME_TYPES.items()}
    mime = format_to_mime.get(pil_format)
    if mime is None:
        raise ImageServiceError(
            f"Unsupported image format '{pil_format}'. "
            f"Allowed: {', '.join(sorted(set(ALLOWED_MIME_TYPES.values())))}."
        )

    return mime


# ── Metadata extraction ───────────────────────────────────────────────────────
def get_image_metadata(data: bytes) -> dict:
    """
    Return a dict with basic image metadata::

        {
            "width": 1920,
            "height": 1080,
            "format": "JPEG",
            "mode": "RGB",
            "size_bytes": 204800,
            "size_kb": 200.0,
        }
    """
    try:
        img = Image.open(io.BytesIO(data))
        return {
            "width":      img.width,
            "height":     img.height,
            "format":     img.format or "unknown",
            "mode":       img.mode,
            "size_bytes": len(data),
            "size_kb":    round(len(data) / 1024, 1),
        }
    except Exception as exc:
        logger.warning("Could not read image metadata: %s", exc)
        return {"size_bytes": len(data), "size_kb": round(len(data) / 1024, 1)}


# ── Resize / compress ─────────────────────────────────────────────────────────
def resize_image(
    data: bytes,
    max_dimension: int = MAX_DIMENSION_PX,
    quality: int = JPEG_QUALITY,
    output_format: str = "JPEG",
) -> tuple[bytes, str]:
    """
    Resize *data* so neither side exceeds *max_dimension* pixels (aspect ratio
    preserved).  Re-encodes as *output_format* (default JPEG).

    Returns ``(resized_bytes, mime_type)``.
    """
    img = Image.open(io.BytesIO(data))

    # Convert palette / transparency modes for JPEG output
    if output_format == "JPEG" and img.mode not in ("RGB", "L"):
        img = img.convert("RGB")

    w, h = img.size
    if max(w, h) > max_dimension:
        scale = max_dimension / max(w, h)
        new_size = (int(w * scale), int(h * scale))
        img = img.resize(new_size, Image.LANCZOS)
        logger.debug("Resized image from %dx%d to %dx%d", w, h, *new_size)

    buf = io.BytesIO()
    save_kwargs: dict = {"format": output_format}
    if output_format == "JPEG":
        save_kwargs["quality"] = quality
        save_kwargs["optimize"] = True
    img.save(buf, **save_kwargs)

    mime = f"image/{output_format.lower()}"
    return buf.getvalue(), mime


# ── Base64 helpers ────────────────────────────────────────────────────────────
def bytes_to_base64(data: bytes) -> str:
    """Return a plain base64 string (no data-URI prefix)."""
    return base64.b64encode(data).decode()


def base64_to_bytes(b64: str) -> bytes:
    """Accept both plain base64 and ``data:<mime>;base64,<data>`` strings."""
    if "," in b64:
        b64 = b64.split(",", 1)[1]
    return base64.b64decode(b64)


def bytes_to_data_uri(data: bytes, mime_type: str) -> str:
    """Return a data-URI string suitable for use in <img src="...">."""
    return f"data:{mime_type};base64,{bytes_to_base64(data)}"


# ── High-level analyse helper ─────────────────────────────────────────────────
def analyse_uploaded_image(
    data: bytes,
    filename: str = "",
    prompt: Optional[str] = None,
    resize: bool = True,
) -> dict:
    """
    Full pipeline: validate → resize → call Gemini vision → return result.

    This function is intentionally **synchronous** — it is called inside
    ``run_in_threadpool`` from the upload router so it must not be async.

    Parameters
    ----------
    data     : raw image bytes (from an uploaded file)
    filename : original filename (used only for logging)
    prompt   : custom prompt forwarded to Gemini (optional)
    resize   : if True (default), resize before sending to Gemini
    """
    # 1. Validate
    mime_type = validate_image_file(data, filename)
    original_meta = get_image_metadata(data)

    # 2. Optionally resize / compress
    processed = data
    processed_mime = mime_type
    if resize:
        try:
            processed, processed_mime = resize_image(data)
        except Exception as exc:
            logger.warning("Resize failed (%s), using original bytes: %s", filename, exc)

    # 3. Encode to base64 — gemini_service.analyze_image expects a base64 string
    b64 = bytes_to_base64(processed)

    # 4. Call Gemini vision (sync function)
    from services.gemini_service import analyze_image as _gemini_analyse
    result = _gemini_analyse(
        image_data=b64,
        prompt=prompt,
        mime_type=processed_mime,
    )

    # 5. Attach metadata and return
    result["original_metadata"]  = original_meta
    result["processed_metadata"] = get_image_metadata(processed)
    return result
