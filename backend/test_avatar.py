"""
Тестовый скрипт для проверки сохранения аватаров
Запуск: python test_avatar.py
"""
import requests
import sys

# URL вашего бэкенда
BASE_URL = "http://127.0.0.1:8000"  # или https://site-01-backend.onrender.com

def test_avatar_flow():
    print("=== Тест сохранения аватара ===\n")
    
    # 1. Логин (замените на реальные данные)
    email = input("Email: ")
    password = input("Password: ")
    
    print("\n1. Логин...")
    response = requests.post(f"{BASE_URL}/login", json={"email": email, "password": password})
    if response.status_code != 200:
        print(f"❌ Ошибка логина: {response.text}")
        return
    
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Успешный логин")
    
    # 2. Получить текущий профиль
    print("\n2. Получение профиля...")
    response = requests.get(f"{BASE_URL}/users/me", headers=headers)
    user = response.json()
    print(f"   Email: {user['email']}")
    print(f"   Username: {user['username']}")
    print(f"   Avatar: {'ЕСТЬ' if user.get('avatar') else 'НЕТ'}")
    
    # 3. Загрузить тестовый аватар (маленький Base64)
    print("\n3. Загрузка тестового аватара...")
    test_avatar = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    
    response = requests.put(f"{BASE_URL}/users/avatar", json={"avatar": test_avatar}, headers=headers)
    if response.status_code != 200:
        print(f"❌ Ошибка загрузки: {response.text}")
        return
    
    print("✅ Аватар загружен")
    
    # 4. Проверить, сохранился ли
    print("\n4. Проверка сохранения...")
    response = requests.get(f"{BASE_URL}/users/me", headers=headers)
    user = response.json()
    
    if user.get('avatar') and user['avatar'] == test_avatar:
        print("✅ Аватар СОХРАНИЛСЯ и загружается правильно!")
    elif user.get('avatar'):
        print(f"⚠️  Аватар есть, но не совпадает")
        print(f"   Ожидалось: {test_avatar[:50]}...")
        print(f"   Получено: {user['avatar'][:50]}...")
    else:
        print("❌ Аватар НЕ СОХРАНИЛСЯ")
    
    # 5. Удалить аватар
    print("\n5. Удаление аватара...")
    response = requests.put(f"{BASE_URL}/users/avatar", json={"avatar": None}, headers=headers)
    if response.status_code == 200:
        print("✅ Аватар удалён")
    
    # 6. Финальная проверка
    print("\n6. Финальная проверка...")
    response = requests.get(f"{BASE_URL}/users/me", headers=headers)
    user = response.json()
    print(f"   Avatar: {'ЕСТЬ' if user.get('avatar') else 'НЕТ'}")
    
    print("\n=== Тест завершён ===")

if __name__ == "__main__":
    try:
        test_avatar_flow()
    except Exception as e:
        print(f"\n❌ Ошибка: {e}")
        sys.exit(1)
