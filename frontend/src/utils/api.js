/**
 * ═══════════════════════════════════════════════════════════════
 * API CLIENT
 * Настроенный axios-клиент с автоматической авторизацией
 * ═══════════════════════════════════════════════════════════════
 */

import axios from 'axios';
import { API_URL } from '../config/api';
import { getToken } from './storage';

// Создаём экземпляр axios с базовым URL
const api = axios.create({
  baseURL: API_URL,
});

// Интерсептор: автоматически добавляем токен к запросам
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
