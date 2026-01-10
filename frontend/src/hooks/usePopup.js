/**
 * ═══════════════════════════════════════════════════════════════
 * USE POPUP HOOK
 * Универсальный хук для управления всплывающими окнами
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export function usePopup(excludeClasses = []) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  // Закрытие по клику вне области и Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      // Проверяем, кликнули ли на элемент-исключение
      const clickedExcluded = excludeClasses.some(
        (cls) => e.target.classList?.contains(cls)
      );
      
      if (ref.current && !ref.current.contains(e.target) && !clickedExcluded) {
        close();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, excludeClasses, close]);

  return { isOpen, ref, open, close, toggle };
}
