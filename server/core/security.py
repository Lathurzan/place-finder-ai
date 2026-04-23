from datetime import datetime, timedelta
from typing import Optional, Any, Dict

# ── JWT library (python-jose preferred, PyJWT as fallback) ────
try:
    from jose import JWTError, jwt as _jose_jwt  # type: ignore
    _jwt_lib = "jose"
except Exception:
    try:
        import jwt as _pyjwt  # type: ignore
        class JWTError(Exception):
            pass
        _jose_jwt = None
        _jwt_lib = "pyjwt"
    except Exception:
        _jose_jwt = None
        _pyjwt = None
        _jwt_lib = None

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from core.config import settings

# ── Password hashing — uses bcrypt directly (no passlib) ──────
# passlib 1.7.4 is incompatible with bcrypt 4.x, so we call
# bcrypt directly.  This produces the standard $2b$ hashes that
# are readable by any bcrypt-compatible tool.
import bcrypt as _bcrypt

def hash_password(password: str) -> str:
    """Hash a plaintext password and return a $2b$ bcrypt string.
    Passwords longer than 72 bytes are silently truncated (bcrypt limit).
    """
    return _bcrypt.hashpw(password.encode()[:72], _bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    """Return True if *plain* matches the stored bcrypt *hashed* value."""
    if not plain or not hashed:
        return False
    try:
        return _bcrypt.checkpw(plain.encode()[:72], hashed.encode())
    except Exception:
        # Hash in DB is in an unknown / legacy format — treat as wrong password.
        return False


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