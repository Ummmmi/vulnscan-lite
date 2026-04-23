from pydantic import BaseModel, EmailStr
from datetime import datetime

class ScanRequest(BaseModel):
    url: str

class ScanResponse(BaseModel):
    scan_id : str
    url     : str
    score   : int
    grade   : str
    status  : str

class UserRegister(BaseModel):
    email    : EmailStr
    password : str

class UserLogin(BaseModel):
    email    : EmailStr
    password : str

class TokenResponse(BaseModel):
    access_token : str
    token_type   : str = "bearer"

class HistoryItem(BaseModel):
    id         : str
    url        : str
    score      : int
    grade      : str
    created_at : datetime

    class Config:
        from_attributes = True
