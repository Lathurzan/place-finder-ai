from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from core.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

from schemas.user import UserRegister, UserLogin, TokenResponse, UserResponse
from models.user import User
from types import SimpleNamespace
from core.security import hash_password, verify_password, create_access_token

router = APIRouter()


@router.post("/register", response_model=TokenResponse, tags=["Auth"])
async def register(user_data: UserRegister, db: AsyncSession = Depends(get_db)):
	# Support both SQLAlchemy AsyncSession and our in-memory DB
	if hasattr(db, "execute"):
		result = await db.execute(select(User).where(User.email == user_data.email))
		existing = result.scalar_one_or_none()
		if existing:
			raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

		user = User(
			name=user_data.name,
			email=user_data.email,
			password_hash=hash_password(user_data.password),
		)
		db.add(user)
		try:
			await db.flush()
			await db.refresh(user)
			# explicitly commit so the user is persisted immediately
			await db.commit()
		except IntegrityError:
			await db.rollback()
			raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not create user")

	else:
		# in-memory DB object with create_user method — use a plain object to
		# avoid instantiating the SQLAlchemy mapped class (which triggers
		# relationship resolution for other mapped classes).
		existing = await db.find_user_by_email(user_data.email)
		if existing:
			raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
		user_obj = SimpleNamespace(
			name=user_data.name,
			email=user_data.email,
			password_hash=hash_password(user_data.password),
		)
		user = await db.create_user(user_obj)

	access_token = create_access_token({"sub": str(user.id)})

	return {
		"access_token": access_token,
		"user": UserResponse.from_orm(user),
	}


@router.post("/login", response_model=TokenResponse, tags=["Auth"])
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
	if hasattr(db, "execute"):
		result = await db.execute(select(User).where(User.email == credentials.email))
		user = result.scalar_one_or_none()
	else:
		user = await db.find_user_by_email(credentials.email)

	if not user or not verify_password(credentials.password, user.password_hash):
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

	access_token = create_access_token({"sub": str(user.id)})
	return {"access_token": access_token, "user": UserResponse.from_orm(user)}
