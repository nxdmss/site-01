// CabinetPage.jsx - ЛИЧНЫЙ КАБИНЕТ
// Страница, где пользователь видит свои данные, историю заказов и может сменить фото.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// api - наш настроенный axios (делает запросы с токеном авторизации)
import { api } from '../utils';
// import утилит для работы с localStorage (очистка сессии)
import { clearAuthData } from '../utils/storage';
// Эндпоинты (адреса) API
import { ENDPOINTS } from '../config/api';
import { Loader } from '../components';

// == КОМПОНЕНТ СЕКЦИИ АВАТАРА (Вынесен отдельно для чистоты) ==
const AvatarSection = ({ avatar, email, onAvatarChange, onAvatarRemove }) => (
  <div className="avatar-section">
    <div className="avatar-display">
      {avatar ? (
        // Если есть картинка - показываем фото
        <img src={avatar} alt="Avatar" className="profile-avatar" />
      ) : (
        // Если нет - показываем кружок с первой буквой email
        <div className="profile-avatar-placeholder">{email?.[0]?.toUpperCase() || 'U'}</div>
      )}
    </div>
    <div className="avatar-controls">
      {/* Кнопка загрузки - это стилизованный label вокруг невидимого input type="file" */}
      <label className="upload-avatar-btn">
        {avatar ? 'Изменить фото' : 'Загрузить фото'}
        {/* accept="image/*" разрешает выбирать только картинки */}
        <input type="file" accept="image/*" onChange={onAvatarChange} style={{ display: 'none' }} />
      </label>
      {/* Кнопка удалить появляется только если аватар есть */}
      {avatar && <button className="remove-avatar-btn" onClick={onAvatarRemove}>Удалить</button>}
    </div>
  </div>
);

// == КОМПОНЕНТ КАРТОЧКИ ЗАКАЗА ==
const OrderCard = ({ order }) => (
  <div className="order-item">
    <div className="order-header">
      <span className="order-id">Заказ #{order.id}</span>
      {/* Форматируем дату в русский формат (ДД.ММ.ГГГГ) */}
      <span className="order-date">{new Date(order.created_at).toLocaleDateString('ru-RU')}</span>
    </div>
    <div className="order-total">
      <span>Сумма:</span>
      {/* toLocaleString() красиво форматирует числа (1000 -> 1 000) */}
      <span className="order-price">${order.total_price.toLocaleString()}</span>
    </div>
  </div>
);

// == ГЛАВНЫЙ КОМПОНЕНТ СТРАНИЦЫ ==
export default function CabinetPage() {
  const navigate = useNavigate(); // Хук для перенаправления пользователя
  
  // Local State (Состояния компонента)
  const [user, setUser] = useState(null);       // Данные юзера (email, имя)
  const [orders, setOrders] = useState([]);     // Список заказов
  const [loading, setLoading] = useState(true); // Загружается ли страница?
  const [error, setError] = useState('');       // Текст ошибки, если она случилась
  const [avatar, setAvatarState] = useState(null); // Текущий аватар (из сервера)

  // ЗАГРУЗКА ДАННЫХ ПРИ СТАРТЕ
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Promise.all запускает ДВА запроса одновременно и ждет, пока оба завершатся
        // 1. Получаем данные о себе (api/users/me)
        // 2. Получаем историю заказов
        const [userRes, ordersRes] = await Promise.all([
          api.get(ENDPOINTS.USER_ME),
          api.get(ENDPOINTS.ORDERS).catch(() => ({ data: [] })), // Если заказы упали, просто вернем пустой массив, но не уроним всю страницу
        ]);
        
        setUser(userRes.data);
        setAvatarState(userRes.data.avatar); // Загружаем аватар с сервера
        setOrders(ordersRes.data);
      } catch (e) {
        // Если ошибка 401 (Unauthorized) - значит токен протух, кидаем на логин
        if (e.response?.status === 401) navigate('/login');
        else setError('Ошибка загрузки профиля');
      } finally {
        // В любом случае (успех или ошибка) выключаем крутилку загрузки
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // Выход из аккаунта
  const handleLogout = () => { 
    clearAuthData(); // Чистим токен
    navigate('/');   // Уходим на главную
  };

  // Обработка загрузки файла аватара
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]; // Файл, который выбрал пользователь
    if (!file) return;

    // Валидация
    if (!file.type.startsWith('image/')) { alert('Пожалуйста, выберите изображение'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Размер файла не должен превышать 5 МБ'); return; }

    // Конвертируем файл в строку Base64 для отправки на сервер
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        // Отправляем на сервер
        const response = await api.put(ENDPOINTS.USER_AVATAR, { avatar: reader.result });
        setAvatarState(response.data.avatar); // Обновляем картинку на экране
      } catch (error) {
        alert('Ошибка загрузки аватара');
        console.error(error);
      }
    };
    reader.readAsDataURL(file);
  };

  // Удаление аватара
  const handleAvatarRemove = async () => {
    try {
      await api.put(ENDPOINTS.USER_AVATAR, { avatar: null });
      setAvatarState(null);
    } catch (error) {
      alert('Ошибка удаления аватара');
      console.error(error);
    }
  };

  // Если грузимся - показываем спиннер
  if (loading) return <div className="auth-page"><div className="wrapper"><Loader /></div></div>;
  
  // Если ошибка - показываем ошибку
  if (error) return <div className="auth-page"><div className="wrapper"><div className="auth-error">{error}</div></div></div>;

  return (
    <div className="cabinet-page">
      <div className="wrapper">
        <div className="cabinet-container">
          <div className="cabinet-header">
            <h1>Мой кабинет</h1>
            <button className="logout-btn" onClick={handleLogout}>Выход</button>
          </div>
          
          {user && ( // Рендерим контент только если юзер загрузился
            <div className="cabinet-content">
              {/* Левая колонка - Профиль */}
              <div className="profile-section">
                <h2>Профиль</h2>
                <AvatarSection 
                  avatar={avatar} 
                  email={user.email} 
                  onAvatarChange={handleAvatarChange} 
                  onAvatarRemove={handleAvatarRemove} 
                />
                <div className="profile-info">
                  <div className="info-item">
                     <span className="info-label">Имя:</span>
                     <span className="info-value">{user.username}</span>
                  </div>
                  <div className="info-item">
                     <span className="info-label">Email:</span>
                     <span className="info-value">{user.email}</span>
                  </div>
                </div>
              </div>
              
              {/* Правая колонка - Заказы */}
              <div className="orders-section">
                <h2>История заказов</h2>
                {orders.length > 0 ? (
                  // .map пробегает по массиву и рисует карточку для каждого заказа
                  <div className="orders-list">{orders.map((order) => <OrderCard key={order.id} order={order} />)}</div>
                ) : (
                  <p className="empty-orders">У вас пока нет заказов</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
