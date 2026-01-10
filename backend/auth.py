from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
from models import User
from config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def truncate_password_safe(password: str, max_bytes: int = 72) -> str:
    """Безопасно обрезает пароль до max_bytes, не разрывая UTF-8 символы"""
    password_bytes = password.encode('utf-8')
    if len(password_bytes) <= max_bytes:
        return password
    
    # Обрезаем по байтам и проверяем валидность
    truncated = password_bytes[:max_bytes]
    # Убираем неполные UTF-8 символы с конца
    while len(truncated) > 0:
        try:
            return truncated.decode('utf-8')
        except UnicodeDecodeError:
            truncated = truncated[:-1]
    
    return password[:20]  # Fallback - первые 20 символов

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверяет пароль с учетом ограничения bcrypt в 72 байта"""
    try:
        truncated_password = truncate_password_safe(plain_password)
        return pwd_context.verify(truncated_password, hashed_password)
    except Exception as e:
        print(f"Password verification error: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Хеширует пароль с учетом ограничения bcrypt в 72 байта"""
    try:
        truncated_password = truncate_password_safe(password)
        return pwd_context.hash(truncated_password)
    except Exception as e:
        print(f"Password hashing error: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка хеширования пароля: {str(e)}")

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