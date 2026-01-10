from pydantic import BaseModel

class UserRegister(BaseModel):
    email: str
    password: str
    username: str

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