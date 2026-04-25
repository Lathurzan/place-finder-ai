from sqlalchemy.orm import Session
from models.user import User
from models.place import Place

def get_all_plans(db: Session):
    # Example: plans are just user plan types with user counts
    plans = db.query(User.plan).distinct()
    result = []
    for plan in plans:
        user_count = db.query(User).filter(User.plan == plan[0]).count()
        result.append({
            "id": plan[0],
            "name": plan[0],
            "user_count": user_count
        })
    return result
