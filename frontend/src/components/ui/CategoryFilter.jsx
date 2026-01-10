/**
 * ═══════════════════════════════════════════════════════════════
 * ФИЛЬТР КАТЕГОРИЙ
 * Кнопки для переключения между категориями товаров
 * ═══════════════════════════════════════════════════════════════
 */

export default function CategoryFilter({ categories, activeCategory, onSelect }) {
  return (
    <div className="category-filter">
      {/* Кнопка "Всё" - показывает все товары */}
      <button
        className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`}
        onClick={() => onSelect('all')}
      >
        Всё
      </button>
      
      {/* Кнопки категорий */}
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
          onClick={() => onSelect(cat.id)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
