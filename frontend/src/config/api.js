/**
 * ═══════════════════════════════════════════════════════════════
 * API CONFIGURATION
 * Централизованные настройки для работы с бэкендом
 * ═══════════════════════════════════════════════════════════════
 */

// Базовый URL бэкенда (берётся из переменных окружения)
export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Эндпоинты API
export const ENDPOINTS = {
  // Авторизация
  LOGIN: '/login',
  REGISTER: '/register',
  USER_ME: '/users/me',
  
  // Товары
  ITEMS: '/api/items',
  
  // Корзина
  CART: '/api/cart',
  CART_ITEM: (id) => `/api/cart/${id}`,
  CART_MINUS: (id) => `/api/cart/minus/${id}`,
  
  // Заказы
  CHECKOUT: '/api/checkout',
  ORDERS: '/api/orders',
};

// Ключи localStorage
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER_EMAIL: 'user_email',
  USER_AVATAR: 'user_avatar',
  GUEST_CART: 'guest_cart',
};
