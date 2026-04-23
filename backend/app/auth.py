from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import uuid

from database import get_db
from models import User
from schemas import UserRegister, UserLogin, TokenResponse
from utils.password import hash_password, verify_password
from utils.token import create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register")
def register(data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        id              = str(uuid.uuid4()),
        email           = data.email,
        hashed_password = hash_password(data.password)
    )
    db.add(user)
    db.commit()
    return {"message": "Account created", "email": user.email}

@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.id, "email": user.email})
    return {"access_token": token, "token_type": "bearer"}