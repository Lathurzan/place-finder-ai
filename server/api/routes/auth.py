from fastapi import APIRouter

router = APIRouter()


@router.get("/", tags=["Auth"])
async def read_auth_root():
	return {"status": "auth routes working"}
