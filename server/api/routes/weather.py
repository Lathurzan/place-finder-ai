from fastapi import APIRouter, Query, HTTPException
from typing import Optional

from services.weather_service import get_current_weather, get_forecast, normalize_current, OpenWeatherError

router = APIRouter()


@router.get("/current")
async def current(lat: float = Query(...), lon: float = Query(...), units: str = "metric"):
    try:
        resp = await get_current_weather(lat, lon, units=units)
        return normalize_current(resp)
    except OpenWeatherError as exc:
        raise HTTPException(status_code=502, detail=str(exc))


@router.get("/forecast")
async def forecast(lat: float = Query(...), lon: float = Query(...), units: str = "metric", exclude: Optional[str] = None):
    try:
        exclude_list = exclude.split(",") if exclude else None
        resp = await get_forecast(lat, lon, units=units, exclude=exclude_list)
        return resp
    except OpenWeatherError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
