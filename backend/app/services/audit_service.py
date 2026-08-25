from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models import AuditLog, User

def create_audit_log(
    db: Session,
    action: str,
    user: Optional[User] = None,
    user_id: Optional[int] = None,
    user_email: Optional[str] = None,
    consultation_id: Optional[int] = None,
    details: Optional[Dict[str, Any]] = None
) -> AuditLog:
    if user:
        user_id = user.id
        user_email = user.email

    log_entry = AuditLog(
        user_id=user_id,
        user_email=user_email,
        action=action,
        timestamp=datetime.utcnow(),
        consultation_id=consultation_id,
        details=details or {}
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry
