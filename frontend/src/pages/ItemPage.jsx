import React from 'react';
import { useParams, Link } from 'react-router-dom';

const ItemPage = ({ items, onAdd }) => {
  const { id } = useParams();
  const item = items.find(el => el.id === parseInt(id));

  if (!item || items.length === 0) {
    return <div className="wrapper"><h2>Загрузка...</h2></div>;
  }

  return (
    <div className="wrapper">
      <div className="item-detail-page">
        <div className="item-detail-content">
          
          <div className="img-container">
            <img src={"/img/" + item.img} alt={item.title} />
          </div>
          
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
};

export default ItemPage;