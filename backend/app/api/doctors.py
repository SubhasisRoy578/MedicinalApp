from typing import List, Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, func
from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models import User, DoctorProfile, PatientProfile, Consultation, ConsultationStatus, UserRole
from app.schemas import UserOut, ConsultationOut

router = APIRouter(prefix="/doctors", tags=["Doctors"])

@router.get("", response_model=List[UserOut])
def get_all_doctors(db: Session = Depends(get_db)):
    doctors = db.query(User).filter(User.role == UserRole.DOCTOR.value, User.is_active == True).all()
    return doctors

@router.get("/dashboard-stats")
def get_doctor_dashboard_stats(
    current_user: User = Depends(require_roles([UserRole.DOCTOR.value, UserRole.ADMIN.value])),
    db: Session = Depends(get_db)
):
    today_start = datetime.combine(date.today(), datetime.min.time())
    
    today_consultations = db.query(Consultation).filter(Consultation.created_at >= today_start).count()
    pending_reviews = db.query(Consultation).filter(
        Consultation.status == ConsultationStatus.WAITING_FOR_DOCTOR.value
    ).count()
    in_progress = db.query(Consultation).filter(
        Consultation.status == ConsultationStatus.IN_PROGRESS.value
    ).count()
    verified_count = db.query(Consultation).filter(
        Consultation.status.in_([ConsultationStatus.VERIFIED.value, ConsultationStatus.COMPLETED.value])
    ).count()
    completed_count = db.query(Consultation).filter(
        Consultation.status == ConsultationStatus.COMPLETED.value
    ).count()
    total_patients = db.query(User).filter(User.role == UserRole.PATIENT.value).count()

    return {
        "today_consultations": today_consultations,
        "pending_reviews": pending_reviews,
        "in_progress": in_progress,
        "verified_consultations": verified_count,
        "completed_consultations": completed_count,
        "total_patients": total_patients
    }

@router.get("/consultations", response_model=List[ConsultationOut])
def get_doctor_consultations(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    limit: int = 50,
    current_user: User = Depends(require_roles([UserRole.DOCTOR.value, UserRole.ADMIN.value])),
    db: Session = Depends(get_db)
):
    query = db.query(Consultation).join(User, Consultation.patient_id == User.id)

    if status_filter and status_filter.upper() != "ALL":
        query = query.filter(Consultation.status == status_filter.upper())

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.name.ilike(search_term),
                User.email.ilike(search_term),
                User.phone.ilike(search_term),
                Consultation.language.ilike(search_term)
            )
        )

    consultations = query.order_by(desc(Consultation.created_at)).limit(limit).all()
    
    # Enhance with counts
    result = []
    for c in consultations:
        c_dict = ConsultationOut.model_validate(c)
        c_dict.reports_count = len(c.reports)
        c_dict.answers_count = len(c.answers)
        c_dict.doctor_verified = c.summary.doctor_verified if c.summary else False
        result.append(c_dict)

    return result

@router.get("/patients", response_model=List[UserOut])
def get_patients_directory(
    search: Optional[str] = Query(None),
    limit: int = 50,
    current_user: User = Depends(require_roles([UserRole.DOCTOR.value, UserRole.ADMIN.value])),
    db: Session = Depends(get_db)
):
    query = db.query(User).filter(User.role == UserRole.PATIENT.value)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.name.ilike(search_term),
                User.email.ilike(search_term),
                User.phone.ilike(search_term)
            )
        )

    patients = query.order_by(desc(User.created_at)).limit(limit).all()
    return patients

@router.get("/patients/{patient_id}")
def get_patient_detail(
    patient_id: int,
    current_user: User = Depends(require_roles([UserRole.DOCTOR.value, UserRole.ADMIN.value])),
    db: Session = Depends(get_db)
):
    patient = db.query(User).filter(User.id == patient_id, User.role == UserRole.PATIENT.value).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    consultations = db.query(Consultation).filter(Consultation.patient_id == patient_id).order_by(desc(Consultation.created_at)).all()
    
    return {
        "patient": UserOut.model_validate(patient),
        "consultations": [ConsultationOut.model_validate(c) for c in consultations]
    }
