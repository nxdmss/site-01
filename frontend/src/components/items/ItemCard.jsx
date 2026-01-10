/**
 * ═══════════════════════════════════════════════════════════════
 * ITEM CARD COMPONENT
 * Карточка товара в каталоге
 * ═══════════════════════════════════════════════════════════════
 */

import { Link } from 'react-router-dom';

export default function ItemCard({ item, onAdd }) {
  const handleAdd = (e) => {
    e.stopPropagation(); // Предотвращаем переход по ссылке
    onAdd(item);
  };

  return (
    <div className="item">
      {/* Картинка со ссылкой на детальную страницу */}
      <Link to={`/item/${item.id}`}>
        <div className="img-box">
          <img src={item.img} alt={item.title} />
        </div>
      </Link>

      {/* Информация о товаре */}
      <div className="info">
        <h2>{item.title}</h2>
        <b>{item.price}$</b>
        <p>{item.desc}</p>
      </div>

      {/* Кнопка добавления в корзину */}
      <div className="add-to-cart" onClick={handleAdd}>+</div>
    </div>
  );
}
