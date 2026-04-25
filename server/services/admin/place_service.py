from sqlalchemy.orm import Session
from models.place import Place

def get_all_places(db: Session):
    places = db.query(Place).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "review_count": getattr(p, "review_count", 0)
        }
        for p in places
    ]
