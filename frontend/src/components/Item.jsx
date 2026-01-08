import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export class Item extends Component {
  render() {
    return (
      <div className="item">
        {/* Клик на картинку — переход на страницу товара */}
        <Link to={`/item/${this.props.item.id}`}>
          <div className="img-box">
            <img 
              src={"/img/" + this.props.item.img} 
              alt={this.props.item.title} 
            />
          </div>
        </Link>
        
        <div className="info">
          <h2>{this.props.item.title}</h2>
          <b>{this.props.item.price}$</b>
          <p>{this.props.item.desc}</p>
        </div>

        {/* Клик на плюс — ТОЛЬКО добавление и анимация (без перехода) */}
        <div 
          className="add-to-cart" 
          onClick={(e) => {
            e.preventDefault(); // На всякий случай блокируем переходы
            this.props.onAdd(this.props.item);
          }}
        >
          +
        </div>
      </div>
    );
  }
}

export default Item;