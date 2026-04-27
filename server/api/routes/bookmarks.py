# api/routes/bookmarks.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from core.database import get_db
from pydantic import BaseModel
from typing import Optional

router = APIRouter()



# Accepts either just place_id or a full place object for OTM places
class PlaceIn(BaseModel):
    id: int
    name: str
    country: str
    city: Optional[str] = None
    category: Optional[str] = None
    rating: Optional[float] = None
    review_count: Optional[int] = None
    cover: Optional[str] = None
    tags: Optional[list[str]] = None
    description: Optional[str] = None
    trending: Optional[bool] = None
    image_url: Optional[str] = None

class BookmarkCreate(BaseModel):
    place_id: int
    note: Optional[str] = None
    place: Optional[PlaceIn] = None


# ── GET all bookmarks for a user ─────────────────────────────────────────
@router.get("/bookmarks")
async def get_bookmarks(user_id: int = 1, db: AsyncSession = Depends(get_db)):
    try:
        stmt = text("""
            SELECT
                b.id,
                b.place_id,
                b.note,
                b.created_at,
                p.name,
                -- extract lat/lon from PostGIS geography POINT
                ST_Y(p.location::geometry) AS lat,
                ST_X(p.location::geometry) AS lon,
                -- also return a textual WKT location for backward compatibility
                ST_AsText(p.location::geometry) AS location,
                p.city,
                p.country,
                p.rating,
                p.image_url,
                p.category,
                p.description
            FROM bookmarks b
            JOIN places p ON p.id = b.place_id
            WHERE b.user_id = :user_id
            ORDER BY b.created_at DESC
        """)
        result = await db.execute(stmt, {"user_id": user_id})
        rows = result.fetchall()
        return [dict(row._mapping) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── POST add a bookmark ───────────────────────────────────────────────────

@router.post("/bookmarks")
async def add_bookmark(
    body: BookmarkCreate,
    user_id: int = 1,
    db: AsyncSession = Depends(get_db)
):
    try:
        # Check if already bookmarked
        check = text("""
            SELECT id FROM bookmarks
            WHERE user_id = :user_id AND place_id = :place_id
        """)
        existing = await db.execute(check, {"user_id": user_id, "place_id": body.place_id})
        if existing.fetchone():
            return {"message": "Already bookmarked", "already_exists": True}

        # Check if place exists in DB
        place_check = text("SELECT id FROM places WHERE id = :place_id")
        place_result = await db.execute(place_check, {"place_id": body.place_id})
        if not place_result.fetchone():
            # Insert place if full place data is provided
            if not body.place:
                raise HTTPException(status_code=400, detail="Place does not exist in DB and no place data provided.")
            # Insert new place
            insert_stmt = text("""
                INSERT INTO places (id, name, country, city, category, rating, review_count, image_url, description)
                VALUES (:id, :name, :country, :city, :category, :rating, :review_count, :image_url, :description)
            """)
            await db.execute(insert_stmt, {
                "id": body.place.id,
                "name": body.place.name,
                "country": body.place.country,
                "city": body.place.city or "",
                "category": body.place.category or "other",
                "rating": body.place.rating or 0,
                "review_count": body.place.review_count or 0,
                "image_url": body.place.image_url or "",
                "description": body.place.description or "",
            })
            await db.commit()

        stmt = text("""
            INSERT INTO bookmarks (user_id, place_id, note)
            VALUES (:user_id, :place_id, :note)
            RETURNING id, place_id, note, created_at
        """)
        result = await db.execute(stmt, {
            "user_id":  user_id,
            "place_id": body.place_id,
            "note":     body.note,
        })
        await db.commit()
        row = result.fetchone()
        return {"message": "Bookmarked successfully", "bookmark": dict(row._mapping)}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ── DELETE remove a bookmark ─────────────────────────────────────────────
@router.delete("/bookmarks/{bookmark_id}")
async def delete_bookmark(
    bookmark_id: int,
    user_id: int = 1,
    db: AsyncSession = Depends(get_db)
):
    try:
        stmt = text("""
            DELETE FROM bookmarks
            WHERE id = :id AND user_id = :user_id
            RETURNING id
        """)
        result = await db.execute(stmt, {"id": bookmark_id, "user_id": user_id})
        await db.commit()
        deleted = result.fetchone()
        if not deleted:
            raise HTTPException(status_code=404, detail="Bookmark not found")
        return {"message": "Bookmark removed", "id": bookmark_id}
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ── DELETE remove by place_id (used from Explore page) ───────────────────
@router.delete("/bookmarks/place/{place_id}")
async def delete_bookmark_by_place(
    place_id: int,
    user_id: int = 1,
    db: AsyncSession = Depends(get_db)
):
    try:
        stmt = text("""
            DELETE FROM bookmarks
            WHERE place_id = :place_id AND user_id = :user_id
            RETURNING id
        """)
        result = await db.execute(stmt, {"place_id": place_id, "user_id": user_id})
        await db.commit()
        deleted = result.fetchone()
        if not deleted:
            raise HTTPException(status_code=404, detail="Bookmark not found")
        return {"message": "Bookmark removed"}
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ── GET check if a place is bookmarked ───────────────────────────────────
@router.get("/bookmarks/check/{place_id}")
async def check_bookmark(
    place_id: int,
    user_id: int = 1,
    db: AsyncSession = Depends(get_db)
):
    try:
        stmt = text("""
            SELECT id FROM bookmarks
            WHERE user_id = :user_id AND place_id = :place_id
        """)
        result = await db.execute(stmt, {"user_id": user_id, "place_id": place_id})
        row = result.fetchone()
        return {"bookmarked": row is not None, "bookmark_id": row[0] if row else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))