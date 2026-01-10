# Shop Site

Интернет-магазин на React + FastAPI + PostgreSQL

## Структура проекта

```
├── backend/           # FastAPI сервер
│   ├── main.py       # API endpoints
│   ├── auth.py       # Авторизация
│   ├── models.py     # SQLAlchemy модели
│   ├── schemas.py    # Pydantic схемы
│   ├── database.py   # Подключение к БД
│   └── config.py     # Настройки
│
└── frontend/          # React приложение
    └── src/
        ├── components/  # UI компоненты
        ├── pages/       # Страницы
        ├── hooks/       # React хуки
        ├── utils/       # Утилиты
        └── config/      # Конфигурация
```

## Запуск локально

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Деплой

- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Render PostgreSQL

## Переменные окружения (backend)

- `DATABASE_URL` - URL PostgreSQL
- `SECRET_KEY` - Ключ для JWT
