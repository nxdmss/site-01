"""
Скрипт инициализации базы данных для production
Запускается автоматически при первом старте
"""

from database import engine, SessionLocal, Base
from models import User, Item, Cart, Order, OrderItem
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_database():
    """Инициализация базы данных"""
    try:
        # Создаём таблицы если их нет
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created/verified")
        
        # Проверяем есть ли товары
        db = SessionLocal()
        try:
            # Сначала обновляем пути к существующим товарам
            existing_items = db.query(Item).all()
            if existing_items:
                logger.info(f"📦 Found {len(existing_items)} existing items, updating paths...")
                
                updates = {
                    1: {"img": "/img/i17.jpg", "title": "iPhone 14 Pro"},
                    2: {"img": "/img/ps5.png", "title": "PlayStation 5"},
                    3: {"img": "/img/xbox.png", "title": "Xbox Series X"},
                    4: {"img": "/img/switch.jpeg", "title": "Nintendo Switch OLED"},
                }
                
                for item in existing_items:
                    if item.id in updates:
                        item.img = updates[item.id]["img"]
                        item.title = updates[item.id]["title"]
                        logger.info(f"✅ Updated: {item.title} -> {item.img}")
                
                db.commit()
                logger.info("🎉 Image paths updated!")
            
            # Если товаров нет - создаём новые
            if db.query(Item).count() == 0:
                logger.info("📦 Adding initial items...")
                
                items = [
                    Item(
                        title='iPhone 14 Pro',
                        price=89990,
                        desc='Флагманский смартфон Apple с процессором A16 Bionic',
                        img='/img/i17.jpg',
                        category='phones'
                    ),
                    Item(
                        title='PlayStation 5',
                        price=49990,
                        desc='Игровая консоль нового поколения от Sony',
                        img='/img/ps5.png',
                        category='consoles'
                    ),
                    Item(
                        title='Xbox Series X',
                        price=44990,
                        desc='Мощная консоль от Microsoft',
                        img='/img/xbox.png',
                        category='consoles'
                    ),
                    Item(
                        title='Nintendo Switch OLED',
                        price=34990,
                        desc='Портативная консоль с OLED экраном',
                        img='/img/switch.jpeg',
                        category='consoles'
                    ),
                ]
                
                db.add_all(items)
                db.commit()
                logger.info(f"✅ Added {len(items)} items to database")
            else:
                logger.info(f"ℹ️  Database already has {db.query(Item).count()} items")
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"❌ Error initializing database: {e}")
        raise

if __name__ == "__main__":
    init_database()
