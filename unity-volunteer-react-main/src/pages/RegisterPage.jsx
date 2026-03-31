import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

function RegisterPage() {
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const { register } = useAuth();
  const navigate     = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirm) return setError('Паролі не збігаються.');
    if (password.length < 6) return setError('Пароль занадто короткий.');

    setLoading(true);
    try {
      await register(email, password, name);
      navigate('/projects');
    } catch (err) {
      setError(err.message || 'Помилка реєстрації');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-box">
        <h2 className="auth-title">Реєстрація</h2>
        {error && <p className="auth-error">{error}</p>}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Додано className="auth-input" до всіх інпутів */}
          <input type="text" className="auth-input" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Ім'я" required />
          <input type="email" className="auth-input" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" required />
          <input type="password" className="auth-input" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Пароль" required />
          <input type="password" className="auth-input" value={confirm} onChange={(e)=>setConfirm(e.target.value)} placeholder="Підтвердьте пароль" required />
          
          {/* Додано className="auth-button" до кнопки */}
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Завантаження...' : 'Зареєструватись'}
          </button>
        </form>
        <p className="auth-switch">Вже є акаунт? <Link to="/login">Увійти</Link></p>
      </div>
    </main>
  );
}

export default RegisterPage;