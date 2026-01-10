# 🛒 Shop App - Интернет-магазин

Современный интернет-магазин на React + FastAPI + PostgreSQL.

## 🚀 Быстрый старт (для разработки)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🐳 Деплой с Docker Compose

### Шаг 1: Подготовка сервера

Тебе нужен VPS с:
- Ubuntu 22.04 (или другой Linux)
- Минимум 1GB RAM, 1 CPU
- Docker и Docker Compose

**Установка Docker на Ubuntu:**
```bash
# Обновляем систему
sudo apt update && sudo apt upgrade -y

# Устанавливаем Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавляем пользователя в группу docker
sudo usermod -aG docker $USER

# Устанавливаем Docker Compose
sudo apt install docker-compose-plugin -y

# Перелогиниваемся
exit
```

### Шаг 2: Загрузка проекта на сервер

**Вариант A - через Git:**
```bash
git clone https://github.com/YOUR_USERNAME/shop-app.git
cd shop-app
```

**Вариант B - через SCP (без Git):**
```bash
# Со своего компьютера
scp -r ./site-01 user@YOUR_SERVER_IP:/home/user/shop-app
```

### Шаг 3: Настройка переменных окружения

```bash
# Копируем пример конфига
cp .env.example .env

# Редактируем конфиг
nano .env
```

**Важно изменить:**
```env
# Надёжный пароль для базы данных
POSTGRES_PASSWORD=сгенерируй_надёжный_пароль_32_символа

# Секретный ключ для JWT (генерация: openssl rand -hex 32)
SECRET_KEY=сгенерируй_секретный_ключ_64_символа

# Твой домен
CORS_ORIGINS=http://yourdomain.com,https://yourdomain.com
VITE_API_URL=http://YOUR_SERVER_IP:8000
```

**Генерация секретов:**
```bash
# Генерация SECRET_KEY
openssl rand -hex 32

# Генерация пароля БД
openssl rand -base64 24
```

### Шаг 4: Запуск

```bash
# Собираем и запускаем
docker compose up -d --build

# Проверяем статус
docker compose ps

# Смотрим логи
docker compose logs -f
```

### Шаг 5: Инициализация базы данных

```bash
# Делаем скрипт исполняемым
chmod +x scripts/init-db.sh

# Запускаем инициализацию
./scripts/init-db.sh
```

---

## 🌐 Настройка домена (опционально)

### С Nginx + Let's Encrypt SSL

1. Установи Nginx на сервере:
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

2. Создай конфиг `/etc/nginx/sites-available/shop`:
```nginx
server {
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /login {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
    }

    location /register {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
    }

    location /users {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
    }
}
```

3. Включи сайт и получи SSL:
```bash
sudo ln -s /etc/nginx/sites-available/shop /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 📁 Структура проекта

```
site-01/
├── backend/           # FastAPI backend
│   ├── main.py        # Точка входа
│   ├── models.py      # SQLAlchemy модели
│   ├── schemas.py     # Pydantic схемы
│   ├── database.py    # Подключение к БД
│   ├── auth.py        # JWT аутентификация
│   ├── config.py      # Настройки из .env
│   └── Dockerfile
│
├── frontend/          # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── config/
│   │   └── utils/
│   ├── nginx.conf     # Nginx для production
│   └── Dockerfile
│
├── docker-compose.yml # Оркестрация
├── .env.example       # Шаблон переменных
└── scripts/
    └── init-db.sh     # Инициализация БД
```

---

## 🛠 Полезные команды

```bash
# Перезапуск
docker compose restart

# Остановка
docker compose down

# Полная очистка (удалит данные БД!)
docker compose down -v

# Пересборка конкретного сервиса
docker compose up -d --build backend

# Логи конкретного сервиса
docker compose logs -f backend

# Подключение к базе данных
docker compose exec db psql -U shop_user -d shop_db
```

---

## 💰 Где купить VPS

| Провайдер | Мин. цена | Примечание |
|-----------|-----------|------------|
| [DigitalOcean](https://digitalocean.com) | $4/мес | Прост в использовании |
| [Hetzner](https://hetzner.com) | €3.29/мес | Отличное соотношение цена/качество |
| [Timeweb Cloud](https://timeweb.cloud) | 149₽/мес | Российский, оплата в рублях |
| [VDSina](https://vdsina.ru) | 150₽/мес | Российский |

---

## ✅ Что сделано для production

- [x] Переменные окружения (секреты не в коде)
- [x] Docker контейнеризация
- [x] Gunicorn для backend (многопоточность)
- [x] Nginx для frontend (gzip, кэширование)
- [x] Healthcheck для PostgreSQL
- [x] .dockerignore для оптимизации сборки
- [x] .gitignore для безопасности
