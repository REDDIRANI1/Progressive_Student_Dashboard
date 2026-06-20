from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models import User
from app.utils import get_password_hash, verify_password, create_access_token, current_user_id

router = APIRouter(prefix="/api/auth", tags=["auth"])

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "STUDENT"

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/signup", status_code=201)
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    data.email = data.email.lower()
    if db.query(User).filter(User.email == data.email).first():
        return JSONResponse(status_code=409, content={"message": "User already exists"})
    
    if data.role not in ['STUDENT', 'MENTOR']:
        return JSONResponse(status_code=400, content={"message": "Invalid role"})
        
    user = User(
        name=data.name, 
        email=data.email, 
        role=data.role,
        password_hash=get_password_hash(data.password)
    )
    db.add(user)
    db.commit()
    return {"message": "User created successfully"}

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    data.email = data.email.lower()
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        return JSONResponse(status_code=401, content={"message": "Invalid credentials"})
        
    access_token = create_access_token(
        data={"identity": str(user.id), "role": user.role, "name": user.name}
    )
    return {
        "access_token": access_token, 
        "user": {"id": user.id, "email": user.email, "role": user.role, "name": user.name}
    }

@router.get("/me")
def me(user_id: int = Depends(current_user_id), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return JSONResponse(status_code=404, content={"message": "User not found"})
        
    return {"id": user.id, "name": user.name, "email": user.email, "role": user.role}
