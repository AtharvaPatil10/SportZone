import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Navigation = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Navbar variant={theme} expand="lg" className="shadow-sm sticky-top" style={{ backgroundColor: 'var(--nav-bg)', borderBottom: '1px solid var(--border-color)' }}>
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center logo-container">
          <div className="brand-text">
            <span className="text-sport">SPORT</span><span className="text-zone">ZONE</span>
          </div>
          <div className="brand-arrows d-flex ms-2">
            <div className="arrow arrow-orange"></div>
            <div className="arrow arrow-white"></div>
            <div className="arrow arrow-grey"></div>
          </div>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/venues">Venues</Nav.Link>
          </Nav>
          <Nav className="align-items-center">
            {user ? (
              <>
                <Button as={Link} to="/profile" variant="link" className="me-3 fw-bold text-decoration-none" style={{ color: 'var(--text-primary)' }}>
                  Hi, {user.name || user.username}
                </Button>
                <Button as={Link} to="/my-bookings" className="btn-glass me-2 text-decoration-none">My Bookings</Button>
                {user.role === 'ADMIN' && (
                  <Button as={Link} to="/admin" variant="outline-warning" className="me-2 rounded-pill">Dashboard</Button>
                )}
                {user.role === 'VENUE_OWNER' && (
                  <Button as={Link} to="/owner-dashboard" variant="outline-info" className="me-2 rounded-pill">Owner Dashboard</Button>
                )}
                <Button variant="link" className="text-danger text-decoration-none fw-bold" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Button as={Link} to="/login" className="btn-glass me-3 text-decoration-none">Login</Button>
                <Button as={Link} to="/signup" className="btn-neon text-decoration-none">Sign Up</Button>
              </>
            )}
            <div className="theme-switch-wrapper ms-3" title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}>
              <label className="theme-switch" htmlFor="checkbox">
                <input type="checkbox" id="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                <div className="slider round"></div>
              </label>
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
