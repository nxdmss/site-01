from pydantic import BaseModel, field_validator

class UserRegister(BaseModel):
    email: str
    password: str
    username: str
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if not v or len(v) < 4:
            raise ValueError('Пароль должен быть минимум 4 символа')
        return v

class UserLogin(BaseModel):
    email: str
    password: str

class UserAvatarUpdate(BaseModel):
    avatar: str | None  # Base64 encoded image or None to remove
