"""Скрипт для очистки таблицы пользователей"""
from database import SessionLocal
from models import User

def clear_users():
    db = SessionLocal()
    try:
        # Удаляем всех пользователей
        deleted = db.query(User).delete()
        db.commit()
        print(f"✅ Удалено пользователей: {deleted}")
        print("✅ База данных очищена. Можно регистрировать новых пользователей.")
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clear_users()
