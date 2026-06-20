import os
import bcrypt
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'default-jwt-secret-key-change-me-32chars')
ALGORITHM = "HS256"

def verify_password(plain_password: str, hashed_password: str):
    if isinstance(hashed_password, str):
        hashed_password = hashed_password.encode('utf-8')
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password)

def get_password_hash(password: str):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=1)
    to_encode.update({"exp": expire})
    if "identity" in to_encode:
        to_encode["sub"] = str(to_encode.pop("identity"))
        
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user_claims(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def current_user_id(claims: dict = Depends(get_current_user_claims)):
    sub = claims.get("sub")
    if not sub:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    return int(sub)

def require_role(required_role: str):
    def role_checker(claims: dict = Depends(get_current_user_claims)):
        role = claims.get("role")
        if role != required_role:
            raise HTTPException(status_code=403, detail=f"{required_role} privileges required")
        return claims
    return role_checker
