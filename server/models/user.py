from sqlalchemy import (
    Column, Integer, String, Boolean,
    DateTime, Text, func
)
from sqlalchemy.orm import relationship
from core.database import Base


class User(Base):
    __tablename__ = "users"

    id             = Column(Integer, primary_key=True, index=True)
    name           = Column(String(100), nullable=False)
    email          = Column(String(150), unique=True, nullable=False, index=True)
    password_hash  = Column(Text, nullable=False)
    avatar_url     = Column(Text, nullable=True)
    preferred_lang = Column(String(10), default="en")
    plan           = Column(String(20), default="starter")
    is_active      = Column(Boolean, default=True)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())
    updated_at     = Column(DateTime(timezone=True), server_default=func.now(),
                            onupdate=func.now())

    # ── Relationships ─────────────────────────────────────────
    bookmarks    = relationship("Bookmark",    back_populates="user",
                                cascade="all, delete-orphan")
    itineraries  = relationship("Itinerary",   back_populates="user",
                                cascade="all, delete-orphan")
    search_logs  = relationship("SearchLog",   back_populates="user",
                                cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User id={self.id} email={self.email}>"