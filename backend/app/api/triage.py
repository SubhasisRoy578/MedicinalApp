from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models import User, Consultation, TriageAlert, UserRole
from app.schemas import TriageAlertOut
from app.services.audit_service import create_audit_log

router = APIRouter(prefix="/triage", tags=["Triage Alerts"])


@router.get("/alerts", response_model=List[TriageAlertOut])
def get_active_triage_alerts(
    current_user: User = Depends(require_roles([UserRole.DOCTOR.value, UserRole.ADMIN.value])),
    db: Session = Depends(get_db),
):
    alerts = (
        db.query(TriageAlert)
        .filter(TriageAlert.status == "ACTIVE")
        .order_by(desc(TriageAlert.created_at))
        .limit(50)
        .all()
    )
    return alerts


@router.get("/consultations/{consultation_id}/status", response_model=List[TriageAlertOut])
def get_consultation_triage_status(
    consultation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    if current_user.role == UserRole.PATIENT.value and consultation.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return (
        db.query(TriageAlert)
        .filter(TriageAlert.consultation_id == consultation_id)
        .order_by(desc(TriageAlert.created_at))
        .all()
    )


@router.post("/alerts/{alert_id}/acknowledge", response_model=TriageAlertOut)
def acknowledge_triage_alert(
    alert_id: int,
    current_user: User = Depends(require_roles([UserRole.DOCTOR.value, UserRole.ADMIN.value])),
    db: Session = Depends(get_db),
):
    alert = db.query(TriageAlert).filter(TriageAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Triage alert not found")

    alert.status = "ACKNOWLEDGED"
    alert.acknowledged_at = datetime.utcnow()
    alert.acknowledged_by = current_user.id
    db.commit()
    db.refresh(alert)

    create_audit_log(
        db=db,
        action="TRIAGE_ALERT_ACKNOWLEDGED",
        user=current_user,
        consultation_id=alert.consultation_id,
        details={"alert_id": alert.id, "reason": alert.reason},
    )
    return alert
