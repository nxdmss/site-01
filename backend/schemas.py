from pydantic import BaseModel, field_validator

class UserRegister(BaseModel):
    email: str
    password: str
    username: str
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Пароль должен быть минимум 8 символов')
        # Проверяем количество байт в UTF-8
        password_bytes = v.encode('utf-8')
        if len(password_bytes) > 72:
            raise ValueError('Пароль слишком длинный (максимум 72 байта в UTF-8)')
        return v

class UserLogin(BaseModel):
    email: str
    password: str

class CartItemResponse(BaseModel):
    id: int
    title: str
    price: float
    img: str
    quantity: int

class ItemBase(BaseModel):
    title: str
    img: str
    desc: str
    price: float
    category: str = "other"

class ItemCreate(ItemBase):
    pass 

class ItemResponse(ItemBase):
    id: int

    class Config:
        from_attributes = True