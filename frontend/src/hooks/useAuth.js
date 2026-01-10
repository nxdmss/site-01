/**
 * ═══════════════════════════════════════════════════════════════
 * USE AUTH HOOK
 * Логика авторизации пользователя
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useCallback } from 'react';
import api from '../utils/api';
import { ENDPOINTS } from '../config/api';
import {
  setToken,
  setUserEmail,
  clearAuthData,
  isAuthenticated as checkAuth,
} from '../utils/storage';

export function useAuth() {
  const [authenticated, setAuthenticated] = useState(checkAuth());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ─────────────────────────────────────────────────────────────────
  // ВХОД
  // ─────────────────────────────────────────────────────────────────
  
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post(ENDPOINTS.LOGIN, { email, password });
      setToken(data.access_token);
      setUserEmail(email);
      setAuthenticated(true);
      return true;
    } catch (e) {
      setError(e.response?.data?.detail || 'Ошибка входа. Проверьте данные');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // РЕГИСТРАЦИЯ
  // ─────────────────────────────────────────────────────────────────
  
  const register = useCallback(async (email, password, username) => {
    setLoading(true);
    setError('');

    // Валидация пароля
    if (password.length < 8) {
      setError('Пароль должен быть минимум 8 символов');
      setLoading(false);
      return false;
    }

    if (password.length > 72) {
      setError('Пароль не должен быть длиннее 72 символов');
      setLoading(false);
      return false;
    }

    try {
      await api.post(ENDPOINTS.REGISTER, { email, password, username });
      return true;
    } catch (e) {
      setError(e.response?.data?.detail || 'Ошибка регистрации');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // ВЫХОД
  // ─────────────────────────────────────────────────────────────────
  
  const logout = useCallback(() => {
    clearAuthData();
    setAuthenticated(false);
  }, []);

  return {
    authenticated,
    loading,
    error,
    setError,
    login,
    register,
    logout,
  };
}
