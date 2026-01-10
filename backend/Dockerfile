# ═══════════════════════════════════════════════════════════════
# DOCKERFILE ДЛЯ BACKEND
# ═══════════════════════════════════════════════════════════════

FROM python:3.11-slim

WORKDIR /app

# Установка зависимостей
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# Копируем код
COPY . .

# Порт
EXPOSE 8000

# Запуск через gunicorn (production)
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "main:app", "--bind", "0.0.0.0:8000", "--workers", "2"]
