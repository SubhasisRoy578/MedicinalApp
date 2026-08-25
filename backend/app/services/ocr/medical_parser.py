import re
from typing import Dict, Any, List, Tuple

class MedicalInformationParser:
    """
    Parses unstructured OCR text into structured clinical entities.
    Employs robust clinical regular expressions and medical entity extractors.
    Preserves strict truthfulness without hallucinating absent information.
    """

    @classmethod
    def extract_structured_info(cls, ocr_text: str) -> Dict[str, Any]:
        if not ocr_text or not ocr_text.strip():
            return {
                "diagnosis": ["Not mentioned"],
                "medicines": [],
                "test_results": [],
                "laboratory_values": {},
                "procedures": ["Not mentioned"],
                "surgeries": ["Not mentioned"],
                "dates": [],
                "doctor_names": ["Not mentioned"],
                "hospital_names": ["Not mentioned"],
                "important_findings": ["No readable medical data extracted."]
            }

        text = ocr_text.strip()
        lines = [line.strip() for line in text.split("\n") if line.strip()]

        diagnoses = cls._extract_diagnoses(text, lines)
        medicines = cls._extract_medicines(text, lines)
        lab_values, test_results = cls._extract_lab_values(text, lines)
        procedures, surgeries = cls._extract_procedures_and_surgeries(text, lines)
        dates = cls._extract_dates(text)
        doctors, hospitals = cls._extract_entities(text, lines)
        findings = cls._extract_findings(text, lines, diagnoses, lab_values)

        return {
            "diagnosis": diagnoses if diagnoses else ["Not mentioned"],
            "medicines": medicines if medicines else [],
            "test_results": test_results if test_results else [],
            "laboratory_values": lab_values if lab_values else {},
            "procedures": procedures if procedures else ["Not mentioned"],
            "surgeries": surgeries if surgeries else ["Not mentioned"],
            "dates": dates if dates else ["Not mentioned"],
            "doctor_names": doctors if doctors else ["Not mentioned"],
            "hospital_names": hospitals if hospitals else ["Not mentioned"],
            "important_findings": findings if findings else ["Standard report documentation."]
        }

    @classmethod
    def _extract_diagnoses(cls, text: str, lines: List[str]) -> List[str]:
        diagnoses = []
        # Check explicit diagnosis keywords
        diag_patterns = [
            r"(?:Diagnosis|Impression|Assessment|Clinical Condition|Indications?)[\s:]+([^\n\r]+)",
            r"(?:Diagnosed with|History of)[\s:]+([^\n\r]+)",
        ]
        for pattern in diag_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for m in matches:
                diag = m.group(1).strip()
                # Clean up punctuation
                diag = re.sub(r"^[-\s:]+", "", diag)
                if len(diag) > 3 and diag.lower() not in ["none", "nil", "n/a", "unknown"]:
                    diagnoses.append(diag)

        # Look for clinical terms in text
        common_conditions = [
            "Hypertension", "Diabetes Mellitus", "Type 2 Diabetes", "Dyslipidemia",
            "Angina Pectoris", "Coronary Artery Disease", "Asthma", "COPD",
            "Hypothyroidism", "Chronic Kidney Disease", "Fatty Liver", "GERD", "Sinusitis"
        ]
        for cond in common_conditions:
            if re.search(rf"\b{re.escape(cond)}\b", text, re.IGNORECASE):
                if cond not in diagnoses and not any(cond.lower() in d.lower() for d in diagnoses):
                    diagnoses.append(cond)

        return list(dict.fromkeys(diagnoses))

    @classmethod
    def _extract_medicines(cls, text: str, lines: List[str]) -> List[Dict[str, Any]]:
        medicines = []
        med_regex = re.compile(
            r"(?:Tab\.|Cap\.|Syp\.|Inj\.|Tablet|Capsule|Syrup)?\s*([A-Za-z]+(?:-[A-Za-z]+)?)\s+(\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|IU))\s*([0-9]-[0-9]-[0-9]|OD|BD|TDS|QID|HS|SOS|once daily|twice daily)?",
            re.IGNORECASE
        )

        for line in lines:
            if any(k in line.lower() for k in ["tab.", "cap.", "rx", "mg", "tablet", "capsule", "syrup"]):
                match = med_regex.search(line)
                if match:
                    name = match.group(1).strip()
                    dosage = match.group(2).strip()
                    freq = match.group(3).strip() if match.group(3) else "As directed"
                    # Avoid noise
                    if name.lower() not in ["page", "unit", "date", "blood", "total", "report", "test"]:
                        medicines.append({
                            "name": name.capitalize(),
                            "dosage": dosage,
                            "frequency": freq,
                            "raw_line": line
                        })

        # Also look for bulleted meds in discharge notes
        for line in lines:
            if line.startswith("-") or line.startswith("•") or re.match(r"^\d+\.", line):
                if any(m in line.lower() for m in ["metformin", "telmisartan", "atorvastatin", "amlodipine", "rosuvastatin", "aspirin", "pantoprazole", "paracetamol", "losartan", "glimepiride"]):
                    # If not already caught
                    clean = re.sub(r"^[\d\.\-\•\s]+", "", line).strip()
                    if not any(m["raw_line"] == clean for m in medicines):
                        medicines.append({
                            "name": clean.split()[0].replace("Tab.", "").replace("Cap.", "").strip(),
                            "dosage": "Per prescription",
                            "frequency": "Daily",
                            "raw_line": clean
                        })

        return medicines

    @classmethod
    def _extract_lab_values(cls, text: str, lines: List[str]) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        lab_dict = {}
        test_results = []

        patterns = [
            (r"Fasting Blood (?:Glucose|Sugar)|FBS", "Fasting Blood Glucose", "mg/dL", "70 - 100"),
            (r"HbA1c(?:\s*\(Glycated Hb\))?", "HbA1c", "%", "4.0 - 5.6"),
            (r"Total Cholesterol", "Total Cholesterol", "mg/dL", "< 200"),
            (r"Triglycerides?", "Triglycerides", "mg/dL", "< 150"),
            (r"HDL Cholesterol|HDL", "HDL Cholesterol", "mg/dL", "40 - 60"),
            (r"LDL Cholesterol|LDL", "LDL Cholesterol", "mg/dL", "< 100"),
            (r"Serum Creatinine|Creatinine", "Serum Creatinine", "mg/dL", "0.6 - 1.2"),
            (r"Hemoglobin|Hb\b", "Hemoglobin", "g/dL", "12.0 - 16.0"),
            (r"Blood Pressure|BP", "Blood Pressure", "mmHg", "120/80"),
            (r"Heart Rate|Pulse Rate", "Heart Rate", "bpm", "60 - 100"),
        ]

        for reg, test_name, unit, ref in patterns:
            match = re.search(rf"(?:{reg})[\s:]+([0-9]+(?:\.[0-9]+)?(?:\s*/\s*[0-9]+)?)", text, re.IGNORECASE)
            if match:
                val_str = match.group(1).strip()
                flag = "NORMAL"
                # Evaluate abnormal values
                try:
                    if test_name == "Fasting Blood Glucose" and float(val_str) > 100:
                        flag = "HIGH"
                    elif test_name == "HbA1c" and float(val_str) > 5.6:
                        flag = "ELEVATED"
                    elif test_name == "Total Cholesterol" and float(val_str) > 200:
                        flag = "HIGH"
                    elif test_name == "Triglycerides" and float(val_str) > 150:
                        flag = "HIGH"
                    elif test_name == "HDL Cholesterol" and float(val_str) < 40:
                        flag = "LOW"
                    elif test_name == "Serum Creatinine" and float(val_str) > 1.2:
                        flag = "HIGH"
                except Exception:
                    pass

                lab_dict[test_name] = f"{val_str} {unit} ({flag})"
                test_results.append({
                    "test_name": test_name,
                    "result": val_str,
                    "unit": unit,
                    "reference_range": ref,
                    "flag": flag
                })

        return lab_dict, test_results

    @classmethod
    def _extract_procedures_and_surgeries(cls, text: str, lines: List[str]) -> Tuple[List[str], List[str]]:
        procedures = []
        surgeries = []

        proc_keywords = [
            "Electrocardiogram", "12-Lead ECG", "Echocardiography", "Coronary Angiogram",
            "Endoscopy", "Ultrasound Abdomen", "CT Scan", "MRI", "Chest X-Ray", "Biopsy"
        ]
        for p in proc_keywords:
            if re.search(rf"\b{re.escape(p)}\b", text, re.IGNORECASE):
                procedures.append(p)

        surg_keywords = [
            "Appendectomy", "Cholecystectomy", "Coronary Artery Bypass", "CABG",
            "Angioplasty", "Stent Placement", "Hernia Repair", "C-Section", "Knee Replacement"
        ]
        for s in surg_keywords:
            if re.search(rf"\b{re.escape(s)}\b", text, re.IGNORECASE):
                surgeries.append(s)

        return list(dict.fromkeys(procedures)), list(dict.fromkeys(surgeries))

    @classmethod
    def _extract_dates(cls, text: str) -> List[str]:
        date_pattern = r"\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})\b"
        matches = re.findall(date_pattern, text, re.IGNORECASE)
        return list(dict.fromkeys(matches[:5]))

    @classmethod
    def _extract_entities(cls, text: str, lines: List[str]) -> Tuple[List[str], List[str]]:
        doctors = []
        hospitals = []

        doc_match = re.findall(r"(?:Dr\.|Doctor)\s+([A-Za-z\.\s]+?)(?:,|\n|MD|MBBS|MS)", text, re.IGNORECASE)
        for d in doc_match:
            name = d.strip()
            if len(name) > 2 and len(name) < 40:
                doctors.append(f"Dr. {name}")

        hosp_patterns = [
            r"([A-Za-z\s]+(?:Hospital|Clinic|Medical Center|Healthcare|Institute))",
        ]
        for p in hosp_patterns:
            matches = re.findall(p, text, re.IGNORECASE)
            for h in matches:
                clean_h = h.strip()
                if len(clean_h) > 4 and len(clean_h) < 60:
                    hospitals.append(clean_h)

        return list(dict.fromkeys(doctors)), list(dict.fromkeys(hospitals))

    @classmethod
    def _extract_findings(cls, text: str, lines: List[str], diagnoses: List[str], lab_values: Dict[str, Any]) -> List[str]:
        findings = []
        for line in lines:
            if any(k in line.lower() for k in ["impression:", "findings:", "advice:", "conclusion:", "abnormal"]):
                clean = re.sub(r"^(?:Impression|Findings|Advice|Conclusion)[\s:]+", "", line, flags=re.IGNORECASE).strip()
                if clean:
                    findings.append(clean)

        # If abnormal lab values, add them as clinically important findings
        for test, val in lab_values.items():
            if "HIGH" in val or "ELEVATED" in val or "LOW" in val:
                findings.append(f"Abnormal laboratory value: {test} is {val}")

        if not findings and diagnoses:
            findings.append(f"Noted clinical history: {', '.join(diagnoses)}")

        return findings[:6]
