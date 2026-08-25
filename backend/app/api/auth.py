from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user
)
from app.models import User, PatientProfile, DoctorProfile, UserRole
from app.schemas import UserCreate, UserLogin, Token, UserOut
from app.services.audit_service import create_audit_log

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )

    # Validate role
    role = user_in.role.upper()
    if role not in [r.value for r in UserRole]:
        role = UserRole.PATIENT.value

    # Create user
    new_user = User(
        name=user_in.name.strip(),
        email=user_in.email.lower().strip(),
        password_hash=get_password_hash(user_in.password),
        role=role,
        phone=user_in.phone,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create associated profile
    if role == UserRole.PATIENT.value:
        patient_profile = PatientProfile(
            user_id=new_user.id,
            date_of_birth=user_in.date_of_birth,
            gender=user_in.gender,
            blood_group=user_in.blood_group,
            emergency_contact=user_in.emergency_contact,
            address=user_in.address,
            preferred_language=user_in.preferred_language or "English"
        )
        db.add(patient_profile)
    elif role == UserRole.DOCTOR.value:
        doctor_profile = DoctorProfile(
            user_id=new_user.id,
            specialization=user_in.specialization or "General Medicine",
            license_number=user_in.license_number or f"MED-{new_user.id:04d}",
            hospital_name=user_in.hospital_name or "Arogya Medical Center",
            department=user_in.department or "Internal Medicine"
        )
        db.add(doctor_profile)

    db.commit()
    db.refresh(new_user)

    # Audit log
    create_audit_log(
        db=db,
        action="USER_REGISTERED",
        user=new_user,
        details={"role": new_user.role, "name": new_user.name}
    )

    access_token = create_access_token(data={"sub": str(new_user.id), "role": new_user.role})
    user_out_dict = UserOut.model_validate(new_user).model_dump()

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_out_dict
    }

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email.lower().strip()).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account has been deactivated. Please contact administrator."
        )

    create_audit_log(
        db=db,
        action="USER_LOGIN",
        user=user,
        details={"role": user.role}
    )

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    user_out_dict = UserOut.model_validate(user).model_dump()

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_out_dict
    }

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
