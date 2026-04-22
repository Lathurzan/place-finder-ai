from datetime import datetime, timedelta
from typing import Optional

from typing import Any, Dict

# Try to use python-jose first, fall back to PyJWT if missing.
try:
    from jose import JWTError, jwt as _jose_jwt  # type: ignore
    _jwt_lib = "jose"
except Exception:
    try:
        import jwt as _pyjwt  # PyJWT
        from jwt import exceptions as _pyjwt_exceptions  # type: ignore

        class JWTError(Exception):
            pass

        _jose_jwt = None
        _jwt_lib = "pyjwt"
    except Exception:
        _jose_jwt = None
        _pyjwt = None
        _jwt_lib = None
try:
    from passlib.context import CryptContext
    _has_passlib = True
except Exception:
    CryptContext = None  # type: ignore
    _has_passlib = False
    import hashlib
    import os
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from core.config import settings

# ── Password hashing ──────────────────────────────────────────
if _has_passlib:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    def hash_password(password: str) -> str:
        return pwd_context.hash(password)

    def verify_password(plain: str, hashed: str) -> bool:
        return pwd_context.verify(plain, hashed)
else:
    # Minimal fallback using PBKDF2-HMAC (not as feature-rich as passlib)
    def _pbkdf2_hash(password: str, salt: bytes | None = None) -> str:
        salt = salt or os.urandom(16)
        dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100_000)
        return salt.hex() + "$" + dk.hex()

    def _pbkdf2_verify(password: str, full_hash: str) -> bool:
        try:
            salt_hex, dk_hex = full_hash.split("$")
            salt = bytes.fromhex(salt_hex)
            expected = bytes.fromhex(dk_hex)
            test = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100_000)
            return test == expected
        except Exception:
            return False

    def hash_password(password: str) -> str:
        # Warning: used only when passlib isn't installed
        return _pbkdf2_hash(password)

    def verify_password(plain: str, hashed: str) -> bool:
        return _pbkdf2_verify(plain, hashed)


# ── JWT ───────────────────────────────────────────────────────
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    if _jwt_lib is None:
        raise RuntimeError("No JWT library available; install 'python-jose' or 'PyJWT'")

    to_encode: Dict[str, Any] = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})

    if _jwt_lib == "jose":
        return _jose_jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    else:
        # PyJWT
        return _pyjwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict:
    if _jwt_lib is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="JWT support is not available on the server. Install 'python-jose' or 'PyJWT'.",
        )

    try:
        if _jwt_lib == "jose":
            return _jose_jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        else:
            # PyJWT: returns dict or raises exceptions
            return _pyjwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except Exception:
        # Normalize all JWT related errors to Unauthorized
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ── Current user dependency — inject into any protected route ─
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.database import get_db

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    payload = decode_access_token(token)
    user_id: int = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    from models.user import User
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user