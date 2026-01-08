import psycopg2
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr

# ==========================================
# 1. КОНФИГУРАЦИЯ
# ==========================================
SECRET_KEY = "super-secret-key-123" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
DATABASE_URL = "postgresql://nxdms@localhost:5432/shop_db"

# ==========================================
# 2. НАСТРОЙКА БД
# ==========================================
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ==========================================
# 3. МОДЕЛИ (ИСПРАВЛЕНО)
# ==========================================
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String)
    password = Column(String)

class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    price = Column(Float)
    desc = Column(Text)
    img = Column(String)

class Cart(Base):
    __tablename__ = "cart"
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"))
    # ИСПРАВЛЕНО: Теперь ссылаемся на таблицу users, колонку id
    user_id = Column(Integer, ForeignKey("users.id")) 
    quantity = Column(Integer, default=1)
    
    item = relationship("Item")
    user = relationship("User")

Base.metadata.create_all(bind=engine)

# ==========================================
# 4. ИНСТРУМЕНТЫ
# ==========================================
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# ==========================================
# 5. ФУНКЦИИ (DEPENDENCIES)
# ==========================================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Невалидный токен")
    except JWTError:
        raise HTTPException(status_code=401, detail="Токен истек")
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user

# ==========================================
# 6. SCHEMAS
# ==========================================
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    username: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# ==========================================
# 7. ЭНДПОИНТЫ: ПОЛЬЗОВАТЕЛИ
# ==========================================
@app.post("/register")
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Валидация: проверяем длину пароля
    if len(user_data.password) < 8:
        raise HTTPException(status_code=400, detail="Пароль должен быть не менее 8 символов")

    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email уже занят")
    
    new_user = User(
        email=user_data.email,
        username=user_data.username,
        password=pwd_context.hash(user_data.password)
    )
    db.add(new_user)
    db.commit()
    return {"message": "Успешно", "username": new_user.username}

@app.post("/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not pwd_context.verify(user_data.password, user.password):
        raise HTTPException(status_code=400, detail="Неверная почта или пароль")

    token = create_access_token(data={"sub": user.email, "username": user.username})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/users/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    return {"email": current_user.email, "username": current_user.username}

# ==========================================
# 8. ЭНДПОИНТЫ: МАГАЗИН И КОРЗИНА (ПЕРСОНАЛЬНЫЕ)
# ==========================================
@app.get("/api/items")
def get_items(db: Session = Depends(get_db)):
    return db.query(Item).all()

@app.get("/api/cart")
def get_cart(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # ИСПРАВЛЕНО: фильтруем корзину по ID текущего пользователя
    cart_items = db.query(Cart).filter(Cart.user_id == current_user.id).all()
    
    return [{
        "id": c.item.id, 
        "title": c.item.title, 
        "price": c.item.price, 
        "img": c.item.img, 
        "quantity": c.quantity
    } for c in cart_items]

@app.post("/api/cart/{item_id}")
def add_to_cart(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Ищем товар в корзине ЭТОГО пользователя
    cart_item = db.query(Cart).filter(Cart.item_id == item_id, Cart.user_id == current_user.id).first()
    
    if cart_item:
        cart_item.quantity += 1
    else:
        new_item = Cart(item_id=item_id, user_id=current_user.id, quantity=1)
        db.add(new_item)
    
    db.commit()
    return {"status": "success"}

@app.delete("/api/cart/{item_id}")
def delete_from_cart(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # ИСПРАВЛЕНО: удаляем только свой товар
    db.query(Cart).filter(Cart.item_id == item_id, Cart.user_id == current_user.id).delete()
    db.commit()
    return {"status": "deleted"}