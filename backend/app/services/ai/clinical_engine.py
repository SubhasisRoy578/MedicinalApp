from typing import List, Dict, Any, Optional
from datetime import datetime
from app.models import Answer, MedicalReport, ExtractedMedicalInfo, User

class ClinicalIntelligenceEngine:
    """
    Built-in high-accuracy Clinical Reasoning & Synthesis Engine.
    Combines questionnaire answers and multi-document OCR extractions
    into a standardized clinical summary adhering to HL7/FHIR-compatible
    medical documentation structure.
    """

    @classmethod
    def generate_medical_summary(
        cls,
        patient: Optional[User],
        patient_profile: Optional[Any],
        answers: List[Answer],
        extracted_reports: List[ExtractedMedicalInfo],
        language: str = "English"
    ) -> Dict[str, Any]:
        # Categorize patient answers
        categorized_answers: Dict[str, List[str]] = {}
        for ans in answers:
            cat = ans.category or "General"
            if cat not in categorized_answers:
                categorized_answers[cat] = []
            categorized_answers[cat].append(ans.answer.strip())

        # Extract specific clinical sections
        chief_complaint = cls._first_or(categorized_answers.get("Chief Complaint"), "General health consultation requested")
        duration = cls._first_or(categorized_answers.get("Duration"), "Onset details not specified")
        severity = cls._first_or(categorized_answers.get("Severity"), "Not graded by patient")
        
        # Symptoms synthesis
        symptom_notes = []
        if "Symptoms" in categorized_answers:
            symptom_notes.extend(categorized_answers["Symptoms"])
        if not symptom_notes:
            symptom_notes.append(chief_complaint)
        symptoms_str = "; ".join(symptom_notes)

        # Past Medical History
        past_hx = []
        if "Previous illnesses" in categorized_answers:
            for item in categorized_answers["Previous illnesses"]:
                if not any(k in item.lower() for k in ["none", "no known"]):
                    past_hx.append(item)
        
        # Merge prior diagnoses found in uploaded OCR reports
        report_diagnoses = []
        for rep in extracted_reports:
            if rep.diagnosis:
                for d in rep.diagnosis:
                    if d not in ["Not mentioned", "Unknown"] and d not in report_diagnoses:
                        report_diagnoses.append(d)

        combined_past_history = ", ".join(past_hx) if past_hx else "No significant chronic medical illnesses reported by patient."
        if report_diagnoses:
            combined_past_history += f" (Prior records document: {', '.join(report_diagnoses)})"

        # Current Medications
        med_list = []
        if "Current medications" in categorized_answers:
            for m in categorized_answers["Current medications"]:
                if not any(k in m.lower() for k in ["none", "no", "never"]):
                    med_list.append(m)

        # Merge medicines found in uploaded prescriptions/reports
        report_meds = []
        for rep in extracted_reports:
            if rep.medicines:
                for m in rep.medicines:
                    if isinstance(m, dict):
                        m_str = f"{m.get('name', '')} {m.get('dosage', '')} ({m.get('frequency', '')})".strip()
                        if m_str and m_str not in report_meds:
                            report_meds.append(m_str)

        if med_list or report_meds:
            meds_str = "; ".join(filter(None, [", ".join(med_list), f"From uploaded records: {', '.join(report_meds)}" if report_meds else ""]))
        else:
            meds_str = "No active daily medications reported."

        # Allergies
        allergies_list = []
        if "Allergies" in categorized_answers:
            allergies_list.extend(categorized_answers["Allergies"])
        allergies_str = ", ".join(allergies_list) if allergies_list else "No known drug or food allergies (NKDA) reported."

        # Previous Surgeries
        surgeries_list = []
        if "Previous surgeries" in categorized_answers:
            for s in categorized_answers["Previous surgeries"]:
                if not any(k in s.lower() for k in ["no prior", "no", "nil"]):
                    surgeries_list.append(s)
        for rep in extracted_reports:
            if rep.surgeries:
                for s in rep.surgeries:
                    if s not in ["Not mentioned", "Unknown"] and s not in surgeries_list:
                        surgeries_list.append(f"{s} (from report)")

        surgeries_str = ", ".join(surgeries_list) if surgeries_list else "No prior major surgical interventions reported."

        # Family History
        fam_list = categorized_answers.get("Family history", [])
        family_str = ", ".join(fam_list) if fam_list else "Non-contributory / No major familial illnesses reported."

        # Investigation Results from OCR
        investigations = []
        extracted_findings = []
        for rep in extracted_reports:
            if rep.test_results:
                for tr in rep.test_results:
                    if isinstance(tr, dict):
                        t_str = f"{tr.get('test_name')}: {tr.get('result')} {tr.get('unit')} [Ref: {tr.get('reference_range')}] - {tr.get('flag')}"
                        investigations.append(t_str)
            if rep.procedures and rep.procedures != ["Not mentioned"]:
                investigations.append(f"Procedures noted: {', '.join(rep.procedures)}")
            if rep.important_findings:
                for f in rep.important_findings:
                    if f not in ["Not mentioned"] and f not in extracted_findings:
                        extracted_findings.append(f)

        investigations_str = "\n".join(investigations) if investigations else "No previous laboratory or diagnostic imaging reports uploaded."

        # Patient's Own Description
        patient_remarks = categorized_answers.get("Other relevant information", [])
        lifestyle_remarks = categorized_answers.get("Lifestyle", [])
        patient_desc_parts = []
        if patient_remarks:
            patient_desc_parts.append(f"Patient note: {'; '.join(patient_remarks)}")
        if lifestyle_remarks:
            patient_desc_parts.append(f"Lifestyle factors: {'; '.join(lifestyle_remarks)}")
        patient_description = " | ".join(patient_desc_parts) if patient_desc_parts else "Patient completed pre-consultation guided questionnaire."

        # AYUSH documentation mode: preserve self-reported/prior-practitioner information
        # without inferring Prakriti/Vikriti or making an AYUSH diagnosis.
        ayush_assessment = {}
        for category, key in [
            ("AYUSH - Prakriti", "prakriti"),
            ("AYUSH - Vikriti", "vikriti"),
            ("AYUSH - Agni", "agni"),
            ("AYUSH - Koshtha", "koshtha"),
            ("AYUSH - Ahara", "ahara"),
            ("AYUSH - Vihara", "vihara"),
        ]:
            values = categorized_answers.get(category, [])
            if values:
                ayush_assessment[key] = values

        # Previous Diagnosis
        prev_diag_str = ", ".join(report_diagnoses) if report_diagnoses else "No past diagnostic records provided."

        # Overall AI Summary Synthesis
        p_name = patient.name if patient else "Patient"
        p_gender = getattr(patient_profile, "gender", "Unspecified") if patient_profile else "Unspecified"
        p_dob = getattr(patient_profile, "date_of_birth", "Not recorded") if patient_profile else "Not recorded"

        ai_summary_text = (
            f"CLINICAL PRE-CONSULTATION SUMMARY FOR CONSULTING PHYSICIAN:\n"
            f"Patient {p_name} ({p_gender}, DOB: {p_dob}) presents with a primary complaint of '{chief_complaint}' lasting {duration} with {severity} intensity. "
            f"Reported symptoms include {symptoms_str}. "
            f"Past medical history is notable for: {combined_past_history}. "
            f"Current medication regimen: {meds_str}. "
            f"Allergy status: {allergies_str}. "
            f"Prior surgical history: {surgeries_str}. "
            f"Family history: {family_str}.\n"
        )
        if investigations:
            ai_summary_text += f"Uploaded Diagnostic Records Summary:\n{investigations_str}\n"
        if extracted_findings:
            ai_summary_text += f"Key Clinical Findings: {'; '.join(extracted_findings)}.\n"

        if ayush_assessment:
            ai_summary_text += (
                "AYUSH INTAKE (patient-reported / previously documented; not an AI assessment):\n"
                + "\n".join(
                    f"{key.title()}: {', '.join(values)}"
                    for key, values in ayush_assessment.items()
                )
                + "\n"
            )

        ai_summary_text += (
            "\n[NOTE: AI-generated summaries are for clinical support only and must be reviewed "
            "and verified by a qualified healthcare professional. Final clinical diagnosis and "
            "treatment planning remain under the exclusive direction of the attending physician.]"
        )

        return {
            "chief_complaint": chief_complaint,
            "symptoms": symptoms_str,
            "duration": duration,
            "severity": severity,
            "past_history": combined_past_history,
            "medications": meds_str,
            "allergies": allergies_str,
            "surgeries": surgeries_str,
            "family_history": family_str,
            "investigation_results": investigations_str,
            "previous_diagnosis": prev_diag_str,
            "extracted_report_information": {
                "ayush_assessment": ayush_assessment,
                "diagnoses": report_diagnoses,
                "medications": report_meds,
                "investigations": investigations,
                "findings": extracted_findings
            },
            "ai_summary": ai_summary_text,
            "patient_description": patient_description,
            "doctor_notes": None,
            "physical_examination": None,
            "provisional_diagnosis": None,
            "prescription_plan": None,
            "doctor_verified": False
        }

    @staticmethod
    def _first_or(items: Optional[List[str]], default: str) -> str:
        if items and len(items) > 0 and items[0].strip():
            return items[0].strip()
        return default
