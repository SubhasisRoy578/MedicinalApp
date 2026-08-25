import os
import shutil
import uuid
from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Consultation, MedicalReport, ExtractedMedicalInfo, OCRStatus, User
from app.schemas import MedicalReportOut, ExtractedMedicalInfoOut
from app.services.ocr.ocr_engine import OCREngine
from app.services.ocr.medical_parser import MedicalInformationParser
from app.services.audit_service import create_audit_log

router = APIRouter(tags=["Medical Reports"])

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

@router.post("/consultations/{id}/reports/upload", response_model=MedicalReportOut, status_code=status.HTTP_201_CREATED)
async def upload_report(
    id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    consultation = db.query(Consultation).filter(Consultation.id == id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    # Validate file type
    content_type = file.content_type or ""
    filename = file.filename or "medical_report"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in [".pdf", ".png", ".jpg", ".jpeg"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a PDF, PNG, or JPG/JPEG image."
        )

    # Generate unique safe filename
    unique_filename = f"{uuid.uuid4().hex[:12]}_{filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    # Save file and calculate size
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        file_size = os.path.getsize(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Check file size limit
    if file_size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB"
        )

    # Create report record
    report = MedicalReport(
        consultation_id=id,
        filename=filename,
        file_path=file_path,
        file_type=content_type or ext,
        file_size=file_size,
        uploaded_at=datetime.utcnow(),
        ocr_status=OCRStatus.PROCESSING.value
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Run OCR Pipeline immediately
    success, ocr_text = OCREngine.process_file(file_path, report.file_type)
    if success:
        report.ocr_status = OCRStatus.COMPLETED.value
        report.ocr_text = ocr_text
    else:
        report.ocr_status = OCRStatus.FAILED.value
        report.ocr_text = ocr_text

    db.commit()

    # Extract structured medical information from OCR text
    extracted_data = MedicalInformationParser.extract_structured_info(report.ocr_text or "")
    
    extracted_info_record = ExtractedMedicalInfo(
        consultation_id=id,
        report_id=report.id,
        diagnosis=extracted_data.get("diagnosis", []),
        medicines=extracted_data.get("medicines", []),
        test_results=extracted_data.get("test_results", []),
        laboratory_values=extracted_data.get("laboratory_values", {}),
        procedures=extracted_data.get("procedures", []),
        surgeries=extracted_data.get("surgeries", []),
        dates=extracted_data.get("dates", []),
        doctor_names=extracted_data.get("doctor_names", []),
        hospital_names=extracted_data.get("hospital_names", []),
        important_findings=extracted_data.get("important_findings", [])
    )
    db.add(extracted_info_record)
    db.commit()
    db.refresh(report)

    create_audit_log(
        db=db,
        action="REPORT_UPLOADED_AND_PROCESSED",
        user=current_user,
        consultation_id=id,
        details={"filename": filename, "ocr_status": report.ocr_status}
    )

    return report

@router.get("/consultations/{id}/reports", response_model=List[MedicalReportOut])
def get_consultation_reports(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    consultation = db.query(Consultation).filter(Consultation.id == id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    reports = db.query(MedicalReport).filter(MedicalReport.consultation_id == id).all()
    return reports

@router.get("/reports/{report_id}/file")
def download_report_file(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if not os.path.exists(report.file_path):
        raise HTTPException(status_code=404, detail="File not found on storage")

    return FileResponse(
        path=report.file_path,
        filename=report.filename,
        media_type=report.file_type
    )

@router.post("/reports/{report_id}/ocr", response_model=MedicalReportOut)
def rerun_ocr(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    success, ocr_text = OCREngine.process_file(report.file_path, report.file_type)
    report.ocr_status = OCRStatus.COMPLETED.value if success else OCRStatus.FAILED.value
    report.ocr_text = ocr_text
    db.commit()

    # Re-extract
    extracted_data = MedicalInformationParser.extract_structured_info(report.ocr_text or "")
    info_record = db.query(ExtractedMedicalInfo).filter(ExtractedMedicalInfo.report_id == report.id).first()
    if not info_record:
        info_record = ExtractedMedicalInfo(consultation_id=report.consultation_id, report_id=report.id)
        db.add(info_record)

    info_record.diagnosis = extracted_data.get("diagnosis", [])
    info_record.medicines = extracted_data.get("medicines", [])
    info_record.test_results = extracted_data.get("test_results", [])
    info_record.laboratory_values = extracted_data.get("laboratory_values", {})
    info_record.procedures = extracted_data.get("procedures", [])
    info_record.surgeries = extracted_data.get("surgeries", [])
    info_record.dates = extracted_data.get("dates", [])
    info_record.doctor_names = extracted_data.get("doctor_names", [])
    info_record.hospital_names = extracted_data.get("hospital_names", [])
    info_record.important_findings = extracted_data.get("important_findings", [])

    db.commit()
    db.refresh(report)

    create_audit_log(
        db=db,
        action="REPORT_OCR_RERUN",
        user=current_user,
        consultation_id=report.consultation_id,
        details={"report_id": report.id}
    )

    return report

@router.delete("/reports/{report_id}")
def delete_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    cons_id = report.consultation_id
    if os.path.exists(report.file_path):
        try:
            os.remove(report.file_path)
        except Exception:
            pass

    db.delete(report)
    db.commit()

    create_audit_log(
        db=db,
        action="REPORT_DELETED",
        user=current_user,
        consultation_id=cons_id,
        details={"report_id": report_id}
    )

    return {"message": "Report deleted successfully"}
