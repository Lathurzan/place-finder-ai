from sqlalchemy.orm import Session
from models.user import User
from models.place import Place
from models.bookmark import Bookmark
from sqlalchemy import func
import datetime

def get_analytics(db: Session):
    total_users = db.query(User).count()
    total_bookmarks = db.query(Bookmark).count() if hasattr(db, 'query') and hasattr(Bookmark, '__table__') else 0
    # Popular places: top 5 by review_count or bookmarks
    popular_places = db.query(Place).order_by(getattr(Place, 'review_count', 0).desc()).limit(5).all()
    popular_names = [p.name for p in popular_places]
    # Active users in last 7 days
    week_ago = datetime.datetime.utcnow() - datetime.timedelta(days=7)
    active_users_7d = db.query(User).filter(User.last_login >= week_ago).count() if hasattr(User, 'last_login') else 0
    return {
        "total_users": total_users,
        "total_bookmarks": total_bookmarks,
        "popular_places": popular_names,
        "active_users_7d": active_users_7d,
    }
