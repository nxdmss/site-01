import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ItemPage from './pages/ItemPage'; 
import axios from 'axios';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Items from './components/Items.jsx';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      items: [],
      showAnimation: false,
      currentAnimImg: ''
    };
  }

  componentDidMount() {
    this.fetchItems();
    this.fetchOrders();
  }

  fetchItems = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/items');
      this.setState({ items: response.data });
    } catch (err) {
      console.error("Ошибка загрузки товаров:", err);
    }
  };

  fetchOrders = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/cart');
      this.setState({ orders: response.data });
    } catch (err) {
      console.error("Ошибка загрузки корзины:", err);
    }
  };

  addToOrder = async (item) => {
      this.setState({ 
        showAnimation: true, 
        currentAnimImg: "/img/di.jpg" 
      });

      setTimeout(() => {
        this.setState({ showAnimation: false });
      }, 4000);

      try {
        await axios.post(`http://127.0.0.1:8000/api/cart/${item.id}`);
        this.fetchOrders();
      } catch (err) {
        console.error("Ошибка при добавлении в корзину:", err);
      }
    };

  deleteOrder = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/cart/${id}`);
      this.fetchOrders();
    } catch (err) {
      console.error("Ошибка при удалении:", err);
    }
  };

  plusItem = async (id) => {
    try {
      await axios.post(`http://127.0.0.1:8000/api/cart/${id}`);
      this.fetchOrders();
    } catch (err) {
      console.error("Ошибка плюс:", err);
    }
  };

  minusItem = async (id) => {
    try {
      await axios.patch(`http://127.0.0.1:8000/api/cart/minus/${id}`);
      this.fetchOrders();
    } catch (err) {
      console.error("Ошибка минус:", err);
    }
  };

  render() {
    return (
      <Router>
        <div className='wrapper'>
          {this.state.showAnimation && (
            <div className="animation-overlay">
              <img 
                src={this.state.currentAnimImg} 
                className="fly-image" 
                alt="anim" 
              />
            </div>
          )}

          <Header 
            orders={this.state.orders} 
            onDelete={this.deleteOrder} 
            onPlus={this.plusItem} 
            onMinus={this.minusItem} 
          />

          <Routes>
            {/* На главной странице показываем только список товаров */}
            <Route path="/" element={
              <main>
                {this.state.items.length > 0 ? (
                  <Items items={this.state.items} onAdd={this.addToOrder} />
                ) : (
                  <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Загрузка...</h2>
                )}
              </main>
            } />

            {/* На странице товара показываем компонент ItemPage */}
            <Route path="/item/:id" element={
              <ItemPage items={this.state.items} onAdd={this.addToOrder} />
            } />
          </Routes>

          <Footer />
        </div>
      </Router>
    );
  }
}

export default App;