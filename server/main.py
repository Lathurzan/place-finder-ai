from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from core.config import settings
from core.database import check_db_connection
from api.api import api_router
from api.routes import itineraries


@asynccontextmanager
async def lifespan(app: FastAPI):
    await check_db_connection()
    print(f"{settings.APP_NAME} started")
    yield
    print(" Server shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    debug=settings.DEBUG,
    lifespan=lifespan,
)

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

# In debug/dev mode allow the Vite dev server origin(s); in very early
# development we can allow all origins to avoid CORS friction. Be stricter
# in production by limiting this list.
# Always use an explicit origins list when allow_credentials=True. Using
# '*' together with allow_credentials=True causes browsers to reject the
# CORS response during preflight. For development include common Vite
# origins; in production keep a narrow list.
dev_origins = origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=dev_origins if settings.DEBUG else origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

# Mount itineraries at the root as well to be tolerant of clients requesting
# `/itineraries` (some frontend code or external integrations may omit the
# `/api` prefix). This is intentionally permissive for now.
app.include_router(itineraries.router, prefix="")


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok", "app": settings.APP_NAME}


if __name__ == "__main__":
    # Allow starting the server with `python main.py` for local development.
    # Prefer using `uvicorn main:app --reload` in production/dev workflows.
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)