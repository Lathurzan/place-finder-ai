from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from core.config import settings
from core.database import check_db_connection
from api.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await check_db_connection()
    print(f"🚀 {settings.APP_NAME} started")
    yield
    print("🛑 Server shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    debug=settings.DEBUG,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,  # ← uses the property
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok", "app": settings.APP_NAME}