from sqlalchemy import (
    Column, Integer, Text, String,
    Boolean, DateTime, ForeignKey,
    func, UniqueConstraint
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from core.database import Base


# ── Bookmark ──────────────────────────────────────────────────
class Bookmark(Base):
    __tablename__ = "bookmarks"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id",  ondelete="CASCADE"),
                        nullable=False)
    place_id   = Column(Integer, ForeignKey("places.id", ondelete="CASCADE"),
                        nullable=False)
    note       = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "place_id", name="uq_user_place"),
    )

    user  = relationship("User",  back_populates="bookmarks")
    place = relationship("Place", back_populates="bookmarks")


# ── Itinerary ─────────────────────────────────────────────────
class Itinerary(Base):
    __tablename__ = "itineraries"

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id",   ondelete="CASCADE"),
                           nullable=False)
    place_id      = Column(Integer, ForeignKey("places.id",  ondelete="SET NULL"),
                           nullable=True)
    title         = Column(String(200), nullable=False)
    destination   = Column(String(100), nullable=True)
    country       = Column(String(100), nullable=True)
    duration_days = Column(Integer, nullable=False)
    day_plan      = Column(JSONB, default=list)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), server_default=func.now(),
                           onupdate=func.now())

    user = relationship("User", back_populates="itineraries")


# ── Search log ────────────────────────────────────────────────
class SearchLog(Base):
    __tablename__ = "search_logs"

    id                = Column(Integer, primary_key=True, index=True)
    user_id           = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"),
                               nullable=True)
    query             = Column(Text, nullable=False)
    search_type       = Column(String(20), default="text")
    result_count      = Column(Integer, default=0)
    resolved_place_id = Column(Integer, ForeignKey("places.id", ondelete="SET NULL"),
                                nullable=True)
    ai_summary        = Column(Text, nullable=True)
    created_at        = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="search_logs")


# ── Place image ───────────────────────────────────────────────
class PlaceImage(Base):
    __tablename__ = "place_images"

    id          = Column(Integer, primary_key=True, index=True)
    place_id    = Column(Integer, ForeignKey("places.id", ondelete="CASCADE"),
                         nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.id",  ondelete="SET NULL"),
                         nullable=True)
    url         = Column(Text, nullable=False)
    source      = Column(String(50), default="upload")
    is_primary  = Column(Boolean, default=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    place = relationship("Place", back_populates="place_images")