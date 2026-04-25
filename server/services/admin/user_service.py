from sqlalchemy.orm import Session
from models.user import User

def get_all_users(db: Session):
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "plan": getattr(u, "plan", None),
            "created_at": u.created_at,
        }
        for u in users
    ]
