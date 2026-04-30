"""
tests/test_auth.py
Unit tests for api/routes/auth.py  (register + login).
Uses FakeSession — no real database required.
Run:  pytest tests/test_auth.py -v
"""
import pytest
import asyncio
import sys
import types
from datetime import datetime

#  Stub models.user before any server import
if "models.user" not in sys.modules:
    mod_user = types.ModuleType("models.user")

    class ColumnProxy:
        def __init__(self, name):
            self.name = name

        def __eq__(self, other):
            class Clause:
                def __init__(self, value):
                    self.right = types.SimpleNamespace(value=value)
            return Clause(other)

    class User:
        email = ColumnProxy("email")

        def __init__(self, name=None, email=None, password_hash=None):
            self.id = None
            self.name = name
            self.email = email
            self.password_hash = password_hash

    mod_user.User = User
    sys.modules["models.user"] = mod_user

import api.routes.auth as auth_mod
from schemas.user import UserRegister, UserLogin


# ── Helpers ───────────────────────────────────────────────────────────────────

class FakeResult:
    def __init__(self, user):
        self._user = user

    def scalar_one_or_none(self):
        return self._user


class FakeSession:
    def __init__(self):
        self.users: dict = {}
        self._pending = None
        self._next_id = 1

    async def execute(self, query):
        email = getattr(query, "_email", None)
        return FakeResult(self.users.get(email))

    def add(self, user):
        self._pending = user

    async def flush(self):
        u = self._pending
        u.id = self._next_id
        self._next_id += 1
        if not hasattr(u, "plan"):
            u.plan = "starter"
        if not hasattr(u, "avatar_url"):
            u.avatar_url = None
        if not hasattr(u, "preferred_lang"):
            u.preferred_lang = "en"
        if not hasattr(u, "created_at"):
            u.created_at = datetime.utcnow()
        self.users[u.email] = u

    async def refresh(self, user):
        return

    async def commit(self):
        return

    async def rollback(self):
        return


def fake_select(model):
    class Q:
        def __init__(self):
            self._email = None

        def where(self, clause):
            q = Q()
            try:
                q._email = clause.right.value
            except Exception:
                pass
            return q

    return Q()


# ── Tests ─────────────────────────────────────────────────────────────────────

def test_register_returns_token(monkeypatch):
    """Successful registration returns an access_token and correct user data."""
    async def run():
        session = FakeSession()
        monkeypatch.setattr(auth_mod, "select", fake_select)
        monkeypatch.setattr(auth_mod, "create_access_token", lambda data: "testtoken")

        user_data = UserRegister(name="Alice", email="alice@example.com", password="secret123")
        resp = await auth_mod.register(user_data, db=session)

        assert resp["access_token"] == "testtoken"
        assert resp["user"].email == "alice@example.com"
        assert resp["user"].name == "Alice"

    asyncio.run(run())


def test_register_and_login(monkeypatch):
    """Register then login with the same credentials should both succeed."""
    async def run():
        session = FakeSession()
        monkeypatch.setattr(auth_mod, "select", fake_select)
        monkeypatch.setattr(auth_mod, "create_access_token", lambda data: "testtoken")

        user_data = UserRegister(name="Alice", email="alice@example.com", password="secret123")
        resp = await auth_mod.register(user_data, db=session)
        assert resp["access_token"] == "testtoken"
        assert resp["user"].email == "alice@example.com"

        creds = UserLogin(email="alice@example.com", password="secret123")
        resp2 = await auth_mod.login(creds, db=session)
        assert resp2["access_token"] == "testtoken"
        assert resp2["user"].email == "alice@example.com"

    asyncio.run(run())


def test_register_duplicate_email_raises_400(monkeypatch):
    """Registering the same email twice must return HTTP 400."""
    from fastapi import HTTPException

    async def run():
        session = FakeSession()
        monkeypatch.setattr(auth_mod, "select", fake_select)
        monkeypatch.setattr(auth_mod, "create_access_token", lambda data: "tok")

        user_data = UserRegister(name="Bob", email="bob@example.com", password="pass1234")
        await auth_mod.register(user_data, db=session)

        with pytest.raises(HTTPException) as exc_info:
            await auth_mod.register(user_data, db=session)

        assert exc_info.value.status_code == 400

    asyncio.run(run())


def test_login_wrong_password_raises_401(monkeypatch):
    """Login with wrong password must return HTTP 401."""
    from fastapi import HTTPException

    async def run():
        session = FakeSession()
        monkeypatch.setattr(auth_mod, "select", fake_select)
        monkeypatch.setattr(auth_mod, "create_access_token", lambda data: "tok")

        await auth_mod.register(
            UserRegister(name="Dave", email="dave@example.com", password="correct_pass"),
            db=session,
        )

        with pytest.raises(HTTPException) as exc_info:
            await auth_mod.login(
                UserLogin(email="dave@example.com", password="wrong_pass"),
                db=session,
            )

        assert exc_info.value.status_code == 401

    asyncio.run(run())


def test_login_unknown_email_raises_401(monkeypatch):
    """Login with an unregistered email must return HTTP 401."""
    from fastapi import HTTPException

    async def run():
        session = FakeSession()
        monkeypatch.setattr(auth_mod, "select", fake_select)
        monkeypatch.setattr(auth_mod, "create_access_token", lambda data: "tok")

        with pytest.raises(HTTPException) as exc_info:
            await auth_mod.login(
                UserLogin(email="ghost@example.com", password="any"),
                db=session,
            )

        assert exc_info.value.status_code == 401

    asyncio.run(run())


def test_register_password_is_hashed(monkeypatch):
    """Stored password_hash must NOT be equal to the plaintext password."""
    async def run():
        session = FakeSession()
        monkeypatch.setattr(auth_mod, "select", fake_select)
        monkeypatch.setattr(auth_mod, "create_access_token", lambda data: "tok")

        await auth_mod.register(
            UserRegister(name="Eve", email="eve@example.com", password="plaintext"),
            db=session,
        )
        stored_user = session.users["eve@example.com"]
        assert stored_user.password_hash != "plaintext"
        assert stored_user.password_hash.startswith("$2b$")

    asyncio.run(run())


def test_register_default_plan_is_starter(monkeypatch):
    """Newly registered users should have plan='starter'."""
    async def run():
        session = FakeSession()
        monkeypatch.setattr(auth_mod, "select", fake_select)
        monkeypatch.setattr(auth_mod, "create_access_token", lambda data: "tok")

        resp = await auth_mod.register(
            UserRegister(name="Frank", email="frank@example.com", password="abc123"),
            db=session,
        )
        assert resp["user"].plan == "starter"

    asyncio.run(run())
