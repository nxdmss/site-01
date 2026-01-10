from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    username: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class CartItemResponse(BaseModel):
    id: int
    title: str
    price: float
    img: str
    quantity: int