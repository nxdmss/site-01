/**
 * ═══════════════════════════════════════════════════════════════
 * HEADER COMPONENT
 * Шапка сайта: навигация, корзина, контакты, профиль
 * ═══════════════════════════════════════════════════════════════
 */

import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FaShoppingCart, FaTrash, FaPlus, FaMinus, FaTelegramPlane, FaInstagram, FaWhatsapp, FaSearch } from 'react-icons/fa';
import { usePopup } from '../../hooks';
import { getUserEmail, isAuthenticated } from '../../utils/storage';
import { CONTACTS, SOCIAL_LINKS } from '../../config/contacts';

// ═══════════════════════════════════════════════════════════════
// ПОДКОМПОНЕНТЫ
// ═══════════════════════════════════════════════════════════════

/** Элемент товара в корзине */
const CartItem = ({ item, onPlus, onMinus, onDelete }) => (
  <div className="cart-item">
    <img src={item.img} alt={item.title} />
    <div className="cart-item-info">
      <h4>{item.title}</h4>
      <p>{item.price}$ × {item.quantity}</p>
      <div className="quantity-controls">
        <button onClick={() => onMinus(item.id)}><FaMinus /></button>
        <span>{item.quantity}</span>
        <button onClick={() => onPlus(item.id)}><FaPlus /></button>
      </div>
    </div>
    <FaTrash className="delete-icon" onClick={() => onDelete(item.id)} />
  </div>
);

/** Аватар пользователя */
const UserAvatar = ({ authenticated, avatar }) => {
  const email = getUserEmail();

  if (authenticated && avatar) {
    return <img src={avatar} alt="Avatar" className="user-avatar" />;
  }

  return (
    <div className="user-avatar-placeholder">
      {authenticated ? email?.[0]?.toUpperCase() || 'U' : 'В'}
    </div>
  );
};

/** Социальные кнопки */
const SocialButtons = () => (
  <div className="contact-actions">
    <a className="contact-action" href={SOCIAL_LINKS.telegram.url} target="_blank" rel="noopener noreferrer" title={SOCIAL_LINKS.telegram.label}>
      <FaTelegramPlane /><span>Telegram</span>
    </a>
    <a className="contact-action" href={SOCIAL_LINKS.instagram.url} target="_blank" rel="noopener noreferrer" title={SOCIAL_LINKS.instagram.label}>
      <FaInstagram /><span>Instagram</span>
    </a>
    <a className="contact-action" href={SOCIAL_LINKS.whatsapp.url} target="_blank" rel="noopener noreferrer" title={SOCIAL_LINKS.whatsapp.label}>
      <FaWhatsapp /><span>WhatsApp</span>
    </a>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// ГЛАВНЫЙ КОМПОНЕНТ
// ═══════════════════════════════════════════════════════════════

export default function Header({ 
  orders = [], 
  authenticated = false,
  userAvatar,
  onDelete, 
  onPlus, 
  onMinus, 
  onCheckout,
  checkoutLoading = false,
  onSearch // Функция поиска из App.jsx
}) {
  // Попапы для корзины и контактов
  const cart = usePopup(['shop-cart-button']);
  const contacts = usePopup(['nav-contact-link']);
  const about = usePopup(['nav-about-link']);

  // Состояние поиска
  const [searchTerm, setSearchTerm] = useState('');

  // Общая сумма корзины
  const total = orders.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Обработчик изменения поиска
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch?.(term); // Вызываем функцию поиска из App.jsx
  };

  // Очистка поиска
  const clearSearch = () => {
    setSearchTerm('');
    onSearch?.('');
  };

  // Обработчик оформления заказа
  const handleCheckout = async () => {
    const success = await onCheckout?.();
    if (success) {
      alert('Заказ оформлен!');
      cart.close();
    }
  };

  return (
    <header>
      {/* ─────────────── НАВИГАЦИЯ ─────────────── */}
      <div>
        <Link to="/" className="logo">
          <div className="logo-3d-box">
            <div>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </Link>
        
        {/* ─────────────── ПОИСК В ЦЕНТРЕ ─────────────── */}
        <div className="search-container">
          <div className="search-bar">
            <FaSearch className="search-bar-icon" />
            <input
              type="text"
              className="search-bar-input"
              placeholder="Поиск товаров..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <button className="search-clear" onClick={clearSearch}>
                ×
              </button>
            )}
          </div>
        </div>
        
        <div className="nav-container">
          <ul className="nav">
            <li className="nav-about-link" onClick={about.toggle}>Про нас</li>
            <li className="nav-contact-link" onClick={contacts.toggle}>Контакты</li>
          </ul>

          {/* Иконка корзины */}
          <div className="cart-icon-wrapper">
            <FaShoppingCart
              onClick={cart.toggle}
              className={`shop-cart-button ${cart.isOpen ? 'active' : ''}`}
            />
            {orders.length > 0 && <span className="cart-count">{orders.length}</span>}
          </div>

          {/* Аватар / Вход */}
          <Link to={authenticated ? '/cabinet' : '/login'} className="user-profile-link">
            <UserAvatar authenticated={authenticated} avatar={userAvatar} />
          </Link>
        </div>

        {/* ─────────────── ПОПАП КОРЗИНЫ ─────────────── */}
        {cart.isOpen && (
          <div className="shop-cart" ref={cart.ref}>
            <h3>Корзина</h3>
            
            {orders.length > 0 ? (
              <>
                <div className="cart-items-list">
                  {orders.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onPlus={onPlus}
                      onMinus={onMinus}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
                
                <div className="cart-total">
                  <span>Итого:</span>
                  <b>{total.toLocaleString()}$</b>
                </div>
                
                <button className="checkout-btn" onClick={handleCheckout} disabled={checkoutLoading}>
                  {checkoutLoading ? 'Обработка...' : 'Оформить заказ'}
                </button>
                
                {!authenticated && (
                  <p style={{ fontSize: 12, color: '#888', marginTop: 8, textAlign: 'center' }}>
                    Войдите для оформления заказа
                  </p>
                )}
              </>
            ) : (
              <div className="empty-cart">Корзина пуста</div>
            )}
          </div>
        )}

        {/* ─────────────── ПОПАП КОНТАКТОВ ─────────────── */}
        {contacts.isOpen && (
          <div className="shop-cart info-popup" ref={contacts.ref}>
            <h3>Контакты</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ color: '#444' }}><b style={{ marginRight: 8 }}>Телефон:</b>{CONTACTS.phone}</div>
              <div style={{ color: '#444' }}><b style={{ marginRight: 8 }}>Email:</b>{CONTACTS.email}</div>
              <div style={{ color: '#444' }}><b style={{ marginRight: 8 }}>Адрес:</b>{CONTACTS.address}</div>
            </div>
            <SocialButtons />
          </div>
        )}

        {/* ─────────────── ПОПАП О НАС ─────────────── */}
        {about.isOpen && (
          <div className="shop-cart info-popup" ref={about.ref}>
            <h3>О нашем магазине</h3>
            <div style={{ color: '#444', lineHeight: '1.6', padding: '10px 0' }}>
              <p style={{ marginBottom: '10px' }}>Мы — современные додики</p>
              <p style={{ marginBottom: '10px' }}>Предлагаем только оригинальную продукцию для додиков</p>
              <p style={{ marginBottom: '10px' }}>Быстрая доставка по всей стране и додики</p>
              <hr style={{ margin: '15px 0', border: 'none', borderTop: '1px solid #eee' }} />
              <p style={{ fontStyle: 'italic', color: '#888' }}>С заботой о вас, команда додики</p>
            </div>
          </div>
        )}
      </div>

      {/* ...banner removed... */}
    </header>
  );
}
