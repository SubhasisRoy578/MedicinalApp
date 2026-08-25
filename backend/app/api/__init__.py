from app.api.auth import router as auth_router
from app.api.patients import router as patients_router
from app.api.doctors import router as doctors_router
from app.api.consultations import router as consultations_router
from app.api.questionnaire import router as questionnaire_router
from app.api.reports import router as reports_router
from app.api.summaries import router as summaries_router
from app.api.audit import router as audit_router
from app.api.admin import router as admin_router
from app.api.triage import router as triage_router

__all__ = [
    "auth_router",
    "patients_router",
    "doctors_router",
    "consultations_router",
    "questionnaire_router",
    "reports_router",
    "summaries_router",
    "audit_router",
    "admin_router",
    "triage_router"
]
