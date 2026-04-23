from sqlalchemy import Column, String, Integer, DateTime, Text, Boolean
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id               = Column(String, primary_key=True, index=True)
    email            = Column(String, unique=True, nullable=False, index=True)
    hashed_password  = Column(String, nullable=False)
    is_active        = Column(Boolean, default=True)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())

class ScanHistory(Base):
    __tablename__ = "scans"

    id          = Column(String, primary_key=True, index=True)
    url         = Column(String, nullable=False)
    score       = Column(Integer)
    grade       = Column(String(5))
    result_json = Column(Text)
    user_id     = Column(String, nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
