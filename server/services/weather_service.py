from typing import Optional, Dict, Any, List

import httpx

# Use the project's settings to ensure .env (env_file) is loaded consistently
from core.config import settings

OPENWEATHER_API_KEY = getattr(settings, "OPENWEATHER_API_KEY", None)


class OpenWeatherError(Exception):
	pass


async def get_current_weather(lat: float, lon: float, units: str = "metric") -> Dict[str, Any]:
	"""Return current weather from OpenWeatherMap for the given coordinates.

	Args:
		lat: latitude
		lon: longitude
		units: metric|imperial|standard

	Returns:
		Parsed JSON response from OpenWeatherMap.

	Raises:
		OpenWeatherError on network or API failures.
	"""
	if not OPENWEATHER_API_KEY:
		raise OpenWeatherError("OPENWEATHER_API_KEY not set in environment")

	url = "https://api.openweathermap.org/data/2.5/weather"
	params = {"lat": lat, "lon": lon, "appid": OPENWEATHER_API_KEY, "units": units}

	async with httpx.AsyncClient(timeout=10.0) as client:
		resp = await client.get(url, params=params)
		try:
			resp.raise_for_status()
		except httpx.HTTPStatusError as exc:
			raise OpenWeatherError(f"OpenWeather API error: {exc.response.status_code}") from exc

		return resp.json()


async def get_forecast(lat: float, lon: float, units: str = "metric", exclude: Optional[List[str]] = None) -> Dict[str, Any]:
	"""Return OneCall forecast (hourly/daily) for coordinates.

	Args:
		lat, lon: coordinates
		units: metric|imperial|standard
		exclude: optional list of parts to exclude (e.g., ["minutely","alerts"]) to reduce payload

	Returns:
		Parsed JSON response from OpenWeatherMap OneCall API.
	"""
	if not OPENWEATHER_API_KEY:
		raise OpenWeatherError("OPENWEATHER_API_KEY not set in environment")

	url = "https://api.openweathermap.org/data/2.5/onecall"
	params: Dict[str, Any] = {"lat": lat, "lon": lon, "appid": OPENWEATHER_API_KEY, "units": units}
	if exclude:
		params["exclude"] = ",".join(exclude)

	async with httpx.AsyncClient(timeout=10.0) as client:
		resp = await client.get(url, params=params)
		try:
			resp.raise_for_status()
		except httpx.HTTPStatusError as exc:
			raise OpenWeatherError(f"OpenWeather API error: {exc.response.status_code}") from exc

		return resp.json()


def normalize_current(resp: Dict[str, Any]) -> Dict[str, Any]:
	"""Return a small normalized dict with the most useful fields.

	Example output:
	{
	  "temp": 21.3,
	  "feels_like": 20.1,
	  "humidity": 56,
	  "wind_speed": 3.4,
	  "description": "light rain",
	  "icon": "10d",
	}
	"""
	weather = resp.get("weather", [{}])[0]
	main = resp.get("main", {})
	wind = resp.get("wind", {})
	return {
		"temp": main.get("temp"),
		"feels_like": main.get("feels_like"),
		"humidity": main.get("humidity"),
		"pressure": main.get("pressure"),
		"wind_speed": wind.get("speed"),
		"wind_deg": wind.get("deg"),
		"description": weather.get("description"),
		"icon": weather.get("icon"),
		"raw": resp,
	}
