# Инструкция: Исправление ошибки "Dockerfile not found" в Render

## Проблема
Render не находит Dockerfile, хотя он есть в репозитории.

## Причина
В настройках сервиса Render указан Root Directory = `backend/`, но Dockerfile находится в корне проекта.

## Решение 1: Изменить настройки в Render Dashboard (Рекомендуется)

1. Откройте https://dashboard.render.com
2. Найдите сервис **site-01-backend**
3. Нажмите **Settings**
4. Найдите секцию **Build & Deploy**
5. Найдите поле **Root Directory**
6. Если там указано `backend/` или что-то ещё — **ОЧИСТИТЕ ЭТО ПОЛЕ** (оставьте пустым)
7. Найдите поле **Dockerfile Path** 
8. Укажите: `./Dockerfile` (или просто `Dockerfile`)
9. Нажмите **Save Changes** внизу страницы
10. Нажмите **Manual Deploy** → **Clear build cache & deploy**

## Решение 2: Переместить Dockerfile в backend/ (Если не помогло Решение 1)

Если Render всё равно не может найти Dockerfile:

```bash
cd /Users/nxdms/Desktop/prjcts/site_01/site-01
cp Dockerfile backend/Dockerfile

# Изменить пути в backend/Dockerfile:
# COPY backend/requirements.txt . → COPY requirements.txt .
# COPY backend/ . → COPY . .
```

Затем в настройках Render:
- Root Directory: `backend/`
- Dockerfile Path: `./Dockerfile`

## Решение 3: Использовать render.yaml (Автоматическая конфигурация)

Если вы создаёте новый сервис:
1. Удалите текущий backend сервис в Render
2. Запушьте обновлённый `render.yaml` (уже сделано)
3. В Render Dashboard → **New** → **Blueprint**
4. Подключите репозиторий GitHub
5. Render автоматически создаст сервисы из `render.yaml`

## Проверка после исправления

```bash
./backend/check_endpoints.sh
```

Должно быть:
```
3. Проверка /users/avatar...
Status: 405  ← успех!
```

## Текущие файлы:

✅ `/Dockerfile` — в корне (для бэкенда)  
✅ `/frontend/Dockerfile` — для фронтенда (если нужен)  
✅ `/render.yaml` — Blueprint конфигурация

Попробуйте сначала **Решение 1** — это самый быстрый способ!
