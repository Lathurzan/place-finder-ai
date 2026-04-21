from fastapi import APIRouter

router = APIRouter()


@router.get("/", tags=["Upload"])
async def read_upload_root():
	return {"status": "upload routes working"}
