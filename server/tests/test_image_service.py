"""
tests/test_image_service.py
Unit tests for services/image_service.py
Uses real Pillow operations for image creation; mocks Gemini calls.
Run:  pytest tests/test_image_service.py -v
"""
import io
import base64
import pytest
from unittest.mock import patch
from PIL import Image

from services.image_service import (
    ImageServiceError,
    validate_image_file,
    get_image_metadata,
    resize_image,
    bytes_to_base64,
    base64_to_bytes,
    bytes_to_data_uri,
    analyse_uploaded_image,
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _make_jpeg(width=200, height=150) -> bytes:
    img = Image.new("RGB", (width, height), color=(100, 149, 237))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def _make_png(width=100, height=100) -> bytes:
    img = Image.new("RGBA", (width, height), color=(255, 0, 0, 128))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


FAKE_GEMINI_RESULT = {
    "success": True,
    "analysis": "This is a test location.",
    "model": "gemini-2.0-flash",
}


# ── validate_image_file ───────────────────────────────────────────────────────

class TestValidateImageFile:
    def test_valid_jpeg_returns_mime(self):
        mime = validate_image_file(_make_jpeg(), "photo.jpg")
        assert mime in ("image/jpeg", "image/jpg")

    def test_valid_png_returns_mime(self):
        mime = validate_image_file(_make_png(), "photo.png")
        assert mime == "image/png"

    def test_empty_data_raises(self):
        with pytest.raises(ImageServiceError, match="[Ee]mpty|[Nn]o data"):
            validate_image_file(b"", "empty.jpg")

    def test_non_image_data_raises(self):
        with pytest.raises(ImageServiceError):
            validate_image_file(b"this is not an image", "fake.jpg")

    def test_oversized_file_raises(self):
        # patch MAX_FILE_SIZE_BYTES to a tiny value
        with patch("services.image_service.MAX_FILE_SIZE_BYTES", 10):
            with pytest.raises(ImageServiceError, match="[Tt]oo large|[Ss]ize"):
                validate_image_file(_make_jpeg(), "big.jpg")


# ── get_image_metadata ────────────────────────────────────────────────────────

class TestGetImageMetadata:
    def test_jpeg_metadata(self):
        meta = get_image_metadata(_make_jpeg(320, 240))
        assert meta["width"] == 320
        assert meta["height"] == 240
        assert meta["format"] == "JPEG"
        assert meta["size_bytes"] > 0
        assert "size_kb" in meta

    def test_png_metadata(self):
        meta = get_image_metadata(_make_png(64, 64))
        assert meta["width"] == 64
        assert meta["height"] == 64
        assert meta["format"] == "PNG"


# ── resize_image ──────────────────────────────────────────────────────────────

class TestResizeImage:
    def test_large_image_is_resized(self):
        data = _make_jpeg(3000, 2000)
        resized, mime = resize_image(data, max_dimension=512)
        meta = get_image_metadata(resized)
        assert max(meta["width"], meta["height"]) <= 512
        assert mime == "image/jpeg"

    def test_small_image_unchanged_dimensions(self):
        data = _make_jpeg(100, 80)
        resized, mime = resize_image(data, max_dimension=512)
        meta = get_image_metadata(resized)
        # Dimensions should not grow
        assert meta["width"] <= 512
        assert meta["height"] <= 512

    def test_returns_bytes_and_mime(self):
        data = _make_jpeg()
        result = resize_image(data)
        assert isinstance(result, tuple)
        assert len(result) == 2
        assert isinstance(result[0], bytes)
        assert isinstance(result[1], str)


# ── Base64 helpers ────────────────────────────────────────────────────────────

class TestBase64Helpers:
    def test_bytes_to_base64_roundtrip(self):
        original = b"hello world"
        b64 = bytes_to_base64(original)
        assert isinstance(b64, str)
        assert base64_to_bytes(b64) == original

    def test_data_uri_prefix_stripped(self):
        original = b"test data"
        b64 = bytes_to_base64(original)
        data_uri = f"data:image/jpeg;base64,{b64}"
        assert base64_to_bytes(data_uri) == original

    def test_bytes_to_data_uri_format(self):
        data = b"pixels"
        uri = bytes_to_data_uri(data, "image/png")
        assert uri.startswith("data:image/png;base64,")

    def test_base64_encode_is_valid(self):
        data = _make_jpeg()
        b64 = bytes_to_base64(data)
        # Should decode without error
        decoded = base64.b64decode(b64)
        assert len(decoded) == len(data)


# ── analyse_uploaded_image ────────────────────────────────────────────────────

class TestAnalyseUploadedImage:
    def test_success_path(self):
        data = _make_jpeg()
        # image_service does `from services.gemini_service import analyze_image as _gemini_analyse`
        # so we patch the function at its source module
        with patch("services.gemini_service.analyze_image", return_value=FAKE_GEMINI_RESULT):
            result = analyse_uploaded_image(data, "test.jpg", prompt="What is this?")

        assert result["success"] is True

    def test_invalid_image_raises_image_service_error(self):
        with pytest.raises(ImageServiceError):
            analyse_uploaded_image(b"not an image", "bad.jpg")

    def test_custom_prompt_is_forwarded(self):
        data = _make_jpeg()
        with patch("services.gemini_service.analyze_image", return_value=FAKE_GEMINI_RESULT) as mock_ai:
            analyse_uploaded_image(data, "test.jpg", prompt="Custom prompt")
            call_kwargs = mock_ai.call_args[1]
            assert call_kwargs.get("prompt") == "Custom prompt"

    def test_resize_false_skips_resize(self):
        data = _make_jpeg(3000, 2000)
        with patch("services.gemini_service.analyze_image", return_value=FAKE_GEMINI_RESULT):
            with patch("services.image_service.resize_image") as mock_resize:
                mock_resize.return_value = (data, "image/jpeg")
                analyse_uploaded_image(data, "big.jpg", resize=False)
                mock_resize.assert_not_called()
