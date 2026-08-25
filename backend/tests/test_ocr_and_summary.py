from app.services.ocr.medical_parser import MedicalInformationParser
from app.services.ai.clinical_engine import ClinicalIntelligenceEngine
from app.models import Answer, ExtractedMedicalInfo, User, PatientProfile

def test_medical_information_parser():
    sample_text = """
    APOLLO CLINICAL LABS
    Patient: John Doe | Age: 45 | Ref: Dr. Ananya Roy
    Fasting Blood Glucose: 145.0 mg/dL (HIGH)
    HbA1c: 7.2 %
    Total Cholesterol: 240.0 mg/dL
    Diagnosis: Type 2 Diabetes and Dyslipidemia
    Rx: Tab. Metformin 500mg 1-0-1
    """
    extracted = MedicalInformationParser.extract_structured_info(sample_text)
    
    assert "Type 2 Diabetes" in extracted["diagnosis"] or any("diabetes" in d.lower() for d in extracted["diagnosis"])
    assert len(extracted["medicines"]) > 0
    assert extracted["medicines"][0]["name"] == "Metformin"
    assert "Fasting Blood Glucose" in extracted["laboratory_values"]
    assert "Dr. Ananya Roy" in extracted["doctor_names"]

def test_clinical_summary_generation_safety():
    patient = User(name="Test Patient", email="test@example.com")
    profile = PatientProfile(gender="Male", date_of_birth="1980-01-01")
    
    answers = [
        Answer(category="Chief Complaint", question_text="Complaint?", answer="Headache and dizziness for 2 days"),
        Answer(category="Previous illnesses", question_text="Illnesses?", answer="Hypertension"),
        Answer(category="Current medications", question_text="Meds?", answer="Amlodipine 5mg OD"),
        Answer(category="Allergies", question_text="Allergies?", answer="Sulfa drugs")
    ]
    
    extracted_report = ExtractedMedicalInfo(
        diagnosis=["Stage 1 HTN"],
        medicines=[{"name": "Amlodipine", "dosage": "5mg", "frequency": "OD"}],
        test_results=[{"test_name": "Blood Pressure", "result": "140/90", "unit": "mmHg", "reference_range": "120/80", "flag": "HIGH"}],
        laboratory_values={"Blood Pressure": "140/90 mmHg (HIGH)"},
        procedures=[],
        surgeries=[],
        dates=[],
        doctor_names=[],
        hospital_names=[],
        important_findings=["Elevated BP"]
    )
    
    summary = ClinicalIntelligenceEngine.generate_medical_summary(
        patient=patient,
        patient_profile=profile,
        answers=answers,
        extracted_reports=[extracted_report],
        language="English"
    )
    
    assert "Headache" in summary["chief_complaint"]
    assert "Hypertension" in summary["past_history"]
    assert "Sulfa" in summary["allergies"]
    assert "Amlodipine" in summary["medications"]
    assert summary["doctor_verified"] is False
    assert "clinical support only" in summary["ai_summary"].lower()
