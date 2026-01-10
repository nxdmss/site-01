// App.jsx - ГЛАВНЫЙ КОМПОНЕНТ ПРИЛОЖЕНИЯ
// Это "сердце" сайта, где собираются все страницы и настраивается навигация.

// 1. ИМПОРТЫ БИБЛИОТЕК
// React хуки: 
// useState - для хранения изменяющихся данных (состояние)
// useEffect - для выполнения действий при запуске (загрузка данных)
// useCallback/useRef - для оптимизации и работы с таймерами
import { useState, useEffect, useCallback, useRef } from 'react';

// Роутинг (Маршрутизация):
// BrowserRouter - включает навигацию
// Routes/Route - определяет, какую страницу показать по какому адресу
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 2. ИМПОРТЫ НАШИХ КОМПОНЕНТОВ
// ".." означает "выйти на уровень выше". Мы выходим из папки src и идем в components.
import { Header, Footer } from './components';

// Импорт страниц. index.js в папке pages позволяет импортировать их одной строкой.
import { HomePage, ItemDetailPage, LoginPage, RegisterPage, CabinetPage } from './pages';

// 3. ИМПОРТЫ ЛОГИКИ (ХУКИ И УТИЛИТЫ)
// useCart - наш самописный хук (функция), в котором живет вся логика корзины
import { useCart } from './hooks';
import { api, isAuthenticated, clearAuthData } from './utils'; // Утилиты для API и проверки входа
import { ENDPOINTS } from './config'; // Адреса для запросов к серверу

export default function App() {
  // === СОСТОЯНИЕ (STATE) ===
  // Здесь хранятся данные, которые влияют на отображение всего приложения
  
  // Список товаров, загруженный с сервера
  const [items, setItems] = useState([]); 
  
  // Фильтрация товаров (для поиска)
  const [filteredItems, setFilteredItems] = useState([]);
  
  // Проверка: вошел ли пользователь в систему? (true/false)
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  
  // ...existing code...

  // === ЛОГИКА АВТОРИЗАЦИИ ===
  // Функция выхода из в системы. useCallback запоминает функцию, чтобы она не пересоздавалась.
  const handleLogout = useCallback(() => {
    clearAuthData();        // Удаляем токен из браузера (localStorage)
    setAuthenticated(false); // Обновляем состояние, чтобы React перерисовал интерфейс
  }, []);

  // === ПОДКЛЮЧЕНИЕ КОРЗИНЫ ===
  // Вызываем наш хук корзины. Он возвращает объект с товарами (orders) и функции управления ими.
  // Передаем туда handleLogout, чтобы очистить корзину при выходе, если нужно.
  const cart = useCart(handleLogout);

  // === ЗАГРУЗКА ДАННЫХ (ЭФФЕКТЫ) ===
  // useEffect с пустым массивом [] выполняется ТОЛЬКО ОДИН РАЗ при запуске сайта
  useEffect(() => {
    const loadItems = async () => {
      try {
        // Делаем GET запрос на сервер за товарами
        const { data } = await api.get(ENDPOINTS.ITEMS);
        setItems(data);          // Сохраняем исходный список
        setFilteredItems(data);  // Изначально показываем все товары
      } catch (e) {
        console.error('Ошибка загрузки товаров:', e);
      }
    };
    
    loadItems();     // Запускаем загрузку товаров
    cart.loadCart(); // Запускаем загрузку корзины (из localStorage или сервера)
  }, []);

  // Анимация полета товара (авто-скрытие)
  // ...existing code...

  // === ОБРАБОТЧИКИ СОБЫТИЙ ===
  // Вызывается, когда пользователь нажимает "В корзину" на любом товаре
  const handleAddToCart = async (item) => {
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Прокрутка вверх
    await cart.addToCart(item); // Добавляем товар в логику корзины
  };

  // ФУНКЦИЯ ПОИСКА
  // Принимает текст из Header и фильтрует список items
  const handleSearch = (term) => {
    if (!term) {
      setFilteredItems(items); // Если поиск пуст -> показываем всё
    } else {
      setFilteredItems(items.filter(item => 
        item.title.toLowerCase().includes(term.toLowerCase())
      ));
    }
  };

  // Собираем все пропсы (данные) для Шапки сайта в один объект, чтобы было чище
  const headerProps = {
    orders: cart.orders,          // Список товаров в корзине
    authenticated,                // Статус авторизации
    onDelete: cart.removeFromCart, // Функция удаления
    onPlus: cart.plusItem,        // Функция +
    onMinus: cart.minusItem,      // Функция -
    onCheckout: cart.checkout,    // Функция оформления заказа
    checkoutLoading: cart.loading,// Статус загрузки при оформлении
    onSearch: handleSearch,       // Передаем функцию поиска в хедер
  };

  // === ОТРИСОВКА (RENDER) ===
  return (
    <BrowserRouter>
      <div className="wrapper">
  {/* ...existing code... */}
        
        {/* Настройка маршрутов */}
        <Routes>
          {/* Главная страница */}
          {/* Мы оборачиваем каждую страницу в Header и Footer, чтобы они были везде */}
          <Route path="/" element={
            <>
              <Header {...headerProps} /> 
              {/* Передаем отфильтрованный список (filteredItems) вместо полного (items) */}
              <HomePage items={filteredItems} onAdd={handleAddToCart} />
              <Footer />
            </>
          } />
          
          {/* Страница товара (id - переменная часть URL) */}
          <Route path="/item/:id" element={
            <>
              <Header {...headerProps} />
              <ItemDetailPage items={items} onAdd={handleAddToCart} />
              <Footer />
            </>
          } />
          
          {/* Страницы авторизации */}
          <Route path="/login" element={<><Header {...headerProps} /><LoginPage /></>} />
          <Route path="/register" element={<><Header {...headerProps} /><RegisterPage /></>} />
          
          {/* Личный кабинет */}
          <Route path="/cabinet" element={<><Header {...headerProps} /><CabinetPage /></>} />
          
          {/* Перенаправление всех неизвестных адресов на главную */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
