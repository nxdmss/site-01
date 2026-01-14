-- Добавление поля avatar в таблицу users
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;
