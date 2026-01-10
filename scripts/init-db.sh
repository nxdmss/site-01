#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# СКРИПТ ИНИЦИАЛИЗАЦИИ БАЗЫ ДАННЫХ
# ═══════════════════════════════════════════════════════════════

echo "🔧 Инициализация базы данных..."

# Ждём пока база данных будет готова
until docker compose exec db pg_isready -U shop_user -d shop_db; do
  echo "⏳ Ожидание запуска PostgreSQL..."
  sleep 2
done

echo "✅ PostgreSQL готов!"

# Создаём таблицы через backend
docker compose exec backend python -c "
from database import engine, Base
from models import User, Item, Cart, Order, OrderItem
Base.metadata.create_all(bind=engine)
print('✅ Таблицы созданы!')
"

# Добавляем демо-товары
docker compose exec backend python -c "
from database import SessionLocal
from models import Item

db = SessionLocal()

# Проверяем есть ли уже товары
if db.query(Item).count() == 0:
    items = [
        Item(name='iPhone 14 Pro', price=89990, desc='Флагманский смартфон Apple с процессором A16 Bionic', img='/img/i17.jpg', category='phones'),
        Item(name='PlayStation 5', price=49990, desc='Игровая консоль нового поколения от Sony', img='/img/ps5.png', category='consoles'),
        Item(name='Xbox Series X', price=44990, desc='Мощная консоль от Microsoft', img='/img/xbox.png', category='consoles'),
        Item(name='Nintendo Switch OLED', price=34990, desc='Портативная консоль с OLED экраном', img='/img/switch.jpeg', category='consoles'),
    ]
    db.add_all(items)
    db.commit()
    print('✅ Демо-товары добавлены!')
else:
    print('ℹ️  Товары уже существуют')

db.close()
"

echo "🎉 Инициализация завершена!"
