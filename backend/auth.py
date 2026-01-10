from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
import hashlib
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
from models import User
from config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверяет пароль используя SHA256"""
    try:
        # Простое сравнение хешей SHA256
        password_hash = hashlib.sha256(plain_password.encode('utf-8')).hexdigest()
        return password_hash == hashed_password
    except Exception as e:
        print(f"Password verification error: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Хеширует пароль используя SHA256 (без ограничений длины)"""
    try:
        # SHA256 не имеет ограничения в 72 байта!
        return hashlib.sha256(password.encode('utf-8')).hexdigest()
    except Exception as e:
        print(f"Password hashing error: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка хеширования: {str(e)}")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token expired or invalid")
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user