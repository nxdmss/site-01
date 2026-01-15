# Dockerfile для FastAPI бэкенда
FROM python:3.11-slim

# Рабочая директория
WORKDIR /app

# Копируем requirements и устанавливаем зависимости
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем код бэкенда
COPY backend/ .

# Порт для FastAPI
EXPOSE 8000

# Запуск сервера
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
