// Main App component: routing and state management
import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header, Footer } from './components';
import { HomePage, ItemDetailPage, LoginPage, RegisterPage, CabinetPage } from './pages';
import { useCart } from './hooks';
import { api, isAuthenticated, clearAuthData } from './utils';
import { ENDPOINTS } from './config';

export default function App() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [userAvatar, setUserAvatar] = useState(null);

  const handleLogout = useCallback(() => {
    clearAuthData();
    setAuthenticated(false);
    setUserAvatar(null);
  }, []);

  const cart = useCart(handleLogout);

  // Загрузка профиля пользователя
  useEffect(() => {
    const loadUser = async () => {
      if (authenticated) {
        try {
          const { data } = await api.get(ENDPOINTS.USER_ME);
          setUserAvatar(data.avatar);
        } catch (e) {
          if (e.response?.status === 401) {
            handleLogout();
          }
        }
      }
    };
    loadUser();
  }, [authenticated, handleLogout]);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const { data } = await api.get(ENDPOINTS.ITEMS);
        setItems(data);
        setFilteredItems(data);
      } catch (e) {
        console.error('Failed to load items:', e);
      }
    };
    loadItems();
    cart.loadCart();
  }, []);

  const handleAddToCart = async (item) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    await cart.addToCart(item);
  };

  const handleSearch = (term) => {
    setFilteredItems(
      term ? items.filter(item => item.title.toLowerCase().includes(term.toLowerCase())) : items
    );
  };

  const headerProps = {
    orders: cart.orders,
    authenticated,
    userAvatar,
    onDelete: cart.removeFromCart,
    onPlus: cart.plusItem,
    onMinus: cart.minusItem,
    onCheckout: cart.checkout,
    checkoutLoading: cart.loading,
    onSearch: handleSearch,
  };

  return (
    <BrowserRouter>
      <div className="wrapper">
        <Routes>
          <Route path="/" element={
            <>
              <Header {...headerProps} />
              <HomePage items={filteredItems} onAdd={handleAddToCart} />
              <Footer />
            </>
          } />
          <Route path="/item/:id" element={
            <>
              <Header {...headerProps} />
              <ItemDetailPage items={items} onAdd={handleAddToCart} />
              <Footer />
            </>
          } />
          <Route path="/login" element={<><Header {...headerProps} /><LoginPage /></>} />
          <Route path="/register" element={<><Header {...headerProps} /><RegisterPage /></>} />
          <Route path="/cabinet" element={<><Header {...headerProps} /><CabinetPage /></>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
