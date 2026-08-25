import os
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models import (
    User, PatientProfile, DoctorProfile, Consultation, Answer,
    MedicalReport, ExtractedMedicalInfo, MedicalSummary, AuditLog,
    UserRole, ConsultationStatus, OCRStatus
)
from app.services.ocr.medical_parser import MedicalInformationParser
from app.services.ai.clinical_engine import ClinicalIntelligenceEngine

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if users already exist
        admin = db.query(User).filter(User.email == "admin@medikiosk.com").first()
        if admin:
            print("Database already seeded.")
            return

        print("Seeding initial users and clinical demo data...")

        # 1. Admin User
        admin_user = User(
            name="System Administrator",
            email="admin@medikiosk.com",
            password_hash=get_password_hash("Admin@123"),
            role=UserRole.ADMIN.value,
            phone="+91 9876543210",
            is_active=True
        )
        db.add(admin_user)

        # 2. Doctor User
        doctor_user = User(
            name="Dr. Ananya Roy, MD",
            email="doctor@medikiosk.com",
            password_hash=get_password_hash("Doctor@123"),
            role=UserRole.DOCTOR.value,
            phone="+91 9811223344",
            is_active=True
        )
        db.add(doctor_user)
        db.flush()

        doctor_profile = DoctorProfile(
            user_id=doctor_user.id,
            specialization="Cardiology & Internal Medicine",
            license_number="MCI-WB-2016-89421",
            hospital_name="Apollo Multi-Specialty Hospital, Kolkata",
            department="Cardiology"
        )
        db.add(doctor_profile)

        # 3. Patient User
        patient_user = User(
            name="Rahul Sharma",
            email="patient@medikiosk.com",
            password_hash=get_password_hash("Patient@123"),
            role=UserRole.PATIENT.value,
            phone="+91 9822334455",
            is_active=True
        )
        db.add(patient_user)
        db.flush()

        patient_profile = PatientProfile(
            user_id=patient_user.id,
            date_of_birth="1984-06-15",
            gender="Male",
            blood_group="B+",
            emergency_contact="Pooja Sharma (Wife) - +91 9822334456",
            address="Flat 402, Greenfield Heights, New Town, Kolkata 700156",
            preferred_language="English"
        )
        db.add(patient_profile)

        # 4. Create Pending Demo Consultation (Ready for Doctor Review)
        pending_cons = Consultation(
            patient_id=patient_user.id,
            doctor_id=doctor_user.id,
            status=ConsultationStatus.WAITING_FOR_DOCTOR.value,
            started_at=datetime.utcnow() - timedelta(minutes=45),
            consent_given=True,
            consent_timestamp=datetime.utcnow() - timedelta(minutes=40),
            language="English",
            summary_status="READY"
        )
        db.add(pending_cons)
        db.flush()

        # Add Answers to Pending Consultation
        demo_answers = [
            ("Chief Complaint", "What is the main health problem bringing you to see the doctor today?", "Persistent chest tightness and mild shortness of breath for the past 5 days when walking briskly.", "text"),
            ("Duration", "When did these symptoms first begin, or how long have you been feeling this way?", "A few days (2-6 days)", "choice"),
            ("Severity", "How would you rate the severity and progression of your symptoms?", "Moderate - Uncomfortable and limits some activities", "choice"),
            ("Symptoms", "Are you currently experiencing physical pain or acute discomfort?", "Yes", "choice"),
            ("Symptoms", "Where is the pain located, and how would you describe it?", "Chest / Heart area, feels like a heavy pressure or squeezing sensation.", "voice"),
            ("Previous illnesses", "Do you have any diagnosed medical conditions or chronic illnesses?", "Hypertension (High Blood Pressure)", "choice"),
            ("Previous illnesses", "Please mention how long you have had this condition:", "Diagnosed 3 years ago. Usually takes medication regularly.", "text"),
            ("Current medications", "Are you currently taking any prescription medicines, supplements, or over-the-counter drugs?", "Yes", "choice"),
            ("Current medications", "Please list the names of the medications you take:", "Tab. Telmisartan 40mg once daily in the morning.", "text"),
            ("Allergies", "Do you have any known allergies to medicines, foods, or other substances?", "Penicillin / Antibiotics", "choice"),
            ("Previous surgeries", "Have you ever undergone any surgeries or been hospitalized in the past?", "No prior surgeries or hospital stays", "choice"),
            ("Family history", "Is there any history of major illnesses in your immediate family?", "Early Heart Attack / CAD (Father had angioplasty at age 52)", "choice"),
            ("Lifestyle", "Which of the following describes your lifestyle habits?", "Occasional alcohol, non-smoker, high stress work desk job", "choice"),
            ("Other relevant information", "Is there anything else you would like the doctor to know?", "Concerned about family history of cardiac issues. Seeking preventive cardiac assessment.", "text")
        ]

        answers_records = []
        for cat, q_text, ans_text, ans_type in demo_answers:
            ans = Answer(
                consultation_id=pending_cons.id,
                question_text=q_text,
                category=cat,
                answer=ans_text,
                answer_type=ans_type,
                created_at=datetime.utcnow() - timedelta(minutes=35)
            )
            db.add(ans)
            answers_records.append(ans)

        # Uploaded Report & OCR for Pending Consultation
        sample_report = MedicalReport(
            consultation_id=pending_cons.id,
            filename="Comprehensive_Lipid_and_Metabolic_Report.pdf",
            file_path="./uploads/demo_lipid_report.pdf",
            file_type="application/pdf",
            file_size=245800,
            uploaded_at=datetime.utcnow() - timedelta(minutes=25),
            ocr_status=OCRStatus.COMPLETED.value,
            ocr_text=(
                "APOLLO DIAGNOSTICS & CLINICAL BIOCHEMISTRY\n"
                "Patient: Rahul Sharma | Age/Sex: 42Y / M | Ref: Dr. Ananya Roy\n"
                "Report Date: 18-Aug-2026\n"
                "------------------------------------------------------------------\n"
                "TEST NAME                RESULT    UNIT       REFERENCE RANGE\n"
                "Fasting Blood Glucose    138.0     mg/dL      70 - 100 (HIGH)\n"
                "HbA1c (Glycated Hb)      6.9       %          4.0 - 5.6 (ELEVATED)\n"
                "Total Cholesterol        232.0     mg/dL      < 200 (HIGH)\n"
                "Triglycerides            198.0     mg/dL      < 150 (HIGH)\n"
                "HDL Cholesterol          36.0      mg/dL      40 - 60 (LOW)\n"
                "LDL Cholesterol (Calc)   156.4     mg/dL      < 100 (HIGH)\n"
                "Serum Creatinine         0.92      mg/dL      0.6 - 1.2 (NORMAL)\n"
                "Resting 12-Lead ECG: Sinus Rhythm, 76 bpm, Non-specific T-wave flattening in lateral leads.\n"
                "Impression: Mixed dyslipidemia, impaired fasting glycemia, and Stage-I HTN evaluation.\n"
            )
        )
        db.add(sample_report)
        db.flush()

        # Extracted Medical Info
        extracted_info = ExtractedMedicalInfo(
            consultation_id=pending_cons.id,
            report_id=sample_report.id,
            diagnosis=["Mixed dyslipidemia", "Impaired fasting glycemia", "Stage-I HTN"],
            medicines=[
                {"name": "Telmisartan", "dosage": "40mg", "frequency": "OD"}
            ],
            test_results=[
                {"test_name": "Fasting Blood Glucose", "result": "138.0", "unit": "mg/dL", "reference_range": "70 - 100", "flag": "HIGH"},
                {"test_name": "HbA1c", "result": "6.9", "unit": "%", "reference_range": "4.0 - 5.6", "flag": "ELEVATED"},
                {"test_name": "Total Cholesterol", "result": "232.0", "unit": "mg/dL", "reference_range": "< 200", "flag": "HIGH"},
                {"test_name": "Triglycerides", "result": "198.0", "unit": "mg/dL", "reference_range": "< 150", "flag": "HIGH"},
                {"test_name": "HDL Cholesterol", "result": "36.0", "unit": "mg/dL", "reference_range": "40 - 60", "flag": "LOW"},
                {"test_name": "LDL Cholesterol", "result": "156.4", "unit": "mg/dL", "reference_range": "< 100", "flag": "HIGH"},
                {"test_name": "Serum Creatinine", "result": "0.92", "unit": "mg/dL", "reference_range": "0.6 - 1.2", "flag": "NORMAL"}
            ],
            laboratory_values={
                "Fasting Blood Glucose": "138.0 mg/dL (HIGH)",
                "HbA1c": "6.9 % (ELEVATED)",
                "Total Cholesterol": "232.0 mg/dL (HIGH)",
                "Triglycerides": "198.0 mg/dL (HIGH)",
                "HDL Cholesterol": "36.0 mg/dL (LOW)",
                "LDL Cholesterol": "156.4 mg/dL (HIGH)",
                "Serum Creatinine": "0.92 mg/dL (NORMAL)"
            },
            procedures=["Resting 12-Lead ECG"],
            surgeries=["Not mentioned"],
            dates=["18-Aug-2026"],
            doctor_names=["Dr. Ananya Roy"],
            hospital_names=["Apollo Diagnostics & Clinical Biochemistry"],
            important_findings=[
                "Abnormal laboratory value: Total Cholesterol is 232.0 mg/dL (HIGH)",
                "Abnormal laboratory value: LDL Cholesterol is 156.4 mg/dL (HIGH)",
                "Abnormal laboratory value: Fasting Blood Glucose is 138.0 mg/dL (HIGH)",
                "Non-specific T-wave flattening in lateral leads on ECG"
            ]
        )
        db.add(extracted_info)
        db.flush()

        # Generate AI Summary for Pending Consultation
        summary_dict = ClinicalIntelligenceEngine.generate_medical_summary(
            patient=patient_user,
            patient_profile=patient_profile,
            answers=answers_records,
            extracted_reports=[extracted_info],
            language="English"
        )

        med_summary = MedicalSummary(
            consultation_id=pending_cons.id,
            chief_complaint=summary_dict["chief_complaint"],
            symptoms=summary_dict["symptoms"],
            duration=summary_dict["duration"],
            severity=summary_dict["severity"],
            past_history=summary_dict["past_history"],
            medications=summary_dict["medications"],
            allergies=summary_dict["allergies"],
            surgeries=summary_dict["surgeries"],
            family_history=summary_dict["family_history"],
            investigation_results=summary_dict["investigation_results"],
            previous_diagnosis=summary_dict["previous_diagnosis"],
            extracted_report_information=summary_dict["extracted_report_information"],
            ai_summary=summary_dict["ai_summary"],
            patient_description=summary_dict["patient_description"],
            doctor_verified=False
        )
        db.add(med_summary)

        # Audit Logs
        db.add(AuditLog(
            user_id=patient_user.id,
            user_email=patient_user.email,
            action="CONSULTATION_CREATED",
            timestamp=datetime.utcnow() - timedelta(minutes=45),
            consultation_id=pending_cons.id
        ))
        db.add(AuditLog(
            user_id=patient_user.id,
            user_email=patient_user.email,
            action="CONSENT_PROVIDED",
            timestamp=datetime.utcnow() - timedelta(minutes=40),
            consultation_id=pending_cons.id
        ))
        db.add(AuditLog(
            user_id=patient_user.id,
            user_email=patient_user.email,
            action="SUBMITTED_TO_DOCTOR",
            timestamp=datetime.utcnow() - timedelta(minutes=20),
            consultation_id=pending_cons.id
        ))

        db.commit()
        print("Database seeding completed successfully with demo records!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
