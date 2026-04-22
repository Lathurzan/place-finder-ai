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
    # In development, allow all origins to avoid CORS preflight failures
    allow_origins=(["*"] if settings.DEBUG else settings.allowed_origins_list),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok", "app": settings.APP_NAME}


if __name__ == "__main__":
    # Allow starting the server with `python main.py` for local development.
    # Prefer using `uvicorn main:app --reload` in production/dev workflows.
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)