import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { HomeWithBorder, AboutWithBorder, ContactWithBorder, About, Contact } from './TestComponent.jsx';
import FruitListWithBorder from './TestingComponent.jsx';
import AuthPage from './AuthPage.jsx';

const navLinkStyles = ({ isActive }) => ({
  color: isActive ? '#ff0095' : '#fae41f',
  textDecoration: isActive ? 'none' : 'underline',
  fontWeight: isActive ? 'bold' : 'normal',
  padding: '10px 10px',
});

function App() {
  return (
    <BrowserRouter>
      <nav style={{ marginBottom: '20px' }}>
        <NavLink to="/" style={navLinkStyles}>Home</NavLink> |{' '}
        <NavLink to="/about" style={navLinkStyles}>About</NavLink> |{' '}
        <NavLink to="/contact" style={navLinkStyles}>Contact</NavLink> |{' '}
        <NavLink to="/testing" style={navLinkStyles}>Testing</NavLink> |{' '}
        <NavLink to="/login" style={navLinkStyles}>Login</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<HomeWithBorder />} />
        <Route path="/about" element={<AboutWithBorder />} />
        <Route path="/contact" element={<ContactWithBorder />} />
        <Route path="/testing" element={<FruitListWithBorder />} />
        <Route path="/login" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
