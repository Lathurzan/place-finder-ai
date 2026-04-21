from sqlalchemy import (
    Column, Integer, String, Text, Numeric,
    Boolean, DateTime, func, CheckConstraint
)
from sqlalchemy.orm import relationship
from geoalchemy2 import Geography
from core.database import Base


class Place(Base):
    __tablename__ = "places"

    id           = Column(Integer, primary_key=True, index=True)
    name         = Column(String(200), nullable=False)
    description  = Column(Text, nullable=True)
    category     = Column(String(100), nullable=True)

    # PostGIS geography point — stores lat/lng
    location     = Column(
        Geography(geometry_type="POINT", srid=4326),
        nullable=False
    )

    address      = Column(Text, nullable=True)
    city         = Column(String(100), nullable=True)
    country      = Column(String(100), nullable=True)
    country_code = Column(String(2),   nullable=True)

    rating       = Column(Numeric(2, 1), default=0.0)
    review_count = Column(Integer, default=0)
    view_count   = Column(Integer, default=0)

    best_season  = Column(String(100), nullable=True)
    image_url    = Column(Text, nullable=True)
    is_verified  = Column(Boolean, default=False)

    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    updated_at   = Column(DateTime(timezone=True), server_default=func.now(),
                          onupdate=func.now())

    # ── Constraints ───────────────────────────────────────────
    __table_args__ = (
        CheckConstraint("rating >= 0 AND rating <= 5", name="ck_rating_range"),
        CheckConstraint(
            "category IN ('beach','city','nature','historical',"
            "'mountain','safari','cultural','other')",
            name="ck_category_valid"
        ),
    )

    # ── Relationships ─────────────────────────────────────────
    bookmarks    = relationship("Bookmark",    back_populates="place",
                                cascade="all, delete-orphan")
    place_images = relationship("PlaceImage",  back_populates="place",
                                cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Place id={self.id} name={self.name}>"