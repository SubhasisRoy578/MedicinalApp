from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models import User, Consultation, ConsultationStatus, MedicalSummary, UserRole, ConsultationMode
from app.schemas import (
    ConsultationCreate,
    ConsentRequest,
    ConsultationOut,
    ConsultationDetailOut,
    DoctorNotesUpdate,
    VerificationRequest
)
from app.services.audit_service import create_audit_log

router = APIRouter(prefix="/consultations", tags=["Consultations"])

@router.post("", response_model=ConsultationOut, status_code=status.HTTP_201_CREATED)
def create_consultation(
    cons_in: ConsultationCreate,
    current_user: User = Depends(require_roles([UserRole.PATIENT.value, UserRole.ADMIN.value])),
    db: Session = Depends(get_db)
):
    consultation = Consultation(
        patient_id=current_user.id,
        doctor_id=cons_in.doctor_id,
        status=ConsultationStatus.CREATED.value,
        started_at=datetime.utcnow(),
        language=cons_in.language or "English",
        mode=cons_in.mode if cons_in.mode in [ConsultationMode.GENERAL.value, ConsultationMode.AYUSH.value] else ConsultationMode.GENERAL.value,
        consent_given=False,
        summary_status="NOT_STARTED"
    )
    db.add(consultation)
    db.commit()
    db.refresh(consultation)

    create_audit_log(
        db=db,
        action="CONSULTATION_CREATED",
        user=current_user,
        consultation_id=consultation.id,
        details={"language": consultation.language, "mode": consultation.mode}
    )

    out = ConsultationOut.model_validate(consultation)
    out.reports_count = 0
    out.answers_count = 0
    return out

@router.get("", response_model=List[ConsultationOut])
def get_user_consultations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == UserRole.PATIENT.value:
        consultations = db.query(Consultation).filter(
            Consultation.patient_id == current_user.id
        ).order_by(desc(Consultation.created_at)).all()
    elif current_user.role == UserRole.DOCTOR.value:
        consultations = db.query(Consultation).order_by(desc(Consultation.created_at)).all()
    else:  # Admin
        consultations = db.query(Consultation).order_by(desc(Consultation.created_at)).all()

    result = []
    for c in consultations:
        c_dict = ConsultationOut.model_validate(c)
        c_dict.reports_count = len(c.reports)
        c_dict.answers_count = len(c.answers)
        c_dict.doctor_verified = c.summary.doctor_verified if c.summary else False
        result.append(c_dict)

    return result

@router.get("/{id}", response_model=ConsultationDetailOut)
def get_consultation_detail(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    consultation = db.query(Consultation).filter(Consultation.id == id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    # Access control: patient can only view their own; doctor/admin can view all
    if current_user.role == UserRole.PATIENT.value and consultation.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this consultation")

    out = ConsultationDetailOut.model_validate(consultation)
    out.reports_count = len(consultation.reports)
    out.answers_count = len(consultation.answers)
    out.doctor_verified = consultation.summary.doctor_verified if consultation.summary else False
    return out

@router.post("/{id}/consent", response_model=ConsultationOut)
def provide_consent(
    id: int,
    consent_req: ConsentRequest,
    current_user: User = Depends(require_roles([UserRole.PATIENT.value])),
    db: Session = Depends(get_db)
):
    consultation = db.query(Consultation).filter(Consultation.id == id, Consultation.patient_id == current_user.id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    if not consent_req.consent_given:
        raise HTTPException(status_code=400, detail="Consent is required to proceed with the medical consultation")

    consultation.consent_given = True
    consultation.consent_timestamp = datetime.utcnow()
    if consent_req.language:
        consultation.language = consent_req.language
    consultation.status = ConsultationStatus.IN_PROGRESS.value

    db.commit()
    db.refresh(consultation)

    create_audit_log(
        db=db,
        action="CONSENT_PROVIDED",
        user=current_user,
        consultation_id=consultation.id,
        details={"timestamp": str(consultation.consent_timestamp), "language": consultation.language}
    )

    out = ConsultationOut.model_validate(consultation)
    out.reports_count = len(consultation.reports)
    out.answers_count = len(consultation.answers)
    return out

@router.post("/{id}/submit-to-doctor", response_model=ConsultationOut)
def submit_to_doctor(
    id: int,
    current_user: User = Depends(require_roles([UserRole.PATIENT.value])),
    db: Session = Depends(get_db)
):
    consultation = db.query(Consultation).filter(Consultation.id == id, Consultation.patient_id == current_user.id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    consultation.status = ConsultationStatus.WAITING_FOR_DOCTOR.value
    db.commit()
    db.refresh(consultation)

    create_audit_log(
        db=db,
        action="SUBMITTED_TO_DOCTOR",
        user=current_user,
        consultation_id=consultation.id
    )

    out = ConsultationOut.model_validate(consultation)
    out.reports_count = len(consultation.reports)
    out.answers_count = len(consultation.answers)
    return out

@router.post("/{id}/verify", response_model=ConsultationDetailOut)
def verify_consultation_summary(
    id: int,
    verify_req: Optional[VerificationRequest] = None,
    current_user: User = Depends(require_roles([UserRole.DOCTOR.value, UserRole.ADMIN.value])),
    db: Session = Depends(get_db)
):
    consultation = db.query(Consultation).filter(Consultation.id == id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    if not consultation.summary:
        raise HTTPException(status_code=400, detail="Cannot verify consultation before summary is generated")

    summary = consultation.summary
    summary.doctor_verified = True
    summary.verified_at = datetime.utcnow()
    summary.verified_by = current_user.id

    if verify_req:
        if verify_req.doctor_notes is not None:
            summary.doctor_notes = verify_req.doctor_notes
        if verify_req.physical_examination is not None:
            summary.physical_examination = verify_req.physical_examination
        if verify_req.provisional_diagnosis is not None:
            summary.provisional_diagnosis = verify_req.provisional_diagnosis
        if verify_req.prescription_plan is not None:
            summary.prescription_plan = verify_req.prescription_plan

    consultation.status = ConsultationStatus.VERIFIED.value
    consultation.doctor_id = current_user.id

    db.commit()
    db.refresh(consultation)

    create_audit_log(
        db=db,
        action="DOCTOR_VERIFIED_SUMMARY",
        user=current_user,
        consultation_id=consultation.id,
        details={"verified_by": current_user.name, "doctor_id": current_user.id}
    )

    out = ConsultationDetailOut.model_validate(consultation)
    out.reports_count = len(consultation.reports)
    out.answers_count = len(consultation.answers)
    out.doctor_verified = True
    return out

@router.post("/{id}/complete", response_model=ConsultationOut)
def complete_consultation(
    id: int,
    current_user: User = Depends(require_roles([UserRole.DOCTOR.value, UserRole.ADMIN.value])),
    db: Session = Depends(get_db)
):
    consultation = db.query(Consultation).filter(Consultation.id == id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    consultation.status = ConsultationStatus.COMPLETED.value
    consultation.completed_at = datetime.utcnow()
    if not consultation.doctor_id:
        consultation.doctor_id = current_user.id

    db.commit()
    db.refresh(consultation)

    create_audit_log(
        db=db,
        action="CONSULTATION_COMPLETED",
        user=current_user,
        consultation_id=consultation.id
    )

    out = ConsultationOut.model_validate(consultation)
    out.reports_count = len(consultation.reports)
    out.answers_count = len(consultation.answers)
    return out

@router.post("/{id}/doctor-notes")
def save_doctor_notes(
    id: int,
    notes_in: DoctorNotesUpdate,
    current_user: User = Depends(require_roles([UserRole.DOCTOR.value, UserRole.ADMIN.value])),
    db: Session = Depends(get_db)
):
    consultation = db.query(Consultation).filter(Consultation.id == id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    if not consultation.summary:
        summary = MedicalSummary(consultation_id=consultation.id)
        db.add(summary)
        db.commit()
        db.refresh(summary)
    else:
        summary = consultation.summary

    if notes_in.doctor_notes is not None:
        summary.doctor_notes = notes_in.doctor_notes
    if notes_in.physical_examination is not None:
        summary.physical_examination = notes_in.physical_examination
    if notes_in.provisional_diagnosis is not None:
        summary.provisional_diagnosis = notes_in.provisional_diagnosis
    if notes_in.prescription_plan is not None:
        summary.prescription_plan = notes_in.prescription_plan

    consultation.doctor_id = current_user.id
    db.commit()

    create_audit_log(
        db=db,
        action="DOCTOR_NOTES_UPDATED",
        user=current_user,
        consultation_id=consultation.id,
        details={"doctor_name": current_user.name}
    )

    return {"message": "Doctor clinical notes saved successfully"}
