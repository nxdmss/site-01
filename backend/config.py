"""
═══════════════════════════════════════════════════════════════
КОНФИГУРАЦИЯ ПРИЛОЖЕНИЯ
Загружает настройки из переменных окружения
═══════════════════════════════════════════════════════════════
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # База данных
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://nxdms@localhost:5432/shop_db")
    
    # Безопасность
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 дней
    
    # CORS
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

settings = Settings()
