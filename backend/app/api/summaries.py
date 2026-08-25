from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Consultation, Answer, ExtractedMedicalInfo, MedicalSummary, User
from app.schemas import MedicalSummaryOut, MedicalSummaryUpdate
from app.services.ai.base import AIService
from app.services.audit_service import create_audit_log

router = APIRouter(prefix="/consultations/{id}/summary", tags=["Medical Summaries"])

@router.post("/generate", response_model=MedicalSummaryOut)
async def generate_consultation_summary(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    consultation = db.query(Consultation).filter(Consultation.id == id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    answers = db.query(Answer).filter(Answer.consultation_id == id).all()
    extracted_reports = db.query(ExtractedMedicalInfo).filter(ExtractedMedicalInfo.consultation_id == id).all()
    patient = consultation.patient
    patient_profile = patient.patient_profile if patient else None

    # Call AI synthesis service
    summary_data = await AIService.generate_summary(
        patient=patient,
        patient_profile=patient_profile,
        answers=answers,
        extracted_reports=extracted_reports,
        language=consultation.language or "English"
    )

    # Save or update summary in database
    summary = db.query(MedicalSummary).filter(MedicalSummary.consultation_id == id).first()
    if not summary:
        summary = MedicalSummary(consultation_id=id)
        db.add(summary)

    for field, val in summary_data.items():
        if hasattr(summary, field):
            setattr(summary, field, val)

    consultation.summary_status = "READY"
    db.commit()
    db.refresh(summary)

    create_audit_log(
        db=db,
        action="AI_SUMMARY_GENERATED",
        user=current_user,
        consultation_id=id,
        details={"language": consultation.language}
    )

    return summary

@router.get("", response_model=MedicalSummaryOut)
def get_consultation_summary(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    consultation = db.query(Consultation).filter(Consultation.id == id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    summary = db.query(MedicalSummary).filter(MedicalSummary.consultation_id == id).first()
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not yet generated for this consultation")

    return summary

@router.put("", response_model=MedicalSummaryOut)
def update_consultation_summary(
    id: int,
    summary_update: MedicalSummaryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    consultation = db.query(Consultation).filter(Consultation.id == id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    summary = db.query(MedicalSummary).filter(MedicalSummary.consultation_id == id).first()
    if not summary:
        summary = MedicalSummary(consultation_id=id)
        db.add(summary)

    update_dict = summary_update.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        if hasattr(summary, key) and value is not None:
            setattr(summary, key, value)

    db.commit()
    db.refresh(summary)

    create_audit_log(
        db=db,
        action="MEDICAL_SUMMARY_EDITED",
        user=current_user,
        consultation_id=id,
        details={"edited_fields": list(update_dict.keys()), "editor_role": current_user.role}
    )

    return summary
