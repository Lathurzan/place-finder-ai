from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from services.admin.user_service import get_all_users
from services.admin.plan_service import get_all_plans
from services.admin.place_service import get_all_places
from services.admin.analytics_service import get_analytics
from core.security import get_current_admin

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/users")
def users(db: Session = Depends(get_db), user=Depends(get_current_admin)):
    return get_all_users(db)

@router.get("/plans")
def plans(db: Session = Depends(get_db), user=Depends(get_current_admin)):
    return get_all_plans(db)

@router.get("/places")
def places(db: Session = Depends(get_db), user=Depends(get_current_admin)):
    return get_all_places(db)

@router.get("/analytics")
def analytics(db: Session = Depends(get_db), user=Depends(get_current_admin)):
    return get_analytics(db)
