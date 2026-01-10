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
        
        db = SessionLocal()
        try:
            # Всегда обновляем данные существующих товаров
            logger.info("� Updating existing items...")
            
            updates = [
                {"id": 1, "title": "iPhone 14 Pro", "img": "/img/i17.jpg", "category": "phones", "price": 89990},
                {"id": 2, "title": "PlayStation 5", "img": "/img/ps5.png", "category": "consoles", "price": 49990},
                {"id": 3, "title": "Xbox Series X", "img": "/img/xbox.png", "category": "consoles", "price": 44990},
                {"id": 4, "title": "Nintendo Switch OLED", "img": "/img/switch.jpeg", "category": "consoles", "price": 34990},
            ]
            
            for update_data in updates:
                item = db.query(Item).filter(Item.id == update_data["id"]).first()
                if item:
                    item.title = update_data["title"]
                    item.img = update_data["img"]
                    item.category = update_data["category"]
                    item.price = update_data["price"]
                    logger.info(f"✅ Updated item {item.id}: {item.title}")
                else:
                    # Создаём новый товар если его нет
                    new_item = Item(
                        title=update_data["title"],
                        img=update_data["img"],
                        category=update_data["category"],
                        price=update_data["price"],
                        desc=f"Описание товара {update_data['title']}"
                    )
                    db.add(new_item)
                    logger.info(f"✅ Created new item: {update_data['title']}")
            
            db.commit()
            logger.info("🎉 Database initialization complete!")
            
            # Если товаров нет вообще - создаём с полными данными
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
