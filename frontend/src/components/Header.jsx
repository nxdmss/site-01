import React, { useState, useEffect, useRef } from 'react'
import { FaShoppingCart, FaTrash, FaPlus, FaMinus } from "react-icons/fa";

export default function Header(props) {
  let [cartOpen, setCartOpen] = useState(false);
  const cartRef = useRef(null);

  const totalSum = props.orders.reduce((sum, el) => sum + (el.price * el.quantity), 0);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartOpen && cartRef.current && !cartRef.current.contains(event.target) && !event.target.classList.contains('shop-cart-button')) {
        setCartOpen(false);
      }
    };

    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        setCartOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [cartOpen]);

  return (
    <header>
        <div>
            <span className='logo'>Shop</span>
            <div className='nav-container'>
                <ul className='nav'>
                    <li>Про нас</li>
                    <li>Контакты</li>
                    <li>Кабинет</li>
                </ul>
                <div className="cart-icon-wrapper">
                    <FaShoppingCart 
                        onClick={() => setCartOpen(!cartOpen)} 
                        className={`shop-cart-button ${cartOpen ? 'active' : ''}`} 
                    />
                    {props.orders.length > 0 && <span className="cart-count">{props.orders.length}</span>}
                </div>
            </div>

            {cartOpen && (
                <div className='shop-cart' ref={cartRef}>
                    <h3>Корзина</h3>
                    {props.orders.length > 0 ? (
                        <>
                            <div className="cart-items-list">
                                {props.orders.map(el => (
                                    <div key={el.id} className="cart-item">
                                        <img src={"/img/" + el.img} alt={el.title} />
                                        <div className="cart-item-info">
                                            <h4>{el.title}</h4>
                                            <p>{el.price}$ x {el.quantity}</p>
                                            <div className="quantity-controls">
                                                <button onClick={() => props.onMinus(el.id)}><FaMinus /></button>
                                                <span>{el.quantity}</span>
                                                <button onClick={() => props.onPlus(el.id)}><FaPlus /></button>
                                            </div>
                                        </div>
                                        <FaTrash className="delete-icon" onClick={() => props.onDelete(el.id)} />
                                    </div>
                                ))}
                            </div>
                            <div className="cart-total">
                                <span>Итого:</span>
                                <b>{totalSum.toLocaleString()}$</b>
                            </div>
                            <button className="checkout-btn">Оформить заказ</button>
                        </>
                    ) : (
                        <div className="empty-cart">Ваша корзина пуста</div>
                    )}
                </div>
            )}
        </div>
        <div className='presentation'>
            <h1>Shop</h1>
            <h1>Kakashki</h1>
        </div>
    </header>
  )
}