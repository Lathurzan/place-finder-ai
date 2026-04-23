from fastapi import APIRouter, Query, HTTPException
from typing import Optional

from services.weather_service import (
    get_current_weather,
    get_forecast,
    normalize_current,
    OpenWeatherError,
    get_current_weather_by_city,
    get_forecast_by_city,
)

router = APIRouter()


@router.get("/current")
async def current(
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
    city: Optional[str] = Query(None),
    units: str = "metric",
):
    try:
        if city:
            resp = await get_current_weather_by_city(city, units=units)
        else:
            if lat is None or lon is None:
                raise HTTPException(status_code=400, detail="Provide either city or lat and lon")
            resp = await get_current_weather(lat, lon, units=units)
        return normalize_current(resp)
    except OpenWeatherError as exc:
        raise HTTPException(status_code=502, detail=str(exc))


@router.get("/forecast")
async def forecast(
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
    city: Optional[str] = Query(None),
    units: str = "metric",
    exclude: Optional[str] = None,
):
    try:
        exclude_list = exclude.split(",") if exclude else None
        if city:
            resp = await get_forecast_by_city(city, units=units, exclude=exclude_list)
        else:
            if lat is None or lon is None:
                raise HTTPException(status_code=400, detail="Provide either city or lat and lon")
            resp = await get_forecast(lat, lon, units=units, exclude=exclude_list)
        return resp
    except OpenWeatherError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
