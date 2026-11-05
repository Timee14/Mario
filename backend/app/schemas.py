"""Pydantic schemas for request validation and response serialization."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class UserCreate(BaseModel):
    """Schema for registering a new user."""

    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    """Schema for user login credentials."""

    username: str
    password: str


class UserOut(BaseModel):
    """Schema for serialized user data output."""

    id: int
    username: str
    email: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    """Schema for JWT access token response."""

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for decoded JWT token payload claims."""

    username: Optional[str] = None

