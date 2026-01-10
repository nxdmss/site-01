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
    try:
        from init_db import init_database
        init_database()
    except Exception as e:
        print(f"⚠️  Warning: Could not initialize database: {e}")
    
    yield
    # Код при ОСТАНОВКЕ приложения (если нужен)

app = FastAPI(lifespan=lifespan, title="Shop API", version="1.0.0")

# CORS - используем настройки из конфига
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Временно разрешаем все для отладки
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ═══════════════ AUTH ═══════════════

@app.post("/register")
def register(user: schemas.UserRegister, db: Session = Depends(get_db)):
    try:
        # Проверка длины пароля
        if len(user.password) < 8:
            raise HTTPException(400, "Пароль должен быть минимум 8 символов")
        if len(user.password) > 72:
            raise HTTPException(400, "Пароль не может быть длиннее 72 символов")
        
        # Проверка существующего пользователя
        existing_user = db.query(models.User).filter(models.User.email == user.email).first()
        if existing_user:
            raise HTTPException(400, "Email уже зарегистрирован")
        
        # Создание пользователя
        new_user = models.User(
            email=user.email,
            username=user.username,
            password=auth.get_password_hash(user.password)
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return {"message": "Регистрация успешна", "user_id": new_user.id}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Registration error: {e}")
        raise HTTPException(500, f"Ошибка регистрации: {str(e)}")

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

# ═══════════════════════════════════════════════════════════════
# ADMIN ENDPOINT - Инициализация/Обновление данных
# ═══════════════════════════════════════════════════════════════
@app.get("/admin/init-db")
def admin_init_database(db: Session = Depends(get_db)):
    """Принудительная инициализация/обновление базы данных"""
    try:
        # Прямое обновление данных
        updates = [
            {"id": 1, "title": "iPhone 14 Pro", "img": "/img/i17.jpg", "category": "phones", "price": 89990},
            {"id": 2, "title": "PlayStation 5", "img": "/img/ps5.png", "category": "consoles", "price": 49990},
            {"id": 3, "title": "Xbox Series X", "img": "/img/xbox.png", "category": "consoles", "price": 44990},
            {"id": 4, "title": "Nintendo Switch OLED", "img": "/img/switch.jpeg", "category": "consoles", "price": 34990},
        ]
        
        updated_count = 0
        for update_data in updates:
            item = db.query(models.Item).filter(models.Item.id == update_data["id"]).first()
            if item:
                item.title = update_data["title"]
                item.img = update_data["img"]
                item.category = update_data["category"]
                item.price = update_data["price"]
                updated_count += 1
        
        db.commit()
        return {"status": "success", "message": f"Updated {updated_count} items"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/check-items")
def admin_check_items(db: Session = Depends(get_db)):
    """Проверка товаров в базе"""
    items = db.query(models.Item).all()
    return {
        "count": len(items),
        "items": [
            {
                "id": item.id,
                "title": item.title,
                "img": item.img,
                "category": item.category,
                "price": item.price
            }
            for item in items
        ]
    }



