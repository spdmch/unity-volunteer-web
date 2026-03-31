import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken]             = useState(localStorage.getItem('token'));
  const [loading, setLoading]         = useState(true);

  async function register(email, password, displayName) {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName }),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Помилка реєстрації');

    localStorage.setItem('token', data.token);
    setToken(data.token);
    setCurrentUser({ uid: data.userId, email, displayName: data.displayName });
    
    return data;
  }

  async function login(email, password) {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Невірний email або пароль');

    localStorage.setItem('token', data.token);
    setToken(data.token);
    setCurrentUser({ uid: data.userId, email, displayName: data.displayName });
    return data;
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
  }

  useEffect(() => {
    async function checkAuth() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/profile', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentUser({ uid: data.user.id, email: data.user.email, displayName: data.user.displayName });
        } else {
          logout();
        }
      } catch (err) {
        console.error('Помилка перевірки профілю:', err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [token]);

  return (
    <AuthContext.Provider value={{ currentUser, token, register, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}