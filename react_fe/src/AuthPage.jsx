import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8002';

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('auth-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const notifyAuthChange = () => {
  window.dispatchEvent(new Event('auth-change'));
};

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Toggle color theme"
      className="auth-theme-toggle"
    >
      {isDark ? '☀ Light' : '🌙 Dark'}
    </button>
  );
}

function LoginForm({ onCreateUserClick, theme, onToggleTheme }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('authToken') || '');

  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [token, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const body = new URLSearchParams();
    body.append('username', formData.username);
    body.append('password', formData.password);

    try {
      const response = await fetch(`/api/login`, {
      //const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      localStorage.setItem('authToken', data.access_token);
      notifyAuthChange();
      setToken(data.access_token);
      setFormData({ username: '', password: '' });
      setMessage('Login successful');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setMessage(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    notifyAuthChange();
    setToken('');
    setMessage('Logged out');
    navigate('/login', { replace: true });
  };

  return (
    <div className="auth-panel-card">
      <div className="auth-form-header">
        <div>
          <p className="auth-kicker">Welcome back</p>
          <h2>Sign in</h2>
        </div>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-field-group">
          <label htmlFor="username" className="auth-label">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            className="auth-input"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            required
          />
        </div>

        <div className="auth-field-group">
          <label htmlFor="password" className="auth-label">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            className="auth-input"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
        </div>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="auth-divider"><span>or</span></div>

      <p className="auth-link-row">
        <span>Need an account?</span>
        <button type="button" className="auth-link-button" onClick={onCreateUserClick}>
          Create new user
        </button>
      </p>

      {message && (
        <p className={`auth-message ${message.includes('successful') ? 'auth-success' : 'auth-error'}`}>
          {message}
        </p>
      )}
    </div>
  );
}

function RegisterForm({ onBackToLogin, theme, onToggleTheme }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    name: '',
    age: '',
    city: '',
    country: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const payload = {
        username: formData.username,
        hashed_password: formData.password,
        email: formData.email,
        name: formData.name,
        age: Number(formData.age),
        address: {
          city: formData.city,
          country: formData.country,
        },
      };

      const response = await fetch(`/api/users/`, {
      //const response = await fetch(`${API_BASE_URL}/api/users/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || 'User registration failed');
      }

      setFormData({
        username: '',
        password: '',
        email: '',
        name: '',
        age: '',
        city: '',
        country: '',
      });
      setMessage('User registered successfully');
    } catch (error) {
      setMessage(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-panel-card">
      <div className="auth-form-header">
        <div>
          <p className="auth-kicker">Create account</p>
          <h2>Register</h2>
        </div>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {[
          { field: 'username', label: 'Username', type: 'text' },
          { field: 'password', label: 'Password', type: 'password' },
          { field: 'email', label: 'Email', type: 'email' },
          { field: 'name', label: 'Name', type: 'text' },
          { field: 'age', label: 'Age', type: 'number', min: '1' },
          { field: 'city', label: 'City', type: 'text' },
          { field: 'country', label: 'Country', type: 'text' },
        ].map(({ field, label, type, min }) => (
          <div key={field} className="auth-field-group">
            <label htmlFor={field} className="auth-label">{label}</label>
            <input
              id={field}
              name={field}
              type={type}
              min={min}
              className="auth-input"
              value={formData[field]}
              onChange={handleChange}
              placeholder={label}
              required
            />
          </div>
        ))}

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p className="auth-link-row">
        <span>Already have an account?</span>
        <button type="button" className="auth-link-button" onClick={onBackToLogin}>
          Back to login
        </button>
      </p>

      {message && (
        <p className={`auth-message ${message.includes('success') ? 'auth-success' : 'auth-error'}`}>
          {message}
        </p>
      )}
    </div>
  );
}

function AuthPage() {
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    localStorage.setItem('auth-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className={`auth-page auth-${theme}`}>
      <div className="auth-shell">
        <div className="auth-visual-panel">
          <div className="auth-brand">
            <span className="brand-mark">O</span>
            <span className="brand-name">OpenDataLabs</span>
          </div>

          <div className="auth-visual-copy">
            <p className="auth-kicker auth-kicker-visual">Smart access</p>
            <h1>Welcome to your digital workspace.</h1>
            <p className="auth-visual-text">
              Keep your data organized in one polished platform built for momentum.
            </p>
          </div>

          <div className="auth-metrics">
            <div className="auth-metric">
              <strong>24k+</strong>
              <span>active users</span>
            </div>
            <div className="auth-metric">
              <strong>99.9%</strong>
              <span>uptime</span>
            </div>
          </div>

          <div className="auth-feature-list">
            <span>Fast onboarding</span>
            <span>Secure access</span>
            <span>Elegant dashboard</span>
          </div>
        </div>

        <div className="auth-form-panel">
          {showRegisterForm ? (
            <RegisterForm onBackToLogin={() => setShowRegisterForm(false)} theme={theme} onToggleTheme={toggleTheme} />
          ) : (
            <LoginForm onCreateUserClick={() => setShowRegisterForm(true)} theme={theme} onToggleTheme={toggleTheme} />
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
