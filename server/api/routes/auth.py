
import random
import asyncio
from services.email_service import send_verification_email

# In-memory cache for pending verifications (for demo; use Redis in production)
pending_verifications = {}



from fastapi import APIRouter, Depends, HTTPException, status, Body
from core.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from schemas.user import UserRegister, UserLogin, TokenResponse, UserResponse
from models.user import User
from core.security import hash_password, verify_password, create_access_token
from core.security import get_current_user
from pydantic import BaseModel

router = APIRouter()


class ChangePassword(BaseModel):
	current_password: str
	new_password: str


@router.post("/change-password", tags=["Auth"])
async def change_password(
	body: ChangePassword,
	db: AsyncSession = Depends(get_db),
	current_user: User = Depends(get_current_user),
):
	# Verify current password
	if not verify_password(body.current_password, current_user.password_hash):
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Current password is incorrect")

	# Validate new password minimally (length >= 6)
	if not body.new_password or len(body.new_password) < 6:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password must be at least 6 characters long")

	# Update password hash
	try:
		current_user.password_hash = hash_password(body.new_password)
		db.add(current_user)
		await db.commit()
		return {"message": "Password updated"}
	except Exception as e:
		await db.rollback()
		raise HTTPException(status_code=500, detail=str(e))

@router.post("/register", tags=["Auth"])
async def register(user_data: UserRegister):
	code = str(random.randint(100000, 999999))
	try:
		loop = asyncio.get_event_loop()
		await loop.run_in_executor(None, send_verification_email, user_data.email, code)
	except Exception as e:
		print(f"[Register] Email send failed for {user_data.email}: {e}")
		raise HTTPException(status_code=500, detail=f"Failed to send verification email: {e}")
	pending_verifications[user_data.email] = {
		"code": code,
		"user": {
			"name": user_data.name,
			"email": user_data.email,
			"password_hash": hash_password(user_data.password),
		}
	}
	return {"email": user_data.email}
from fastapi import Body

@router.post("/verify-email", tags=["Auth"])
async def verify_email(email: str = Body(...), code: str = Body(...), db: AsyncSession = Depends(get_db)):
	if email not in pending_verifications:
		raise HTTPException(status_code=404, detail="No pending verification for this email")
	pending = pending_verifications[email]
	if pending["code"] != code:
		raise HTTPException(status_code=400, detail="Invalid verification code")
	user_data = pending["user"]
	user = User(
		name=user_data["name"],
		email=user_data["email"],
		password_hash=user_data["password_hash"],
		email_verified=True,
		verification_code=None,
	)
	db.add(user)
	await db.commit()
	await db.refresh(user)
	del pending_verifications[email]
	return {"message": "Email verified"}




@router.post("/login", response_model=TokenResponse, tags=["Auth"])
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
	result = await db.execute(select(User).where(User.email == credentials.email))
	user = result.scalar_one_or_none()
	if not user or not verify_password(credentials.password, user.password_hash):
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
	if not getattr(user, "email_verified", False):
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email not verified")
	access_token = create_access_token({"sub": str(user.id)})
	return {"access_token": access_token, "user": UserResponse.from_orm(user)}
