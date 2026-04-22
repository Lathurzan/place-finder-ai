import pytest
import asyncio

import sys
import types

# Provide a lightweight fake `models.user` module so the auth module can
# import `User` without importing SQLAlchemy-mapped models and their
# dependencies. The fake User supports `User.email == value` by using a
# ColumnProxy returning an object with `right.value` so the fake_select
# in tests can extract the email.
if 'models.user' not in sys.modules:
    mod_user = types.ModuleType('models.user')

    class ColumnProxy:
        def __init__(self, name):
            self.name = name

        def __eq__(self, other):
            class Clause:
                def __init__(self, value):
                    self.right = types.SimpleNamespace(value=value)

            return Clause(other)

    class User:
        # class-level column proxies used in expressions
        email = ColumnProxy('email')

        def __init__(self, name=None, email=None, password_hash=None):
            self.id = None
            self.name = name
            self.email = email
            self.password_hash = password_hash

    mod_user.User = User
    sys.modules['models.user'] = mod_user

import api.routes.auth as auth_mod
from datetime import datetime
from schemas.user import UserRegister, UserLogin

class FakeResult:
    def __init__(self, user):
        self._user = user

    def scalar_one_or_none(self):
        return self._user


class FakeSession:
    def __init__(self):
        self.users = {}
        self._pending = None
        self._next_id = 1

    async def execute(self, query):
        # our fake select builds a query object with attribute `_email`
        email = getattr(query, "_email", None)
        return FakeResult(self.users.get(email))

    def add(self, user):
        self._pending = user

    async def flush(self):
        u = self._pending
        # assign a faux id and persist
        u.id = self._next_id
        self._next_id += 1
        # ensure attributes expected by UserResponse
        if not hasattr(u, 'plan'):
            u.plan = 'starter'
        if not hasattr(u, 'avatar_url'):
            u.avatar_url = None
        if not hasattr(u, 'preferred_lang'):
            u.preferred_lang = 'en'
        if not hasattr(u, 'created_at'):
            u.created_at = datetime.utcnow()

        self.users[u.email] = u

    async def refresh(self, user):
        return

    async def commit(self):
        return

    async def rollback(self):
        return


def fake_select(model):
    # returns a tiny object whose `.where(...)` captures the bound parameter's value
    class Q:
        def __init__(self, model):
            self.model = model
            self._email = None

        def where(self, clause):
            try:
                value = clause.right.value
            except Exception:
                value = None
            q = Q(self.model)
            q._email = value
            return q

    return Q(model)


def test_register_and_login(monkeypatch):
    async def run():
        session = FakeSession()

        # monkeypatch the select builder used in the auth module
        monkeypatch.setattr(auth_mod, "select", fake_select)
        # monkeypatch token creation so tests don't depend on JWT lib
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
