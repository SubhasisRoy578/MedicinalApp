import json
import logging
import httpx
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.services.ai.clinical_engine import ClinicalIntelligenceEngine
from app.services.ai.prompts import MEDICAL_SUMMARY_SYSTEM_PROMPT, REPORT_EXTRACTION_PROMPT

logger = logging.getLogger(__name__)

class AIService:
    @classmethod
    async def generate_summary(
        cls,
        patient: Optional[Any],
        patient_profile: Optional[Any],
        answers: List[Any],
        extracted_reports: List[Any],
        language: str = "English"
    ) -> Dict[str, Any]:
        # If Gemini / OpenAI API key is set and provider requested, attempt LLM call
        if settings.GEMINI_API_KEY and settings.AI_PROVIDER == "gemini":
            try:
                result = await cls._call_gemini_summary(patient, patient_profile, answers, extracted_reports, language)
                if result:
                    return result
            except Exception as e:
                logger.warning(f"Gemini API call failed, falling back to ClinicalEngine: {e}")

        elif settings.OPENAI_API_KEY and settings.AI_PROVIDER == "openai":
            try:
                result = await cls._call_openai_summary(patient, patient_profile, answers, extracted_reports, language)
                if result:
                    return result
            except Exception as e:
                logger.warning(f"OpenAI API call failed, falling back to ClinicalEngine: {e}")

        # High reliability clinical engine
        return ClinicalIntelligenceEngine.generate_medical_summary(
            patient=patient,
            patient_profile=patient_profile,
            answers=answers,
            extracted_reports=extracted_reports,
            language=language
        )

    @classmethod
    async def _call_gemini_summary(cls, patient, patient_profile, answers, extracted_reports, language) -> Optional[Dict[str, Any]]:
        # Payload for Gemini API
        prompt_content = f"Patient: {getattr(patient, 'name', 'Patient')}\n"
        prompt_content += f"Language: {language}\n"
        prompt_content += "Questionnaire Answers:\n"
        for a in answers:
            prompt_content += f"- [{a.category}] {a.question_text}: {a.answer}\n"
        prompt_content += "Report Extractions:\n"
        for r in extracted_reports:
            prompt_content += f"- Diagnoses: {r.diagnosis}, Meds: {r.medicines}, Labs: {r.laboratory_values}\n"

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.AI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{
                "parts": [
                    {"text": MEDICAL_SUMMARY_SYSTEM_PROMPT},
                    {"text": prompt_content}
                ]
            }],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.2
            }
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(text)
        return None

    @classmethod
    async def _call_openai_summary(cls, patient, patient_profile, answers, extracted_reports, language) -> Optional[Dict[str, Any]]:
        prompt_content = f"Patient: {getattr(patient, 'name', 'Patient')}\n"
        prompt_content += f"Language: {language}\n"
        for a in answers:
            prompt_content += f"- [{a.category}] {a.question_text}: {a.answer}\n"
        for r in extracted_reports:
            prompt_content += f"- Diagnoses: {r.diagnosis}, Meds: {r.medicines}, Labs: {r.laboratory_values}\n"

        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": MEDICAL_SUMMARY_SYSTEM_PROMPT},
                {"role": "user", "content": prompt_content}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                return json.loads(content)
        return None
