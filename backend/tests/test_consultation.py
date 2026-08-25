import pytest
from fastapi.testclient import TestClient

def test_full_consultation_lifecycle(client: TestClient):
    # 1. Register a test patient
    patient_payload = {
        "name": "Amit Kumar",
        "email": "amit.kumar@example.com",
        "password": "Password@123",
        "role": "PATIENT",
        "preferred_language": "Hindi"
    }
    p_resp = client.post("/api/auth/register", json=patient_payload)
    p_token = p_resp.json()["access_token"]
    p_headers = {"Authorization": f"Bearer {p_token}"}

    # 2. Register a test doctor
    doctor_payload = {
        "name": "Dr. Rajesh Gupta",
        "email": "dr.gupta@example.com",
        "password": "DoctorPassword@123",
        "role": "DOCTOR",
        "specialization": "General Medicine"
    }
    d_resp = client.post("/api/auth/register", json=doctor_payload)
    d_token = d_resp.json()["access_token"]
    d_headers = {"Authorization": f"Bearer {d_token}"}

    # 3. Patient creates a consultation
    cons_resp = client.post("/api/consultations", json={"language": "Hindi"}, headers=p_headers)
    assert cons_resp.status_code == 201
    cons_id = cons_resp.json()["id"]
    assert cons_resp.json()["status"] == "CREATED"
    assert cons_resp.json()["consent_given"] is False

    # 4. Patient provides consent
    consent_resp = client.post(
        f"/api/consultations/{cons_id}/consent",
        json={"consent_given": True, "language": "Hindi"},
        headers=p_headers
    )
    assert consent_resp.status_code == 200
    assert consent_resp.json()["consent_given"] is True
    assert consent_resp.json()["status"] == "IN_PROGRESS"

    # 5. Patient answers questions
    ans1 = client.post(
        f"/api/consultations/{cons_id}/questionnaire/answers",
        json={
            "question_id": 1,
            "question_text": "What is your main complaint?",
            "category": "Chief Complaint",
            "answer": "Severe fever and body pain for 3 days",
            "answer_type": "text"
        },
        headers=p_headers
    )
    assert ans1.status_code == 201

    # 6. Generate summary
    sum_resp = client.post(f"/api/consultations/{cons_id}/summary/generate", headers=p_headers)
    assert sum_resp.status_code == 200
    assert "fever" in sum_resp.json()["chief_complaint"].lower()

    # 7. Patient submits to doctor
    sub_resp = client.post(f"/api/consultations/{cons_id}/submit-to-doctor", headers=p_headers)
    assert sub_resp.status_code == 200
    assert sub_resp.json()["status"] == "WAITING_FOR_DOCTOR"

    # 8. Doctor reviews and saves clinical notes
    notes_resp = client.post(
        f"/api/consultations/{cons_id}/doctor-notes",
        json={
            "doctor_notes": "Patient appears febrile. Throat mildly hyperemic.",
            "provisional_diagnosis": "Viral Pyrexia / Upper Respiratory Infection",
            "prescription_plan": "Tab. Paracetamol 650mg TDS x 3 days, adequate hydration."
        },
        headers=d_headers
    )
    assert notes_resp.status_code == 200

    # 9. Doctor verifies summary
    verify_resp = client.post(
        f"/api/consultations/{cons_id}/verify",
        json={"doctor_notes": "Verified and clinical examination performed."},
        headers=d_headers
    )
    assert verify_resp.status_code == 200
    assert verify_resp.json()["status"] == "VERIFIED"
    assert verify_resp.json()["doctor_verified"] is True

    # 10. Complete consultation
    complete_resp = client.post(f"/api/consultations/{cons_id}/complete", headers=d_headers)
    assert complete_resp.status_code == 200
    assert complete_resp.json()["status"] == "COMPLETED"
