import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };
  const navLink = (path) => ({ ...styles.link, ...(pathname === path ? styles.linkActive : {}) });

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <Link to={isAuthenticated ? '/dashboard' : '/login'} style={styles.brand}>
          <span style={styles.brandIcon}>🎓</span>
          Cognify_BISP
        </Link>
        <div style={styles.links}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" style={navLink('/dashboard')}>Dashboard</Link>
              <Link to="/history" style={navLink('/history')}>History</Link>
              <span style={styles.divider} />
              <span style={styles.email}>{user?.email}</span>
              <button style={styles.logoutBtn} onClick={handleLogout}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link}>Login</Link>
              <Link to="/register" style={styles.registerBtn}>Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 16px rgba(109, 40, 217, 0.3)',
  },
  inner: {
    maxWidth: '920px',
    margin: '0 auto',
    padding: '0 1.25rem',
    height: '62px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: 800,
    fontSize: '1.2rem',
    color: '#ffffff',
    textDecoration: 'none',
    letterSpacing: '-0.02em',
    flexShrink: 0,
  },
  brandIcon: { fontSize: '1.3rem', lineHeight: 1 },
  links: { display: 'flex', alignItems: 'center', gap: '0.25rem' },
  link: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: 500,
    fontSize: '0.9rem',
    textDecoration: 'none',
    padding: '0.4rem 0.75rem',
    borderRadius: '6px',
    transition: 'background 0.15s, color 0.15s',
  },
  linkActive: { color: '#ffffff', background: 'rgba(255, 255, 255, 0.15)' },
  divider: { width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)', margin: '0 0.5rem' },
  email: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: '0.82rem',
    maxWidth: '160px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  logoutBtn: {
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.25)',
    color: 'rgba(255,255,255,0.9)',
    padding: '0.35rem 0.9rem',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.15s',
    marginLeft: '0.5rem',
  },
  registerBtn: {
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.3)',
    color: '#ffffff',
    padding: '0.4rem 0.9rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'background 0.15s',
    marginLeft: '0.25rem',
  },
};
