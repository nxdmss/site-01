from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session, joinedload
from contextlib import asynccontextmanager
import models, schemas, auth
from database import engine, get_db, SessionLocal
from database import Base
from config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Код, который выполняется при СТАРТЕ приложения
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    if db.query(models.Item).count() == 0:
        # Создаём товары с категориями
        items = [
            # ═══════════════ ТЕЛЕФОНЫ ═══════════════
            models.Item(
                title="iPhone 14 Pro", 
                img="/img/di.jpg", 
                desc="Флагманский смартфон Apple с чипом A16 Bionic, Dynamic Island и камерой 48 МП. Корпус из хирургической стали.", 
                price=999,
                category="phones"
            ),
            
            # ═══════════════ ПРИСТАВКИ ═══════════════
            models.Item(
                title="PlayStation 5", 
                img="/img/ps5.jpg", 
                desc="Игровая консоль нового поколения от Sony. SSD на 825 ГБ, поддержка 4K 120fps, контроллер DualSense с тактильной отдачей.", 
                price=499,
                category="consoles"
            ),
            models.Item(
                title="Xbox Series X", 
                img="/img/xbox.jpg", 
                desc="Самая мощная консоль Microsoft. 12 терафлопс, SSD 1 ТБ, поддержка 4K 120fps и обратная совместимость с играми Xbox.", 
                price=499,
                category="consoles"
            ),
            models.Item(
                title="Nintendo Switch OLED", 
                img="/img/switch.jpg", 
                desc="Гибридная консоль с 7-дюймовым OLED экраном. Играй дома на ТВ или в дороге. Эксклюзивы: Zelda, Mario, Pokémon.", 
                price=349,
                category="consoles"
            ),
        ]
        db.add_all(items)
        db.commit()
    db.close()
    
    yield 

app = FastAPI(lifespan=lifespan, title="Shop API", version="1.0.0")

# CORS - используем настройки из конфига
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ═══════════════ AUTH ═══════════════

@app.post("/register")
def register(user: schemas.UserRegister, db: Session = Depends(get_db)):
    if len(user.password) < 8:
        raise HTTPException(400, "Пароль слишком короткий")
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(400, "Email занят")
    
    db.add(models.User(
        email=user.email,
        username=user.username,
        password=auth.get_password_hash(user.password)
    ))
    db.commit()
    return {"message": "OK"}

@app.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not auth.verify_password(user.password, db_user.password):
        raise HTTPException(400, "Неверные данные")
    return {"access_token": auth.create_access_token({"sub": db_user.email}), "token_type": "bearer"}

@app.get("/users/me")
def me(current_user: models.User = Depends(auth.get_current_user)):
    return {"email": current_user.email, "username": current_user.username}

# ═══════════════ ITEMS ═══════════════

@app.get("/api/items")
async def get_items(db: Session = Depends(get_db)):
    items = db.query(models.Item).all()
    # ✅ Теперь вернём товары с категорией
    return [
        {
            "id": item.id,
            "title": item.title,
            "img": item.img,
            "desc": item.desc,
            "price": item.price,
            "category": item.category  # ✅ ДОБАВЬ ЭТО
        }
        for item in items
    ]

# ═══════════════ CART ═══════════════

@app.get("/api/cart")
def get_cart(db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    items = db.query(models.Cart).options(joinedload(models.Cart.item)).filter(models.Cart.user_id == user.id).all()
    return [{"id": c.item.id, "title": c.item.title, "price": c.item.price, "img": c.item.img, "quantity": c.quantity} for c in items if c.item]

@app.post("/api/cart/{item_id}")
def add_to_cart(item_id: int, db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    if not db.query(models.Item).filter(models.Item.id == item_id).first():
        raise HTTPException(404, "Товар не найден")
    
    cart = db.query(models.Cart).filter(models.Cart.user_id == user.id, models.Cart.item_id == item_id).first()
    if cart:
        cart.quantity += 1
    else:
        db.add(models.Cart(user_id=user.id, item_id=item_id, quantity=1))
    db.commit()
    return {"message": "OK"}

@app.patch("/api/cart/minus/{item_id}")
def minus_item(item_id: int, db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    cart = db.query(models.Cart).filter(models.Cart.item_id == item_id, models.Cart.user_id == user.id).first()
    if cart:
        if cart.quantity > 1:
            cart.quantity -= 1
        else:
            db.delete(cart)
        db.commit()
    return {"status": "OK"}

@app.delete("/api/cart/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    db.query(models.Cart).filter(models.Cart.item_id == item_id, models.Cart.user_id == user.id).delete()
    db.commit()
    return {"status": "OK"}

# ═══════════════ ORDERS ═══════════════

@app.post("/api/checkout")
def checkout(db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    items = db.query(models.Cart).options(joinedload(models.Cart.item)).filter(models.Cart.user_id == user.id).all()
    if not items:
        raise HTTPException(400, "Корзина пуста")
    
    total = sum(c.item.price * c.quantity for c in items if c.item)
    order = models.Order(user_id=user.id, total_price=total)
    db.add(order)
    for c in items:
        db.delete(c)
    db.commit()
    return {"status": "OK", "order_id": order.id, "total": total}

@app.get("/api/orders")
def get_orders(db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    orders = db.query(models.Order).filter(models.Order.user_id == user.id).order_by(models.Order.created_at.desc()).all()
    return [{"id": o.id, "total_price": o.total_price, "created_at": o.created_at} for o in orders]



