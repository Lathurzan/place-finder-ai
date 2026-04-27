from fastapi import APIRouter
from api.routes import auth, places, ai, upload, weather, admin, bookmarks
from api.routes import itineraries
from api.routes import ml_csv
from api.payment import router as payment_router

api_router = APIRouter()

api_router.include_router(auth.router,    prefix="/auth",    tags=["Auth"])
api_router.include_router(places.router,  prefix="/places",  tags=["Places"])
api_router.include_router(ai.router,      prefix="/ai",      tags=["AI"])
api_router.include_router(upload.router,  prefix="/upload",  tags=["Upload"])
api_router.include_router(weather.router, prefix="/weather", tags=["Weather"])
api_router.include_router(payment_router, prefix="/payment", tags=["Payment"])
api_router.include_router(admin.router,   prefix="/admin",   tags=["Admin"])
api_router.include_router(bookmarks.router, prefix="", tags=["Bookmarks"])
api_router.include_router(itineraries.router, prefix="", tags=["Itineraries"])
api_router.include_router(ml_csv.router, prefix="/ml", tags=["ML CSV"])
