from fastapi import APIRouter
from api.routes import auth, places, ai, upload

api_router = APIRouter()

api_router.include_router(auth.router,   prefix="/auth",   tags=["Auth"])
api_router.include_router(places.router, prefix="/places", tags=["Places"])
api_router.include_router(ai.router,     prefix="/ai",     tags=["AI"])
api_router.include_router(upload.router, prefix="/upload", tags=["Upload"])