from fastapi import APIRouter

router = APIRouter()


@router.get("/", tags=["Places"])
async def read_places_root():
	return {"status": "places routes working"}
