/**
 * ═══════════════════════════════════════════════════════════════
 * LOCAL STORAGE UTILITIES
 * Утилиты для работы с localStorage
 * ═══════════════════════════════════════════════════════════════
 */

import { STORAGE_KEYS } from '../config/api';

// ─────────────────────────────────────────────────────────────────
// АВТОРИЗАЦИЯ
// ─────────────────────────────────────────────────────────────────

export const getToken = () => localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
export const setToken = (token) => localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
export const removeToken = () => localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);

export const getUserEmail = () => localStorage.getItem(STORAGE_KEYS.USER_EMAIL);
export const setUserEmail = (email) => localStorage.setItem(STORAGE_KEYS.USER_EMAIL, email);
export const removeUserEmail = () => localStorage.removeItem(STORAGE_KEYS.USER_EMAIL);

export const isAuthenticated = () => !!getToken();

// ─────────────────────────────────────────────────────────────────
// АВАТАР
// ─────────────────────────────────────────────────────────────────

export const getAvatar = () => localStorage.getItem(STORAGE_KEYS.USER_AVATAR);
export const setAvatar = (base64) => localStorage.setItem(STORAGE_KEYS.USER_AVATAR, base64);
export const removeAvatar = () => localStorage.removeItem(STORAGE_KEYS.USER_AVATAR);

// ─────────────────────────────────────────────────────────────────
// ГОСТЕВАЯ КОРЗИНА
// ─────────────────────────────────────────────────────────────────

export const getGuestCart = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.GUEST_CART) || '[]');
  } catch {
    return [];
  }
};

export const setGuestCart = (cart) => {
  localStorage.setItem(STORAGE_KEYS.GUEST_CART, JSON.stringify(cart));
};

export const clearGuestCart = () => {
  localStorage.removeItem(STORAGE_KEYS.GUEST_CART);
};

// ─────────────────────────────────────────────────────────────────
// ОЧИСТКА ПРИ ВЫХОДЕ
// ─────────────────────────────────────────────────────────────────

export const clearAuthData = () => {
  removeToken();
  removeUserEmail();
};
