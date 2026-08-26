import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings

PROJECT_ROOT = Path(__file__).resolve().parents[3]

class Settings(BaseSettings):
    PROJECT_NAME: str = "MediKiosk"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("JWT_SECRET", "super-secret-medikiosk-key-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./medikiosk.db")

    # CORS
    # CORS
BACKEND_CORS_ORIGINS: List[str] = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "https://medikiosk-1-wqhg.onrender.com",
]
    # File uploads
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    MAX_FILE_SIZE_MB: int = 15
    ALLOWED_FILE_TYPES: List[str] = ["application/pdf", "image/png", "image/jpeg", "image/jpg"]

    # AI Service Configuration
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "clinical_engine")  # clinical_engine, gemini, openai
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    AI_MODEL: str = os.getenv("AI_MODEL", "gemini-1.5-flash")
    TRIAGE_ALERT_POLL_SECONDS: int = int(os.getenv("TRIAGE_ALERT_POLL_SECONDS", "5"))

    # OCR Configuration
    TESSERACT_CMD: str = os.getenv("TESSERACT_CMD", "")

    class Config:
        case_sensitive = True
        env_file = str(PROJECT_ROOT / ".env")

settings = Settings()
