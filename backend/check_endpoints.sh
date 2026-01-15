#!/bin/bash
# Скрипт для проверки доступности эндпоинта /users/avatar на сервере

echo "=== Проверка эндпоинтов API ==="
echo ""

# Замените на ваш URL бэкенда
BACKEND_URL="https://site-01-backend.onrender.com"

echo "1. Проверка базового URL..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BACKEND_URL/"

echo ""
echo "2. Проверка /users/me (должен вернуть 401 без токена)..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BACKEND_URL/users/me"

echo ""
echo "3. Проверка /users/avatar (должен вернуть 405 для GET или 401 для PUT без токена)..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BACKEND_URL/users/avatar"

echo ""
echo "4. Проверка с OPTIONS (CORS preflight)..."
curl -s -X OPTIONS -o /dev/null -w "Status: %{http_code}\n" "$BACKEND_URL/users/avatar"

echo ""
echo "=== Если все возвращают 404 - бэкенд еще не обновился ==="
echo "Подождите 2-3 минуты и попробуйте снова"
