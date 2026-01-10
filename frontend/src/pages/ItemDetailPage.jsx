// ItemDetailPage.jsx - СТРАНИЦА ОДНОГО ТОВАРА
// Отображает детальную информацию, когда пользователь кликнул на товар.

// useParams позволяет достать параметры из адресной строки (например, id из /item/5)
// Link - для создания ссылок без перезагрузки страницы
import { useParams, Link } from 'react-router-dom';
import { Loader } from '../components';

export default function ItemPage({ items, onAdd }) {
  // Вытаскиваем "id" из URL (/item/123 -> id = "123")
  const { id } = useParams();
  
  // Ищем нужный товар в массиве всех товаров по этому ID
  // parseInt(id) превращает строку "123" в число 123
  const item = items.find((el) => el.id === parseInt(id));

  // Показываем загрузку, если товар ещё не найден (например, товары еще грузятся)
  if (!item || items.length === 0) {
    return (
      <div className="wrapper">
        <Loader />
      </div>
    );
  }

  return (
    <div className="wrapper">
      <div className="item-detail-page">
        <div className="item-detail-content">
          {/* Изображение товара */}
          <div className="img-container">
            <img src={item.img} alt={item.title} />
          </div>

          {/* Информация о товаре */}
          <div className="item-detail-info">
            <Link to="/" className="back-link">← НАЗАД К КАТАЛОГУ</Link>
            <h2>{item.title}</h2>
            <p>{item.desc}</p>
            <b>{item.price}$</b>
            <button className="add-to-cart-btn" onClick={() => onAdd(item)}>
              Добавить в корзину
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
