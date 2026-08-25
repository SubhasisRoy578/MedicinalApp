from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.core.security import require_roles
from app.models import User, UserRole, Consultation, MedicalReport, ConsultationStatus
from app.schemas import UserOut, AdminStats
from app.services.audit_service import create_audit_log

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/stats", response_model=AdminStats)
def get_admin_stats(
    current_user: User = Depends(require_roles([UserRole.ADMIN.value])),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_patients = db.query(User).filter(User.role == UserRole.PATIENT.value).count()
    total_doctors = db.query(User).filter(User.role == UserRole.DOCTOR.value).count()
    total_consultations = db.query(Consultation).count()
    pending_reviews = db.query(Consultation).filter(
        Consultation.status == ConsultationStatus.WAITING_FOR_DOCTOR.value
    ).count()
    verified_consultations = db.query(Consultation).filter(
        Consultation.status == ConsultationStatus.VERIFIED.value
    ).count()
    completed_consultations = db.query(Consultation).filter(
        Consultation.status == ConsultationStatus.COMPLETED.value
    ).count()
    total_reports = db.query(MedicalReport).count()

    return {
        "total_users": total_users,
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "total_consultations": total_consultations,
        "pending_reviews": pending_reviews,
        "verified_consultations": verified_consultations,
        "completed_consultations": completed_consultations,
        "total_reports_processed": total_reports
    }

@router.get("/users", response_model=List[UserOut])
def get_all_users(
    current_user: User = Depends(require_roles([UserRole.ADMIN.value])),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(desc(User.created_at)).all()
    return users

@router.put("/users/{user_id}/status")
def toggle_user_status(
    user_id: int,
    current_user: User = Depends(require_roles([UserRole.ADMIN.value])),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate own admin account")

    user.is_active = not user.is_active
    db.commit()

    create_audit_log(
        db=db,
        action="USER_STATUS_TOGGLED",
        user=current_user,
        details={"target_user_id": user.id, "new_status": user.is_active}
    )

    return {"message": f"User status set to {'active' if user.is_active else 'inactive'}", "is_active": user.is_active}
