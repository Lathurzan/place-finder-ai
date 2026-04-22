from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
)
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
)
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text
from core.config import settings
from typing import Optional, AsyncGenerator


# ── Async engine (asyncpg driver for PostgreSQL) ──────────────
engine: Optional[object]
try:
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=settings.DEBUG,       # logs every SQL query in terminal
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,        # auto-reconnect if connection drops
    )
except ModuleNotFoundError:
    # Driver not present; keep engine as None and raise clear errors at runtime
    engine = None

# ── Session factory ───────────────────────────────────────────
AsyncSessionLocal: Optional[async_sessionmaker] = None
if engine is not None:
    AsyncSessionLocal = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,    # keep objects usable after commit
        autocommit=False,
        autoflush=False,
    )

# ── Base class all models inherit from ───────────────────────
class Base(DeclarativeBase):
    pass


# ── Dependency — used in every route ─────────────────────────
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    if AsyncSessionLocal is None:
        raise RuntimeError(
            "Async DB session factory not initialized. Install the async DB driver (e.g. asyncpg) and configure DATABASE_URL."
        )

    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# ── Startup check — called from main.py on_startup ───────────
async def check_db_connection():
    if engine is None:
        print("Skipping DB connection check: async DB engine not initialized (driver may be missing).")
        return

    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            # verify PostGIS is active
            await conn.execute(text("SELECT PostGIS_Version()"))
        print("Database connected — PostGIS active")
    except Exception as e:
        print(f"Database connection failed: {e}")
        raise