// HomePage.jsx - ГЛАВНАЯ СТРАНИЦА
// Показывает категории и сетку товаров

import { useState } from 'react';
import { ItemsGrid, Loader, CategoryFilter } from '../components';

// Список категорий (id должен совпадать с category в базе данных)
const CATEGORIES = [
  { id: 'phones', name: 'Телефоны' },
  { id: 'consoles', name: 'Приставки' },
];

export default function HomePage({ items, onAdd }) {
  // Состояние: какая категория выбрана (по умолчанию "all" - все)
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Фильтруем товары по категории
  const filteredItems = activeCategory === 'all'
    ? items  // "Всё" - показываем все товары
    : items.filter(item => item.category === activeCategory);  // Фильтруем

  return (
    <main>
      {/* Кнопки категорий */}
      <CategoryFilter 
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />
      
      {/* Сетка товаров (отфильтрованных) */}
      {filteredItems.length > 0 ? (
        <ItemsGrid items={filteredItems} onAdd={onAdd} />
      ) : (
        <Loader />
      )}
    </main>
  );
}
