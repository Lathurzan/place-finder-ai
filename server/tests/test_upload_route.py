"""
tests/test_upload_route.py
Unit tests for api/routes/upload.py
Mocks image_service so no real images or Gemini calls are made.
Run:  pytest tests/test_upload_route.py -v
"""
import io
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from fastapi import FastAPI
from api.routes.upload import router

app = FastAPI()
app.include_router(router, prefix="/upload")
client = TestClient(app)


def _jpeg_bytes() -> bytes:
    """Return minimal valid JPEG bytes for upload tests."""
    from PIL import Image
    img = Image.new("RGB", (50, 50), color=(200, 100, 50))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


FAKE_ANALYSE_RESULT = {
    "success": True,
    "analysis": "A sunny beach.",
    "original": {"width": 50, "height": 50, "format": "JPEG", "size_bytes": 1024, "size_kb": 1.0},
    "processed": {"width": 50, "height": 50, "format": "JPEG", "size_bytes": 512, "size_kb": 0.5},
}

FAKE_META_RESULT = {
    "width": 50, "height": 50, "format": "JPEG",
    "mode": "RGB", "size_bytes": 1024, "size_kb": 1.0,
}


class TestUploadHealth:
    def test_returns_ok(self):
        resp = client.get("/upload/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"


class TestAnalyseEndpoint:
    def test_valid_image_returns_200(self):
        with patch("api.routes.upload.analyse_uploaded_image", return_value=FAKE_ANALYSE_RESULT):
            resp = client.post(
                "/upload/analyse",
                files={"file": ("test.jpg", _jpeg_bytes(), "image/jpeg")},
            )
        assert resp.status_code == 200
        assert resp.json()["success"] is True

    def test_custom_prompt_accepted(self):
        with patch("api.routes.upload.analyse_uploaded_image", return_value=FAKE_ANALYSE_RESULT):
            resp = client.post(
                "/upload/analyse",
                files={"file": ("test.jpg", _jpeg_bytes(), "image/jpeg")},
                data={"prompt": "Where is this?"},
            )
        assert resp.status_code == 200

    def test_image_service_error_returns_400(self):
        from services.image_service import ImageServiceError
        with patch("api.routes.upload.analyse_uploaded_image",
                   side_effect=ImageServiceError("File too large")):
            resp = client.post(
                "/upload/analyse",
                files={"file": ("test.jpg", _jpeg_bytes(), "image/jpeg")},
            )
        assert resp.status_code == 400
        assert "File too large" in resp.json()["detail"]

    def test_generic_exception_returns_502(self):
        with patch("api.routes.upload.analyse_uploaded_image",
                   side_effect=RuntimeError("gemini down")):
            resp = client.post(
                "/upload/analyse",
                files={"file": ("test.jpg", _jpeg_bytes(), "image/jpeg")},
            )
        assert resp.status_code == 502

    def test_missing_file_returns_422(self):
        resp = client.post("/upload/analyse")
        assert resp.status_code == 422


class TestMetadataEndpoint:
    def test_valid_image_returns_metadata(self):
        with patch("api.routes.upload.validate_image_file", return_value="image/jpeg"):
            with patch("api.routes.upload.get_image_metadata", return_value=FAKE_META_RESULT):
                resp = client.post(
                    "/upload/metadata",
                    files={"file": ("test.jpg", _jpeg_bytes(), "image/jpeg")},
                )
        assert resp.status_code == 200
        data = resp.json()
        assert "width" in data
        assert "height" in data
        assert "format" in data

    def test_invalid_image_returns_400(self):
        from services.image_service import ImageServiceError
        with patch("api.routes.upload.validate_image_file",
                   side_effect=ImageServiceError("Not an image")):
            resp = client.post(
                "/upload/metadata",
                files={"file": ("bad.txt", b"not an image", "text/plain")},
            )
        assert resp.status_code == 400

    def test_missing_file_returns_422(self):
        resp = client.post("/upload/metadata")
        assert resp.status_code == 422
