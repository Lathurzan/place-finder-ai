"""
api/routes/upload.py
Image upload endpoints — accepts multipart file upload, validates,
optionally resizes, then runs Gemini vision analysis.
"""

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from starlette.concurrency import run_in_threadpool
from typing import Optional

from services.image_service import (
    ImageServiceError,
    analyse_uploaded_image,
    get_image_metadata,
    validate_image_file,
)

router = APIRouter()


@router.get("/health", tags=["Upload"])
async def upload_health():
    return {"status": "ok", "service": "Upload"}


@router.post("/analyse", tags=["Upload"])
async def analyse_image(
    file: UploadFile = File(..., description="Image file to analyse (JPEG, PNG, WEBP, etc.)"),
    prompt: Optional[str] = Form(None, description="Custom prompt for the AI (optional)"),
    resize: bool = Form(True, description="Resize image before sending to AI (default: true)"),
):
    """
    Upload an image file and get an AI-powered place / location analysis.

    - **file**: image to upload (max 10 MB by default)
    - **prompt**: optional custom instruction for Gemini
    - **resize**: set false to send the original image unchanged

    Returns the Gemini analysis plus metadata about the uploaded image.
    """
    data = await file.read()

    try:
        result = await run_in_threadpool(
            analyse_uploaded_image,
            data,
            file.filename or "",
            prompt,
            resize,
        )
    except ImageServiceError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Analysis failed: {exc}")

    return result


@router.post("/metadata", tags=["Upload"])
async def image_metadata(
    file: UploadFile = File(..., description="Image file"),
):
    """
    Return basic metadata (dimensions, format, size) for an uploaded image
    without calling the AI — useful for client-side pre-flight checks.
    """
    data = await file.read()

    try:
        validate_image_file(data, file.filename or "")
        meta = await run_in_threadpool(get_image_metadata, data)
    except ImageServiceError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return {"filename": file.filename, **meta}
