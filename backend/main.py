from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from contextlib import asynccontextmanager

import models
import schemas
import auth
from database import engine, get_db, Base
from config import settings

# Database initialization on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(lifespan=lifespan, title="Shop API", version="1.0.0")

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/register")
def register(user: schemas.UserRegister, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(400, "Email уже зарегистрирован")
    new_user = models.User(
        email=user.email,
        username=user.username,
        password=auth.get_password_hash(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Регистрация успешна", "user_id": new_user.id}


@app.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not auth.verify_password(user.password, db_user.password):
        raise HTTPException(400, "Неверные данные")
    return {"access_token": auth.create_access_token({"sub": db_user.email}), "token_type": "bearer"}


@app.get("/users/me")
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return {"email": current_user.email, "username": current_user.username, "avatar": current_user.avatar}


@app.put("/users/avatar")
def update_avatar(avatar_data: schemas.UserAvatarUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    current_user.avatar = avatar_data.avatar
    db.commit()
    db.refresh(current_user)
    return {"message": "Avatar updated", "avatar": current_user.avatar}


@app.get("/api/items")
def get_items(db: Session = Depends(get_db)):
    items = db.query(models.Item).all()
    return [{"id": i.id, "title": i.title, "img": i.img, "desc": i.desc, "price": i.price, "category": i.category} for i in items]


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


@app.get("/admin/init-db")
def admin_init_db(db: Session = Depends(get_db)):
    items_data = [
        {"id": 1, "title": "iPhone 14 Pro", "img": "/img/i17.jpg", "desc": "Флагманский смартфон", "category": "phones", "price": 89990},
        {"id": 2, "title": "PlayStation 5", "img": "/img/ps5.png", "desc": "Игровая консоль Sony", "category": "consoles", "price": 49990},
        {"id": 3, "title": "Xbox Series X", "img": "/img/xbox.png", "desc": "Консоль Microsoft", "category": "consoles", "price": 44990},
        {"id": 4, "title": "Nintendo Switch OLED", "img": "/img/switch.jpeg", "desc": "Портативная консоль", "category": "consoles", "price": 34990},
    ]
    updated = 0
    for data in items_data:
        item = db.query(models.Item).filter(models.Item.id == data["id"]).first()
        if item:
            for key, value in data.items():
                setattr(item, key, value)
        else:
            db.add(models.Item(**data))
        updated += 1
    db.commit()
    return {"status": "success", "updated": updated}


@app.get("/admin/check-items")
def admin_check_items(db: Session = Depends(get_db)):
    items = db.query(models.Item).all()
    return {"count": len(items), "items": [{"id": i.id, "title": i.title, "img": i.img} for i in items]}
