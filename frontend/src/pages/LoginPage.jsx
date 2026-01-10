import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks';

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) window.location.href = '/';
  };

  return (
    <div className="auth-page">
      <div className="wrapper">
        <div className="auth-container">
          <h1>Вход</h1>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
            </div>
            <div className="form-group">
              <label>Пароль</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" required />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>{loading ? 'Загрузка...' : 'Войти'}</button>
          </form>
          <p className="auth-switch">Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p>
        </div>
      </div>
    </div>
  );
}
