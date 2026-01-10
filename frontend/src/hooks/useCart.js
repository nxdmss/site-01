/**
 * ═══════════════════════════════════════════════════════════════
 * USE CART HOOK
 * Логика работы с корзиной (гостевая + авторизованная)
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useCallback } from 'react';
import api from '../utils/api';
import { ENDPOINTS } from '../config/api';
import { getGuestCart, setGuestCart, isAuthenticated } from '../utils/storage';

export function useCart(onUnauthorized) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // ─────────────────────────────────────────────────────────────────
  // ЗАГРУЗКА КОРЗИНЫ
  // ─────────────────────────────────────────────────────────────────
  
  const loadCart = useCallback(async () => {
    if (!isAuthenticated()) {
      setOrders(getGuestCart());
      return;
    }

    try {
      const { data } = await api.get(ENDPOINTS.CART);
      setOrders(data);
    } catch (e) {
      if (e.response?.status === 401) onUnauthorized?.();
    }
  }, [onUnauthorized]);

  // ─────────────────────────────────────────────────────────────────
  // ДОБАВЛЕНИЕ В КОРЗИНУ
  // ─────────────────────────────────────────────────────────────────
  
  const addToCart = useCallback(async (item) => {
    if (!isAuthenticated()) {
      const cart = getGuestCart();
      const idx = cart.findIndex((o) => o.id === item.id);
      
      if (idx >= 0) {
        cart[idx].quantity += 1;
      } else {
        cart.push({ ...item, quantity: 1 });
      }
      
      setGuestCart(cart);
      setOrders(cart);
      return;
    }

    try {
      await api.post(ENDPOINTS.CART_ITEM(item.id));
      await loadCart();
    } catch (e) {
      if (e.response?.status === 401) onUnauthorized?.();
    }
  }, [loadCart, onUnauthorized]);

  // ─────────────────────────────────────────────────────────────────
  // УВЕЛИЧЕНИЕ КОЛИЧЕСТВА
  // ─────────────────────────────────────────────────────────────────
  
  const plusItem = useCallback(async (id) => {
    if (!isAuthenticated()) {
      const cart = getGuestCart();
      const idx = cart.findIndex((o) => o.id === id);
      
      if (idx >= 0) {
        cart[idx].quantity += 1;
        setGuestCart(cart);
        setOrders(cart);
      }
      return;
    }

    try {
      await api.post(ENDPOINTS.CART_ITEM(id));
      await loadCart();
    } catch (e) {
      if (e.response?.status === 401) onUnauthorized?.();
    }
  }, [loadCart, onUnauthorized]);

  // ─────────────────────────────────────────────────────────────────
  // УМЕНЬШЕНИЕ КОЛИЧЕСТВА
  // ─────────────────────────────────────────────────────────────────
  
  const minusItem = useCallback(async (id) => {
    if (!isAuthenticated()) {
      const cart = getGuestCart();
      const idx = cart.findIndex((o) => o.id === id);
      
      if (idx >= 0) {
        if (cart[idx].quantity > 1) {
          cart[idx].quantity -= 1;
        } else {
          cart.splice(idx, 1);
        }
        setGuestCart(cart);
        setOrders(cart);
      }
      return;
    }

    try {
      await api.patch(ENDPOINTS.CART_MINUS(id));
      await loadCart();
    } catch (e) {
      if (e.response?.status === 401) onUnauthorized?.();
    }
  }, [loadCart, onUnauthorized]);

  // ─────────────────────────────────────────────────────────────────
  // УДАЛЕНИЕ ИЗ КОРЗИНЫ
  // ─────────────────────────────────────────────────────────────────
  
  const removeFromCart = useCallback(async (id) => {
    if (!isAuthenticated()) {
      const cart = getGuestCart().filter((o) => o.id !== id);
      setGuestCart(cart);
      setOrders(cart);
      return;
    }

    try {
      await api.delete(ENDPOINTS.CART_ITEM(id));
      await loadCart();
    } catch (e) {
      if (e.response?.status === 401) onUnauthorized?.();
    }
  }, [loadCart, onUnauthorized]);

  // ─────────────────────────────────────────────────────────────────
  // ОФОРМЛЕНИЕ ЗАКАЗА
  // ─────────────────────────────────────────────────────────────────
  
  const checkout = useCallback(async () => {
    if (!isAuthenticated()) {
      alert('Войдите в аккаунт для оформления заказа');
      return false;
    }

    setLoading(true);
    try {
      await api.post(ENDPOINTS.CHECKOUT);
      await loadCart();
      return true;
    } catch (e) {
      alert(e.response?.data?.detail || 'Ошибка оформления');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadCart]);

  return {
    orders,
    loading,
    loadCart,
    addToCart,
    plusItem,
    minusItem,
    removeFromCart,
    checkout,
  };
}
