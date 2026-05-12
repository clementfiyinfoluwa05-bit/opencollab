import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>OpenCollab</Link>

      <div style={styles.links}>
        {user ? (
          <>
            <Link to="/projects/new" style={styles.btn}>+ Post Project</Link>
            <Link to={`/users/${user.id}`} style={styles.link}>{user.name}</Link>
            <button onClick={handleLogout} style={styles.logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.btn}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  logo: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#4f46e5',
    textDecoration: 'none'
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  link: {
    color: '#374151',
    textDecoration: 'none',
    fontSize: '14px'
  },
  btn: {
    background: '#4f46e5',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '14px'
  },
  logout: {
    background: 'none',
    border: '1px solid #e5e7eb',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  }
};

export default Navbar;
