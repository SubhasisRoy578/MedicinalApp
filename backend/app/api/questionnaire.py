from typing import List, Dict, Any, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Consultation, Answer, UserRole, User
from app.schemas import AnswerCreate, AnswerOut, QuestionOut
from app.services.questionnaire_engine import QuestionnaireEngine
from app.services.triage import detect_emergency
from app.models import TriageAlert
from app.services.audit_service import create_audit_log

router = APIRouter(prefix="/consultations/{id}/questionnaire", tags=["Questionnaire"])

@router.get("/questions", response_model=List[QuestionOut])
def get_all_questions(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    consultation = db.query(Consultation).filter(Consultation.id == id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    questions = QuestionnaireEngine.get_questions_for_language(consultation.language or "English", consultation.mode or "GENERAL")
    return questions

@router.get("/next-question")
def get_next_question(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    consultation = db.query(Consultation).filter(Consultation.id == id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    answers = db.query(Answer).filter(Answer.consultation_id == id).all()
    next_q = QuestionnaireEngine.determine_next_question(answers, consultation.language or "English", consultation.mode or "GENERAL")
    progress = QuestionnaireEngine.calculate_progress(answers, consultation.mode or "GENERAL")

    return {
        "consultation_id": id,
        "language": consultation.language,
        "progress_percentage": progress,
        "answered_count": len(answers),
        "next_question": next_q,
        "is_complete": next_q is None
    }

@router.post("/answers", response_model=AnswerOut, status_code=status.HTTP_201_CREATED)
def submit_answer(
    id: int,
    ans_in: AnswerCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    consultation = db.query(Consultation).filter(Consultation.id == id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    # If answer for this question_id already exists, update it, otherwise create new
    existing_answer = None
    if ans_in.question_id:
        existing_answer = db.query(Answer).filter(
            Answer.consultation_id == id,
            Answer.question_id == ans_in.question_id
        ).first()

    if existing_answer:
        existing_answer.answer = ans_in.answer.strip()
        existing_answer.answer_type = ans_in.answer_type
        existing_answer.question_text = ans_in.question_text
        if ans_in.category:
            existing_answer.category = ans_in.category
        db.commit()
        db.refresh(existing_answer)
        answer_record = existing_answer
    else:
        answer_record = Answer(
            consultation_id=id,
            question_id=ans_in.question_id,
            question_text=ans_in.question_text,
            category=ans_in.category or "General",
            answer=ans_in.answer.strip(),
            answer_type=ans_in.answer_type
        )
        db.add(answer_record)
        db.commit()
        db.refresh(answer_record)

    # Safety screen: evaluate the complete answer history after saving this answer.
    # This creates an internal triage alert; it does not diagnose the patient.
    all_answers = db.query(Answer).filter(Answer.consultation_id == id).all()
    triage_result = detect_emergency(all_answers)

    if triage_result:
        active_existing = (
            db.query(TriageAlert)
            .filter(
                TriageAlert.consultation_id == id,
                TriageAlert.status == "ACTIVE"
            )
            .first()
        )
        if not active_existing:
            alert = TriageAlert(
                consultation_id=id,
                patient_id=consultation.patient_id,
                severity=triage_result["severity"],
                reason=triage_result["reason"],
                evidence=triage_result["evidence"],
            )
            db.add(alert)
            db.commit()
            create_audit_log(
                db=db,
                action="TRIAGE_ALERT_CREATED",
                user=current_user,
                consultation_id=id,
                details={
                    "severity": triage_result["severity"],
                    "rule": triage_result["rule"],
                    "evidence": triage_result["evidence"],
                },
            )

    create_audit_log(
        db=db,
        action="QUESTION_ANSWERED",
        user=current_user,
        consultation_id=id,
        details={"question": ans_in.question_text[:50], "answer_type": ans_in.answer_type}
    )

    return answer_record

@router.get("/answers", response_model=List[AnswerOut])
def get_answers(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    consultation = db.query(Consultation).filter(Consultation.id == id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    answers = db.query(Answer).filter(Answer.consultation_id == id).order_by(Answer.id).all()
    return answers
