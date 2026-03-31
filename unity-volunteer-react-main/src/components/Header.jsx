import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

function Header() {
  const location              = useLocation();
  const navigate              = useNavigate();
  const { currentUser, logout } = useAuth();

  const links = [
    { to: '/projects',        label: 'Доступні ініціативи' },
    { to: '/my-projects',     label: 'Мої ініціативи' },
    { to: '/',                label: 'Про нас' },
    { to: '/form-initiative', label: 'Створити ініціативу' },
    { to: '/favorites',       label: 'Улюблені ініціативи' },
  ];

  async function handleLogout() {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Помилка виходу:', err);
    }
  }

  return (
    <header>
      <img src="images/logo1.png" alt="Логотип організації Єдність" width="100" />
      <h1>Волонтерська організація Єдність</h1>

      <nav>
        <ul>
          {links.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={location.pathname === link.to ? 'active' : ''}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="header-auth">
        {currentUser ? (
          <div className="header-user">
            <span className="header-username">
              👤 {currentUser.displayName || currentUser.email}
            </span>
            <button className="header-btn header-btn--outline" onClick={handleLogout}>
              Вийти
            </button>
          </div>
        ) : (
          <div className="header-auth-btns">
            <Link
              to="/login"
              className={`header-btn header-btn--outline${location.pathname === '/login' ? ' active' : ''}`}
            >
              Увійти
            </Link>
            <Link
              to="/register"
              className={`header-btn header-btn--filled${location.pathname === '/register' ? ' active' : ''}`}
            >
              Реєстрація
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;