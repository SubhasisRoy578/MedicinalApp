# MediKiosk — AI-Powered Patient Health Consultation & Medical History Assistant

> **"Better medical history. Smarter consultations."**  
> MediKiosk prepares a structured, clinically organized patient medical history before the doctor consultation, enabling physicians to dedicate more time to clinical examination, differential diagnosis, and personalized patient care.

---

## 🌟 1. Project Overview & Clinical Flow

In traditional outpatient clinical practice, physicians spend 40–60% of consultation time on manual documentation, gathering past medical history, noting chronic conditions, deciphering past prescriptions, and typing lab results.

**MediKiosk** streamlines this entire intake pipeline:
1. **Arrival & Consent:** Patient reviews medical disclaimer and provides informed digital consent.
2. **Multilingual Selection:** Patient chooses preferred language (**English**, **हिन्दी (Hindi)**, or **বাংলা (Bengali)**).
3. **Adaptive AI Interview:** AI conducts an intelligent, branching clinical interview via **speech-to-text (voice)** or **text** with instant quick-reply buttons.
4. **Medical Report Upload:** Patient uploads past lab reports, ECGs, prescriptions, or discharge summaries (PDF/PNG/JPG).
5. **Real OCR Extraction:** Pipeline extracts raw text and converts it into structured diagnostic entities (diagnoses, medications, laboratory values like FBS, HbA1c, Lipids, Creatinine).
6. **AI Medical History Synthesis:** AI combines questionnaire answers and OCR parameters into a comprehensive clinical summary following strict non-diagnostic safety directives.
7. **Patient Pre-Review:** Patient reviews the summary, adds personal remarks, and submits to the doctor queue.
8. **Doctor Verification Studio:** The consulting doctor inspects the summary with provenance badges (`[PATIENT PROVIDED]`, `[OCR EXTRACTED]`, `[AI ORGANIZED]`, `[DOCTOR VERIFIED]`), edits any field inline, enters physical examination findings & prescriptions, signs off with clinical verification, and completes the consultation.
9. **Audit Trail:** Every doctor modification and action is immutably logged with timestamp and author ID.

---

## 🛠️ 2. Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript & Vite
- **Styling:** Tailwind CSS (custom healthcare palette, soft shadows, responsive typography)
- **Icons:** Lucide React
- **Routing:** React Router v6 (Role-based Protected Route Guards for Patient, Doctor, and Admin)
- **Audio & Speech:** Browser Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`) with animated recording waveform and graceful fallback to text
- **HTTP Client:** Fetch API with JWT interceptors, auto-token refresh, and structured error handling

### Backend
- **Framework:** Python 3.12, FastAPI (REST API with OpenAPI /docs Swagger documentation)
- **Data Models & Validation:** Pydantic v2 & Pydantic Settings
- **ORM & Database:** SQLAlchemy 2.0 with auto-migrating SQLite local fallback and PostgreSQL support
- **Authentication & Security:** Passlib & Bcrypt password hashing, JWT (JSON Web Tokens), Role-Based Access Control (RBAC)
- **OCR Engine:** Multi-engine pipeline using `pypdf`, PyTesseract, and clinical regex extractors
- **AI Service:** Pluggable AI engine supporting Gemini, OpenAI, and a built-in deterministic Clinical Intelligence Engine

---

## 🏗️ 3. Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PATIENT JOURNEY                               │
│                                                                         │
│  [Register / Login] ──► [Informed Consent] ──► [Choose Language]        │
│                                                       │                 │
│                                                       ▼                 │
│  [Upload Medical Reports] ◄── [Adaptive AI Medical Interview]           │
│           │                   (Voice Input / Text / Quick Buttons)      │
│           ▼                                                             │
│   [Document OCR Engine]                                                 │
│           │                                                             │
│           ▼                                                             │
│  [Structured Medical Extraction]                                        │
│           │                                                             │
│           ▼                                                             │
│  [AI Medical History Summary Synthesis] ──► [Patient Pre-Review]        │
│                                                       │                 │
│                                                       ▼                 │
│                                            [Submit to Doctor Queue]     │
└───────────────────────────────────────────────────────┬─────────────────┘
                                                        │
                                                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       DOCTOR VERIFICATION STUDIO                        │
│                                                                         │
│  [Doctor Dashboard] ──► [Open Pending Consultation]                     │
│                                    │                                    │
│                                    ▼                                    │
│  [Inspect Data Provenance: PATIENT | OCR | AI | DOCTOR]                 │
│                                    │                                    │
│                                    ▼                                    │
│  [Inline Field-by-Field Summary Editing]                                │
│  [Inspect Raw OCR Text & Original Diagnostic Documents]                 │
│  [Add Physical Exam Findings, Diagnosis & Prescription Plan]            │
│                                    │                                    │
│                                    ▼                                    │
│  [Attest & Verify Medical History] ──► [Complete Consultation]          │
│                                    │                                    │
│                                    ▼                                    │
│                         [Immutable Audit Log]                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔑 4. Demo Credentials & Quick Switcher

For instant testing and evaluation without manual signup:

| Persona | Email | Password | Role | Description |
|---|---|---|---|---|
| **Demo Patient** | `patient@medikiosk.com` | `Patient@123` | `PATIENT` | Preloaded with chest tightness symptoms, past HTN, and Lipid Blood Panel OCR report |
| **Demo Doctor** | `doctor@medikiosk.com` | `Doctor@123` | `DOCTOR` | Dr. Ananya Roy, MD (Cardiologist), has access to pending review queue |
| **Demo Admin** | `admin@medikiosk.com` | `Admin@123` | `ADMIN` | Full access to user management, system statistics, and audit logs |

> 💡 **Demo Switcher:** The top navigation bar includes a **"Demo Switcher"** button for 1-click persona switching without typing!

---

## 🚀 5. Quick Start (Local Development)

### Prerequisites
- **Python:** 3.10+ (tested on Python 3.12)
- **Node.js:** 18+ (tested on Node v24 / v20)
- **npm:** 9+

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   python -m pip install -r requirements.txt
   ```
3. Run the FastAPI development server:
   ```bash
   python -m uvicorn app.main:app --reload --port 8000
   ```
   *The database (`medikiosk.db`) and seed demo records will be automatically initialized on startup!*
   - Backend API: `http://localhost:8000`
   - Interactive Swagger Docs: `http://localhost:8000/docs`

### Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser at `http://localhost:5173`.

---

## 🐳 6. Running with Docker & Docker Compose

To build and run all services (PostgreSQL, Backend API, and Frontend SPA) with one command:

```bash
docker compose up --build
```

- **Frontend Application:** `http://localhost:3000`
- **Backend REST API:** `http://localhost:8000`
- **API Swagger Documentation:** `http://localhost:8000/docs`

---

## 🧪 7. Automated Backend Testing

Run the full automated test suite with pytest:

```bash
python -m pytest backend/tests -v
```

The test suite validates:
- User registration, password hashing with direct Bcrypt, JWT token creation, and invalid credential rejection.
- Complete consultation lifecycle: Creation $\rightarrow$ Consent $\rightarrow$ Answer submission $\rightarrow$ AI summary generation $\rightarrow$ Doctor clinical notes $\rightarrow$ Doctor verification $\rightarrow$ Consultation completion.
- Multilingual questionnaire engine (English, Hindi, Bengali) and adaptive branching logic (pain follow-up trigger/skip).
- OCR text parsing, structured clinical entity extraction, and clinical safety non-hallucination compliance.

---

## 🛡️ 8. AI Safety & Privacy Policy

MediKiosk is strictly designed around medical AI safety principles:
- **Non-Diagnostic Role:** The AI assistant strictly collects, organizes, and structures clinical data. It **never diagnoses** diseases or **prescribes medications**.
- **No Hallucinations:** If a symptom or lab value is missing from patient inputs or reports, the system marks it as `"Not reported"` or `"Not mentioned"`.
- **Physician Attestation:** All clinical summaries are marked as unverified until an authorized physician reviews and signs off on the record.
- **Audit Logging:** Every edit made to summary fields, doctor notes, and verification stamps is recorded in the `audit_logs` table.

---

## 📄 9. License

This project is developed for clinical intake acceleration and healthcare workflow optimization under the MIT License.
