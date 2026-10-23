import { useState } from 'react';

//const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8002';

function LoginForm({ onCreateUserClick }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('authToken') || '');

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
        //const response = await fetch(`${API_BASE_URL}/api/login`, {
        const response = await fetch('/api/login', {
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
      setToken(data.access_token);
      setFormData({ username: '', password: '' });
      setMessage('Login successful');
    } catch (error) {
      setMessage(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setToken('');
    setMessage('Logged out');
  };

  if (token) {
    return (
      <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Logged in</h2>
        <p>Token saved in localStorage.</p>
        <pre style={{ overflowX: 'auto', whiteSpace: 'pre-wrap' }}>{token}</pre>
        <button onClick={handleLogout} style={{ padding: '10px 16px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '6px' }}>Username</label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            required
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '6px' }}>Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            required
          />
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', cursor: 'pointer' }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p style={{ marginTop: '16px', textAlign: 'center' }}>
        <button
          type="button"
          onClick={onCreateUserClick}
          style={{ background: 'none', border: 'none', color: '#ff0095', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
        >
          Create new User
        </button>
      </p>

      {message && (
        <p style={{ marginTop: '12px', color: message.includes('successful') ? 'green' : 'crimson' }}>
          {message}
        </p>
      )}
    </div>
  );
}

function RegisterForm({ onBackToLogin }) {
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
    
      //const response = await fetch(`${API_BASE_URL}/api/users/`, {
      const response = await fetch('/api/users/', {
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
    <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Create User</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '6px' }}>Username</label>
          <input id="username" name="username" type="text" value={formData.username} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} required />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '6px' }}>Password</label>
          <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} required />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '6px' }}>Email</label>
          <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} required />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '6px' }}>Name</label>
          <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} required />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="age" style={{ display: 'block', marginBottom: '6px' }}>Age</label>
          <input id="age" name="age" type="number" min="1" value={formData.age} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} required />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="city" style={{ display: 'block', marginBottom: '6px' }}>City</label>
          <input id="city" name="city" type="text" value={formData.city} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} required />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="country" style={{ display: 'block', marginBottom: '6px' }}>Country</label>
          <input id="country" name="country" type="text" value={formData.country} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} required />
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', cursor: 'pointer' }}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p style={{ marginTop: '12px', textAlign: 'center' }}>
        <button
          type="button"
          onClick={onBackToLogin}
          style={{ background: 'none', border: 'none', color: '#ff0095', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
        >
          Back to Login
        </button>
      </p>

      {message && (
        <p style={{ marginTop: '12px', color: message.includes('success') ? 'green' : 'crimson' }}>
          {message}
        </p>
      )}
    </div>
  );
}

function AuthPage() {
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  return showRegisterForm ? (
    <RegisterForm onBackToLogin={() => setShowRegisterForm(false)} />
  ) : (
    <LoginForm onCreateUserClick={() => setShowRegisterForm(true)} />
  );
}

export default AuthPage;
