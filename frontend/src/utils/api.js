// API client with automatic authorization
import axios from 'axios';
import { API_URL } from '../config/api';
import { getToken } from './storage';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
