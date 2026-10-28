import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { HomeWithBorder, AboutWithBorder, ContactWithBorder, About, Contact } from './TestComponent.jsx';
import FruitListWithBorder from './TestingComponent.jsx';
import AuthPage from './AuthPage.jsx';
import DashboardPage from './DashboardPage.jsx';

function AppNavigation({ isLoggedIn }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/login', { replace: true });
  };

  return (
    <nav className="app-nav" aria-label="Main navigation">
      {!isLoggedIn && (
        <>
          <NavLink to="/about" className={({ isActive }) => `app-nav-link${isActive ? ' active' : ''}`}>About</NavLink>
          <NavLink to="/contact" className={({ isActive }) => `app-nav-link${isActive ? ' active' : ''}`}>Contact</NavLink>
          <NavLink to="/login" className={({ isActive }) => `app-nav-link${isActive ? ' active' : ''}`}>Login</NavLink>
        </>
      )}

      {isLoggedIn && (
        <>
          <div className="app-nav-links">
            <NavLink to="/" className={({ isActive }) => `app-nav-link${isActive ? ' active' : ''}`}>Home</NavLink>
            <NavLink to="/testing" className={({ isActive }) => `app-nav-link${isActive ? ' active' : ''}`}>Testing</NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => `app-nav-link${isActive ? ' active' : ''}`}>Dashboard</NavLink>
          </div>
          <button type="button" className="app-nav-logout" onClick={handleLogout}>Logout</button>
        </>
      )}
    </nav>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem('authToken')));

  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(Boolean(localStorage.getItem('authToken')));
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  return (
    <BrowserRouter>
      <AppNavigation isLoggedIn={isLoggedIn} />

      <Routes>
        {!isLoggedIn ? (
          <>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/about" element={<AboutWithBorder />} />
            <Route path="/contact" element={<ContactWithBorder />} />
            <Route path="*" element={<AuthPage />} />
          </>
        ) : (
          <>
            <Route path="/" element={<HomeWithBorder />} />
            <Route path="/testing" element={<FruitListWithBorder />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<HomeWithBorder />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
