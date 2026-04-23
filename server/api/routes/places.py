from fastapi import APIRouter, Query
from services.geocode_service import get_coordinates, search_places

router = APIRouter()

@router.get("/search")
def search_location(q: str = Query(...)):
    result = get_coordinates(q)

    if not result:
        return {"error": "Location not found"}

    return result


@router.get("/search-multiple")
def search_multiple(q: str):
    return search_places(q)
