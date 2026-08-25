"""
Deterministic safety screen for the pre-consultation workflow.

This is deliberately NOT a diagnostic model. It looks for combinations of
patient-reported red-flag phrases and creates an internal triage alert so
hospital staff can assess the patient promptly.
"""
from __future__ import annotations

import re
from typing import Iterable, List, Dict, Any, Optional


def _normalise(text: str) -> str:
    text = (text or "").lower()
    return re.sub(r"\s+", " ", text).strip()


RED_FLAG_RULES = [
    {
        "name": "Chest pain with breathing difficulty",
        "patterns": [
            [r"\bchest pain\b", r"\b(short(ness)? of breath|difficulty breathing|breathless|can't breathe|cannot breathe)\b"],
            [r"\bsevere chest pain\b", r"\bbreath(ing)? difficulty\b"],
        ],
        "reason": "Patient reported chest pain together with breathing difficulty.",
    },
    {
        "name": "Possible stroke warning signs",
        "patterns": [
            [r"\bface droop(ping)?\b", r"\b(weakness|numbness)\b"],
            [r"\b(speech difficulty|can't speak|cannot speak|slurred speech)\b", r"\b(weakness|numbness)\b"],
            [r"\bsudden\b", r"\b(one[- ]sided weakness|one side weak|arm weakness|leg weakness)\b"],
        ],
        "reason": "Patient reported a sudden combination of neurological warning signs.",
    },
    {
        "name": "Severe bleeding",
        "patterns": [
            [r"\b(severe|heavy|uncontrolled)\b", r"\b(bleeding|blood loss)\b"],
        ],
        "reason": "Patient reported severe or uncontrolled bleeding.",
    },
    {
        "name": "Loss of consciousness",
        "patterns": [
            [r"\b(fainted|fainting|passed out|unconscious|lost consciousness)\b"],
        ],
        "reason": "Patient reported loss of consciousness or fainting.",
    },
    {
        "name": "Severe allergic reaction warning signs",
        "patterns": [
            [r"\b(swelling|swollen)\b", r"\b(lips|tongue|throat|face)\b", r"\b(breathing difficulty|difficulty breathing|can't breathe)\b"],
        ],
        "reason": "Patient reported swelling involving the face/throat together with breathing difficulty.",
    },
]


def detect_emergency(answers: Iterable[Any], latest_text: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Returns a structured alert when a red-flag combination is present.

    We use the complete answer history so a patient can say "chest pain" in
    one answer and "difficulty breathing" in a later answer.
    """
    texts: List[str] = []
    for answer in answers:
        value = getattr(answer, "answer", None)
        if value:
            texts.append(_normalise(value))

    if latest_text:
        texts.append(_normalise(latest_text))

    combined = " ".join(t for t in texts if t)

    for rule in RED_FLAG_RULES:
        for pattern_group in rule["patterns"]:
            if all(re.search(pattern, combined) for pattern in pattern_group):
                evidence = []
                for term in pattern_group:
                    match = re.search(term, combined)
                    if match:
                        evidence.append(match.group(0))
                return {
                    "severity": "URGENT",
                    "rule": rule["name"],
                    "reason": rule["reason"],
                    "evidence": evidence,
                }

    return None
