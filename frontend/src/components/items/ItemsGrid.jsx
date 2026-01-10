/**
 * ═══════════════════════════════════════════════════════════════
 * ITEMS GRID COMPONENT
 * Сетка карточек товаров
 * ═══════════════════════════════════════════════════════════════
 */

import ItemCard from './ItemCard';

export default function ItemsGrid({ items, onAdd }) {
  return (
    <div className="items-grid">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} onAdd={onAdd} />
      ))}
    </div>
  );
}
