from pydantic import BaseModel, field_validator

class UserRegister(BaseModel):
    email: str
    password: str
    username: str
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if not v or len(v) < 6:
            raise ValueError('Пароль должен быть минимум 6 символов')
        # Для bcrypt безопасная длина - до 50 символов
        if len(v) > 50:
            raise ValueError('Пароль слишком длинный (максимум 50 символов)')
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