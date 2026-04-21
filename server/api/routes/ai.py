from fastapi import APIRouter

router = APIRouter()


@router.get("/", tags=["AI"])
async def read_ai_root():
	return {"status": "ai routes working"}
