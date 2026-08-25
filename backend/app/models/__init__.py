import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserRole(str, enum.Enum):
    PATIENT = "PATIENT"
    DOCTOR = "DOCTOR"
    ADMIN = "ADMIN"

class ConsultationMode(str, enum.Enum):
    GENERAL = "GENERAL"
    AYUSH = "AYUSH"

class ConsultationStatus(str, enum.Enum):
    CREATED = "CREATED"
    IN_PROGRESS = "IN_PROGRESS"
    WAITING_FOR_DOCTOR = "WAITING_FOR_DOCTOR"
    VERIFIED = "VERIFIED"
    COMPLETED = "COMPLETED"

class OCRStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default=UserRole.PATIENT.value, nullable=False)
    phone = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient_profile = relationship("PatientProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    doctor_profile = relationship("DoctorProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    consultations_as_patient = relationship("Consultation", foreign_keys="[Consultation.patient_id]", back_populates="patient")
    consultations_as_doctor = relationship("Consultation", foreign_keys="[Consultation.doctor_id]", back_populates="doctor")
    audit_logs = relationship("AuditLog", back_populates="user")

class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    date_of_birth = Column(String(50), nullable=True)
    gender = Column(String(20), nullable=True)
    blood_group = Column(String(10), nullable=True)
    emergency_contact = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    preferred_language = Column(String(50), default="English")

    user = relationship("User", back_populates="patient_profile")

class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    specialization = Column(String(100), default="General Medicine")
    license_number = Column(String(100), nullable=True)
    hospital_name = Column(String(200), default="Arogya Medical Center")
    department = Column(String(100), default="Internal Medicine")

    user = relationship("User", back_populates="doctor_profile")

class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String(50), default=ConsultationStatus.CREATED.value)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    consent_given = Column(Boolean, default=False)
    consent_timestamp = Column(DateTime, nullable=True)
    language = Column(String(50), default="English")
    summary_status = Column(String(50), default="NOT_STARTED")  # NOT_STARTED, GENERATING, READY, VERIFIED
    mode = Column(String(20), default=ConsultationMode.GENERAL.value, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("User", foreign_keys=[patient_id], back_populates="consultations_as_patient")
    doctor = relationship("User", foreign_keys=[doctor_id], back_populates="consultations_as_doctor")
    answers = relationship("Answer", back_populates="consultation", cascade="all, delete-orphan")
    reports = relationship("MedicalReport", back_populates="consultation", cascade="all, delete-orphan")
    extracted_info = relationship("ExtractedMedicalInfo", back_populates="consultation", cascade="all, delete-orphan")
    summary = relationship("MedicalSummary", back_populates="consultation", uselist=False, cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="consultation", cascade="all, delete-orphan")
    triage_alerts = relationship("TriageAlert", back_populates="consultation", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    question_text = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    question_type = Column(String(50), default="text")  # text, choice, multichoice, scale, boolean
    language = Column(String(50), default="English")
    options = Column(JSON, nullable=True)  # list of strings for quick replies
    parent_question_id = Column(Integer, ForeignKey("questions.id"), nullable=True)
    trigger_value = Column(String(255), nullable=True)  # e.g., "Yes" or specific answers that trigger this
    required = Column(Boolean, default=True)
    order_index = Column(Integer, default=0)

class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    consultation_id = Column(Integer, ForeignKey("consultations.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=True)
    question_text = Column(Text, nullable=False)
    category = Column(String(100), nullable=True)
    answer = Column(Text, nullable=False)
    answer_type = Column(String(50), default="text")  # text, voice, quick_button
    created_at = Column(DateTime, default=datetime.utcnow)

    consultation = relationship("Consultation", back_populates="answers")

class MedicalReport(Base):
    __tablename__ = "medical_reports"

    id = Column(Integer, primary_key=True, index=True)
    consultation_id = Column(Integer, ForeignKey("consultations.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(100), nullable=False)
    file_size = Column(Integer, default=0)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    ocr_status = Column(String(50), default=OCRStatus.PENDING.value)
    ocr_text = Column(Text, nullable=True)

    consultation = relationship("Consultation", back_populates="reports")
    extracted_info = relationship("ExtractedMedicalInfo", back_populates="report", cascade="all, delete-orphan")

class ExtractedMedicalInfo(Base):
    __tablename__ = "extracted_medical_info"

    id = Column(Integer, primary_key=True, index=True)
    consultation_id = Column(Integer, ForeignKey("consultations.id", ondelete="CASCADE"), nullable=False)
    report_id = Column(Integer, ForeignKey("medical_reports.id", ondelete="SET NULL"), nullable=True)
    diagnosis = Column(JSON, default=list)  # list of extracted diagnoses
    medicines = Column(JSON, default=list)  # list of {name, dosage, frequency}
    test_results = Column(JSON, default=list)  # list of {test_name, result, unit, reference_range, flag}
    laboratory_values = Column(JSON, default=dict)
    procedures = Column(JSON, default=list)
    surgeries = Column(JSON, default=list)
    dates = Column(JSON, default=list)
    doctor_names = Column(JSON, default=list)
    hospital_names = Column(JSON, default=list)
    important_findings = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    consultation = relationship("Consultation", back_populates="extracted_info")
    report = relationship("MedicalReport", back_populates="extracted_info")

class MedicalSummary(Base):
    __tablename__ = "medical_summaries"

    id = Column(Integer, primary_key=True, index=True)
    consultation_id = Column(Integer, ForeignKey("consultations.id", ondelete="CASCADE"), unique=True, nullable=False)
    chief_complaint = Column(Text, nullable=True)
    symptoms = Column(Text, nullable=True)
    duration = Column(String(255), nullable=True)
    severity = Column(String(100), nullable=True)
    past_history = Column(Text, nullable=True)
    medications = Column(Text, nullable=True)
    allergies = Column(Text, nullable=True)
    surgeries = Column(Text, nullable=True)
    family_history = Column(Text, nullable=True)
    investigation_results = Column(Text, nullable=True)
    previous_diagnosis = Column(Text, nullable=True)
    extracted_report_information = Column(JSON, default=dict)
    ai_summary = Column(Text, nullable=True)
    patient_description = Column(Text, nullable=True)
    
    # Doctor editable / clinical section
    doctor_notes = Column(Text, nullable=True)
    physical_examination = Column(Text, nullable=True)
    provisional_diagnosis = Column(Text, nullable=True)
    prescription_plan = Column(Text, nullable=True)
    
    doctor_verified = Column(Boolean, default=False)
    verified_at = Column(DateTime, nullable=True)
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    consultation = relationship("Consultation", back_populates="summary")

class TriageAlert(Base):
    __tablename__ = "triage_alerts"

    id = Column(Integer, primary_key=True, index=True)
    consultation_id = Column(Integer, ForeignKey("consultations.id", ondelete="CASCADE"), nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    severity = Column(String(20), default="URGENT", nullable=False)
    reason = Column(Text, nullable=False)
    evidence = Column(JSON, default=list)
    status = Column(String(20), default="ACTIVE", nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    acknowledged_at = Column(DateTime, nullable=True)
    acknowledged_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    consultation = relationship("Consultation", back_populates="triage_alerts")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    user_email = Column(String(255), nullable=True)
    action = Column(String(255), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    consultation_id = Column(Integer, ForeignKey("consultations.id", ondelete="SET NULL"), nullable=True)
    details = Column(JSON, nullable=True)

    user = relationship("User", back_populates="audit_logs")
    consultation = relationship("Consultation", back_populates="audit_logs")
