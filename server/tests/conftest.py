"""
conftest.py
Shared pytest fixtures for the entire test suite.
"""
import sys
import types
import pytest
import asyncio
from datetime import datetime


# ── Lightweight stub for models.user ─────────────────────────────────────────
# Avoids pulling in SQLAlchemy mapped models and their heavy dependencies.
def _install_user_stub():
    if "models.user" in sys.modules:
        return

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
            self.plan = "starter"
            self.avatar_url = None
            self.preferred_lang = "en"
            self.created_at = datetime.utcnow()

    mod_user.User = User
    sys.modules["models.user"] = mod_user


_install_user_stub()


# ── In-memory async "database" session ───────────────────────────────────────
class FakeResult:
    def __init__(self, user):
        self._user = user

    def scalar_one_or_none(self):
        return self._user


class FakeSession:
    """Mimics enough of AsyncSession for auth routes."""

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
    """Tiny select builder that captures the bound email value in .where()."""
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


@pytest.fixture
def db_session():
    return FakeSession()
