"""
Скрипт для обновления путей к картинкам в базе данных
"""

from database import SessionLocal
from models import Item
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def update_image_paths():
    """Обновление путей к картинкам"""
    db = SessionLocal()
    try:
        # Обновляем пути к существующим товарам
        items_to_update = [
            {"id": 1, "img": "/img/i17.jpg", "title": "iPhone 14 Pro"},
            {"id": 2, "img": "/img/ps5.png", "title": "PlayStation 5"},
            {"id": 3, "img": "/img/xbox.png", "title": "Xbox Series X"},
            {"id": 4, "img": "/img/switch.jpeg", "title": "Nintendo Switch OLED"},
        ]
        
        for item_data in items_to_update:
            item = db.query(Item).filter(Item.id == item_data["id"]).first()
            if item:
                item.img = item_data["img"]
                item.title = item_data["title"]
                logger.info(f"✅ Updated: {item.title} -> {item.img}")
        
        db.commit()
        logger.info("🎉 All image paths updated successfully!")
        
    except Exception as e:
        logger.error(f"❌ Error updating paths: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_image_paths()
