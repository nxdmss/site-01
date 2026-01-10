"""
Скрипт для проверки и исправления данных напрямую через SQL
"""
import sys
sys.path.append('/app')

from database import SessionLocal
from models import Item

def fix_data():
    db = SessionLocal()
    try:
        print("🔍 Проверка товаров в базе...")
        items = db.query(Item).all()
        
        print(f"\n📦 Найдено товаров: {len(items)}")
        
        for item in items:
            print(f"\nID: {item.id}")
            print(f"  Title: {item.title}")
            print(f"  Image: {item.img}")
            print(f"  Category: {item.category}")
            
        # Обновляем данные
        print("\n🔧 Обновление данных...")
        
        updates = {
            1: {"title": "iPhone 14 Pro", "img": "/img/i17.jpg", "category": "phones"},
            2: {"title": "PlayStation 5", "img": "/img/ps5.png", "category": "consoles"},
            3: {"title": "Xbox Series X", "img": "/img/xbox.png", "category": "consoles"},
            4: {"title": "Nintendo Switch OLED", "img": "/img/switch.jpeg", "category": "consoles"},
        }
        
        for item_id, data in updates.items():
            item = db.query(Item).filter(Item.id == item_id).first()
            if item:
                item.title = data["title"]
                item.img = data["img"]
                item.category = data["category"]
                print(f"✅ Обновлён товар ID {item_id}: {data['title']}")
        
        db.commit()
        print("\n🎉 Все данные обновлены!")
        
        # Проверка после обновления
        print("\n📋 Данные после обновления:")
        items = db.query(Item).all()
        for item in items:
            print(f"  {item.id}. {item.title} - {item.img}")
            
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_data()
