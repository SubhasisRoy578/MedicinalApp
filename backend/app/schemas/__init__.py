from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field

# ----------------- AUTH SCHEMAS -----------------
class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "PATIENT"  # PATIENT, DOCTOR, ADMIN
    phone: Optional[str] = None
    # Patient profile fields
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    address: Optional[str] = None
    preferred_language: Optional[str] = "English"
    # Doctor profile fields (if registering doctor)
    specialization: Optional[str] = "General Medicine"
    hospital_name: Optional[str] = "Arogya Medical Center"
    license_number: Optional[str] = None
    department: Optional[str] = "Internal Medicine"

class PatientProfileOut(BaseModel):
    id: int
    user_id: int
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    address: Optional[str] = None
    preferred_language: Optional[str] = "English"

    class Config:
        from_attributes = True

class DoctorProfileOut(BaseModel):
    id: int
    user_id: int
    specialization: Optional[str] = None
    license_number: Optional[str] = None
    hospital_name: Optional[str] = None
    department: Optional[str] = None

    class Config:
        from_attributes = True

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    phone: Optional[str] = None
    is_active: bool
    created_at: datetime
    patient_profile: Optional[PatientProfileOut] = None
    doctor_profile: Optional[DoctorProfileOut] = None

    class Config:
        from_attributes = True

# ----------------- QUESTIONNAIRE SCHEMAS -----------------
class QuestionOut(BaseModel):
    id: int
    question_text: str
    category: str
    question_type: str
    language: str
    options: Optional[List[str]] = None
    parent_question_id: Optional[int] = None
    trigger_value: Optional[str] = None
    required: bool
    order_index: int

    class Config:
        from_attributes = True

class AnswerCreate(BaseModel):
    question_id: Optional[int] = None
    question_text: str
    category: Optional[str] = None
    answer: str
    answer_type: str = "text"  # text, voice, quick_button

class AnswerOut(BaseModel):
    id: int
    consultation_id: int
    question_id: Optional[int] = None
    question_text: str
    category: Optional[str] = None
    answer: str
    answer_type: str
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- REPORT & OCR SCHEMAS -----------------
class MedicalReportOut(BaseModel):
    id: int
    consultation_id: int
    filename: str
    file_path: str
    file_type: str
    file_size: int
    uploaded_at: datetime
    ocr_status: str
    ocr_text: Optional[str] = None

    class Config:
        from_attributes = True

class ExtractedMedicalInfoOut(BaseModel):
    id: int
    consultation_id: int
    report_id: Optional[int] = None
    diagnosis: List[str] = []
    medicines: List[Dict[str, Any]] = []
    test_results: List[Dict[str, Any]] = []
    laboratory_values: Dict[str, Any] = {}
    procedures: List[str] = []
    surgeries: List[str] = []
    dates: List[str] = []
    doctor_names: List[str] = []
    hospital_names: List[str] = []
    important_findings: List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- SUMMARY SCHEMAS -----------------
class MedicalSummaryOut(BaseModel):
    id: int
    consultation_id: int
    chief_complaint: Optional[str] = None
    symptoms: Optional[str] = None
    duration: Optional[str] = None
    severity: Optional[str] = None
    past_history: Optional[str] = None
    medications: Optional[str] = None
    allergies: Optional[str] = None
    surgeries: Optional[str] = None
    family_history: Optional[str] = None
    investigation_results: Optional[str] = None
    previous_diagnosis: Optional[str] = None
    extracted_report_information: Optional[Dict[str, Any]] = {}
    ai_summary: Optional[str] = None
    patient_description: Optional[str] = None
    
    # Doctor sections
    doctor_notes: Optional[str] = None
    physical_examination: Optional[str] = None
    provisional_diagnosis: Optional[str] = None
    prescription_plan: Optional[str] = None
    
    doctor_verified: bool = False
    verified_at: Optional[datetime] = None
    verified_by: Optional[int] = None

    class Config:
        from_attributes = True

class MedicalSummaryUpdate(BaseModel):
    chief_complaint: Optional[str] = None
    symptoms: Optional[str] = None
    duration: Optional[str] = None
    severity: Optional[str] = None
    past_history: Optional[str] = None
    medications: Optional[str] = None
    allergies: Optional[str] = None
    surgeries: Optional[str] = None
    family_history: Optional[str] = None
    investigation_results: Optional[str] = None
    previous_diagnosis: Optional[str] = None
    ai_summary: Optional[str] = None
    patient_description: Optional[str] = None

class DoctorNotesUpdate(BaseModel):
    doctor_notes: Optional[str] = None
    physical_examination: Optional[str] = None
    provisional_diagnosis: Optional[str] = None
    prescription_plan: Optional[str] = None

class VerificationRequest(BaseModel):
    doctor_notes: Optional[str] = None
    physical_examination: Optional[str] = None
    provisional_diagnosis: Optional[str] = None
    prescription_plan: Optional[str] = None

# ----------------- CONSULTATION SCHEMAS -----------------
class ConsultationCreate(BaseModel):
    language: str = "English"
    doctor_id: Optional[int] = None
    mode: str = "GENERAL"

class ConsentRequest(BaseModel):
    consent_given: bool = True
    language: Optional[str] = "English"

class ConsultationOut(BaseModel):
    id: int
    patient_id: int
    doctor_id: Optional[int] = None
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    consent_given: bool
    consent_timestamp: Optional[datetime] = None
    language: str
    summary_status: str
    mode: str = "GENERAL"
    created_at: datetime
    patient: Optional[UserOut] = None
    doctor: Optional[UserOut] = None
    reports_count: int = 0
    answers_count: int = 0
    doctor_verified: bool = False

    class Config:
        from_attributes = True

class ConsultationDetailOut(ConsultationOut):
    answers: List[AnswerOut] = []
    reports: List[MedicalReportOut] = []
    extracted_info: List[ExtractedMedicalInfoOut] = []
    summary: Optional[MedicalSummaryOut] = None

class TriageAlertOut(BaseModel):
    id: int
    consultation_id: int
    patient_id: int
    severity: str
    reason: str
    evidence: List[str] = []
    status: str
    created_at: datetime
    acknowledged_at: Optional[datetime] = None
    acknowledged_by: Optional[int] = None

    class Config:
        from_attributes = True

# ----------------- AUDIT LOG SCHEMAS -----------------
class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_email: Optional[str] = None
    action: str
    timestamp: datetime
    consultation_id: Optional[int] = None
    details: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

# ----------------- ADMIN SCHEMAS -----------------
class AdminStats(BaseModel):
    total_users: int
    total_patients: int
    total_doctors: int
    total_consultations: int
    pending_reviews: int
    verified_consultations: int
    completed_consultations: int
    total_reports_processed: int
