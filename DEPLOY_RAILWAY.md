# 🚂 Деплой Backend на Railway

Railway дает **$5 кредитов в месяц бесплатно** — хватит для небольшого проекта.

## 📝 Пошаговая инструкция

### 1️⃣ Регистрация на Railway

1. Зайди на [railway.app](https://railway.app)
2. Нажми **"Start a New Project"**
3. Войди через GitHub

### 2️⃣ Создание проекта

1. Нажми **"New Project"**
2. Выбери **"Deploy from GitHub repo"**
3. Выбери репозиторий `site-01`
4. Railway автоматически обнаружит Dockerfile

### 3️⃣ Настройка Backend

1. В Railway выбери сервис **backend**
2. Перейди в **"Settings"** → **"Environment"**
3. Добавь переменные:

```env
POSTGRES_USER=shop_user
POSTGRES_PASSWORD=твой_пароль
POSTGRES_DB=shop_db
SECRET_KEY=твой_секретный_ключ
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=https://твой_логин.github.io
```

### 4️⃣ Добавление PostgreSQL

1. Нажми **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway автоматически создаст переменную `DATABASE_URL`
3. В настройках backend добавь:
   ```env
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```

### 5️⃣ Деплой

1. Railway автоматически задеплоит backend
2. Получишь URL типа: `https://site-01-backend-production.up.railway.app`

### 6️⃣ Обновление Frontend

В настройках GitHub репозитория:
1. **Settings** → **Secrets and variables** → **Actions**
2. Добавь secret `VITE_API_URL`:
   ```
   https://site-01-backend-production.up.railway.app
   ```

---

## ✅ После деплоя

Frontend: `https://твой_логин.github.io/site-01/`
Backend: `https://site-01-backend-production.up.railway.app`

---

## 💰 Альтернативы Railway

| Сервис | Бесплатно | Примечание |
|--------|-----------|------------|
| [Render](https://render.com) | $0 | 750 часов/месяц |
| [Fly.io](https://fly.io) | $0 | 3 малых VM |
| [Railway](https://railway.app) | $5 кредитов | Самый простой |
