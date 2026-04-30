"""
tests/test_security.py
Unit tests for core/security.py — password hashing and JWT helpers.
Run:  pytest tests/test_security.py -v
"""
import pytest
from core.security import hash_password, verify_password, create_access_token


#  Password hashing 

class TestHashPassword:
    def test_returns_bcrypt_prefix(self):
        h = hash_password("mypassword")
        assert h.startswith("$2b$"), "Expected bcrypt $2b$ hash"

    def test_different_salts_each_call(self):
        h1 = hash_password("same")
        h2 = hash_password("same")
        assert h1 != h2, "Each call should produce a unique salt"

    def test_hash_is_string(self):
        h = hash_password("test")
        assert isinstance(h, str)

    def test_long_password(self):
        # bcrypt truncates at 72 bytes — should NOT raise after our [:72] fix
        long_pw = "a" * 100
        h = hash_password(long_pw)
        assert h.startswith("$2b$")
        # Verify also truncates consistently, so round-trip works
        assert verify_password(long_pw, h) is True


class TestVerifyPassword:
    def test_correct_password_returns_true(self):
        h = hash_password("correct")
        assert verify_password("correct", h) is True

    def test_wrong_password_returns_false(self):
        h = hash_password("correct")
        assert verify_password("wrong", h) is False

    def test_empty_plain_returns_false(self):
        h = hash_password("something")
        assert verify_password("", h) is False

    def test_empty_hash_returns_false(self):
        assert verify_password("anything", "") is False

    def test_corrupted_hash_returns_false(self):
        # Should not raise — just return False
        assert verify_password("pass", "not-a-valid-hash") is False

    def test_case_sensitive(self):
        h = hash_password("Password")
        assert verify_password("password", h) is False
        assert verify_password("Password", h) is True


# ── JWT ───────────────────────────────────────────────────────────────────────

class TestCreateAccessToken:
    def test_returns_string(self):
        token = create_access_token({"sub": "42"})
        assert isinstance(token, str)
        assert len(token) > 20

    def test_token_has_three_parts(self):
        """JWT format is header.payload.signature"""
        token = create_access_token({"sub": "1"})
        assert token.count(".") == 2

    def test_different_payloads_produce_different_tokens(self):
        t1 = create_access_token({"sub": "1"})
        t2 = create_access_token({"sub": "2"})
        assert t1 != t2
