import requests

BASE_URL = "https://nominatim.openstreetmap.org"

HEADERS = {
    "User-Agent": "place-finder-ai (lathurzan project)"
}

def get_coordinates(query: str):
    """
    Convert place name → lat/lon
    """
    url = f"{BASE_URL}/search"
    params = {
        "q": query,
        "format": "json",
        "limit": 1
    }

    response = requests.get(url, params=params, headers=HEADERS)

    if response.status_code != 200:
        return None

    data = response.json()

    if not data:
        return None

    return {
        "lat": float(data[0]["lat"]),
        "lon": float(data[0]["lon"]),
        "display_name": data[0]["display_name"]
    }


def reverse_geocode(lat: float, lon: float):
    """
    Convert lat/lon → place name
    """
    url = f"{BASE_URL}/reverse"
    params = {
        "lat": lat,
        "lon": lon,
        "format": "json"
    }

    response = requests.get(url, params=params, headers=HEADERS)

    if response.status_code != 200:
        return None

    data = response.json()

    return {
        "display_name": data.get("display_name")
    }


def search_places(query: str):
    """
    Return multiple matching places
    """
    url = f"{BASE_URL}/search"
    params = {
        "q": query,
        "format": "json",
        "limit": 5
    }

    response = requests.get(url, params=params, headers=HEADERS)

    if response.status_code != 200:
        return []

    results = response.json()

    return [
        {
            "name": place["display_name"],
            "lat": float(place["lat"]),
            "lon": float(place["lon"])
        }
        for place in results
    ]
