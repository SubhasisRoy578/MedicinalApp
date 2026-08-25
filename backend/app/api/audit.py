from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models import AuditLog, Consultation, User, UserRole
from app.schemas import AuditLogOut

router = APIRouter(tags=["Audit Logs"])

@router.get("/consultations/{id}/audit-logs", response_model=List[AuditLogOut])
def get_consultation_audit_logs(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    consultation = db.query(Consultation).filter(Consultation.id == id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    logs = db.query(AuditLog).filter(AuditLog.consultation_id == id).order_by(desc(AuditLog.timestamp)).all()
    return logs

@router.get("/audit/logs", response_model=List[AuditLogOut])
def get_all_audit_logs(
    limit: int = 100,
    current_user: User = Depends(require_roles([UserRole.ADMIN.value, UserRole.DOCTOR.value])),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(desc(AuditLog.timestamp)).limit(limit).all()
    return logs
