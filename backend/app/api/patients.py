from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models import User, PatientProfile, UserRole
from app.schemas import UserOut, PatientProfileOut

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("/me", response_model=UserOut)
def get_patient_profile(
    current_user: User = Depends(require_roles([UserRole.PATIENT.value, UserRole.ADMIN.value])),
    db: Session = Depends(get_db)
):
    return current_user

@router.put("/me/profile", response_model=PatientProfileOut)
def update_patient_profile(
    profile_data: dict,
    current_user: User = Depends(require_roles([UserRole.PATIENT.value])),
    db: Session = Depends(get_db)
):
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if not profile:
        profile = PatientProfile(user_id=current_user.id)
        db.add(profile)

    for field in ["date_of_birth", "gender", "blood_group", "emergency_contact", "address", "preferred_language"]:
        if field in profile_data:
            setattr(profile, field, profile_data[field])

    db.commit()
    db.refresh(profile)
    return profile
