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


async def geocode_city(city: str) -> Optional[Dict[str, Any]]:
	"""Return the first geocoding result for a city name using OpenWeather geocoding API."""
	if not OPENWEATHER_API_KEY:
		raise OpenWeatherError("OPENWEATHER_API_KEY not set in environment")

	url = "http://api.openweathermap.org/geo/1.0/direct"
	params = {"q": city, "limit": 1, "appid": OPENWEATHER_API_KEY}

	async with httpx.AsyncClient(timeout=10.0) as client:
		resp = await client.get(url, params=params)
		try:
			resp.raise_for_status()
		except httpx.HTTPStatusError as exc:
			raise OpenWeatherError(f"OpenWeather geocoding error: {exc.response.status_code}") from exc

		data = resp.json()
		if not data:
			return None
		return data[0]


async def get_current_weather_by_city(city: str, units: str = "metric") -> Dict[str, Any]:
	"""Get current weather using city name (calls /weather with q=city)."""
	if not OPENWEATHER_API_KEY:
		raise OpenWeatherError("OPENWEATHER_API_KEY not set in environment")

	url = "https://api.openweathermap.org/data/2.5/weather"
	params = {"q": city, "appid": OPENWEATHER_API_KEY, "units": units}

	async with httpx.AsyncClient(timeout=10.0) as client:
		resp = await client.get(url, params=params)
		try:
			resp.raise_for_status()
		except httpx.HTTPStatusError as exc:
			raise OpenWeatherError(f"OpenWeather API error: {exc.response.status_code}") from exc

		return resp.json()


async def get_forecast_by_city(city: str, units: str = "metric", exclude: Optional[List[str]] = None) -> Dict[str, Any]:
	"""Get forecast for a city by first geocoding the city to lat/lon then calling OneCall."""
	geo = await geocode_city(city)
	if not geo:
		raise OpenWeatherError(f"Could not geocode city: {city}")

	lat = geo.get("lat")
	lon = geo.get("lon")
	return await get_forecast(lat, lon, units=units, exclude=exclude)


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
