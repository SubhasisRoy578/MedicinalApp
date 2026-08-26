import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import Base, engine
from sqlalchemy import inspect, text
from app.api import (
    auth_router,
    patients_router,
    doctors_router,
    consultations_router,
    questionnaire_router,
    reports_router,
    summaries_router,
    audit_router,
    admin_router,
    triage_router
)
from app.seed.seed_data import seed_database

# Initialize database schema and apply the small local SQLite migration needed
# when upgrading an existing Medikiosk installation.
Base.metadata.create_all(bind=engine)
try:
    inspector = inspect(engine)
    consultation_columns = {col["name"] for col in inspector.get_columns("consultations")}
    if "mode" not in consultation_columns:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE consultations ADD COLUMN mode VARCHAR(20) NOT NULL DEFAULT 'GENERAL'"))
except Exception as e:
    print(f"Schema compatibility note: {e}")

# Auto seed default demo data if empty
try:
    seed_database()
except Exception as e:
    print(f"Seed note: {e}")

app = FastAPI(
    title="MediKiosk Backend API",
    description="AI-Powered Patient Health Consultation & Medical History Assistant",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=[],
    allow_headers=[],
)

# Mount uploads directory for static document previews if needed
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(patients_router, prefix=settings.API_V1_STR)
app.include_router(doctors_router, prefix=settings.API_V1_STR)
app.include_router(consultations_router, prefix=settings.API_V1_STR)
app.include_router(questionnaire_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(summaries_router, prefix=settings.API_V1_STR)
app.include_router(audit_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(triage_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "name": "MediKiosk API",
        "status": "online",
        "tagline": "Better medical history. Smarter consultations.",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "medikiosk-backend"}
