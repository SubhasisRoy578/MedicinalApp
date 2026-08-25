import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings, PROJECT_ROOT

db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# When the local .env uses sqlite:///./medikiosk.db, resolve it against
# the project root rather than the terminal's current working directory.
if db_url.startswith("sqlite:///./"):
    relative_path = db_url[len("sqlite:///./"):]
    db_path = (PROJECT_ROOT / relative_path).resolve()
    db_url = f"sqlite:///{db_path.as_posix()}"

connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
