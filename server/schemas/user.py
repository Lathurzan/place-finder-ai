from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class UserRegister(BaseModel):
    name:     str       = Field(..., min_length=2, max_length=100)
    email:    EmailStr
    password: str       = Field(..., min_length=6)


class UserLogin(BaseModel):
    email:    EmailStr
    password: str



class UserResponse(BaseModel):
    id:             int
    name:           str
    email:          str
    plan:           str
    avatar_url:     Optional[str]
    preferred_lang: str
    created_at:     datetime
    email_verified: Optional[bool] = False

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user:         UserResponse