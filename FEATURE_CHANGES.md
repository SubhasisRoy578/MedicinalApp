# MediKiosk — Added Features

This source build adds:
1. Emergency/red-flag triage screening with an internal hospital triage queue.
2. General Medical OPD vs AYUSH OPD consultation mode.
3. AYUSH intake questions for Prakriti, Vikriti, Agni, Koshtha, Ahara and Vihara.
4. Improved browser voice-to-text with microphone permission handling, Hindi/Bengali/English-India locale mapping, final/interim transcript handling, and clearer errors.

Important:
- The emergency screen is a safety escalation, not a diagnosis.
- It creates an internal triage alert visible to Doctor/Admin dashboards.
- Configure a real hospital notification channel (email/SMS/pager/webhook) before production deployment if required.
- Do not put real API keys into source control.
\n\n## Emergency Doctor Contact\n- Added an Emergency Medical Assistance panel to the patient portal.\n- The portal loads active doctors and prefers the doctor assigned to the patient's latest consultation.\n- Added a one-tap `tel:` Call Doctor button using the doctor's configured phone number.\n- Added a safety note directing life-threatening emergencies to local emergency medical services.\n