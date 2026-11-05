import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Global navigation header for Mario Analytics.
 */
export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav
      style={{
        backgroundColor: '#16213e',
        borderBottom: '2px solid #0f3460',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: '#ffffff',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Link
          to="/"
          style={{
            color: '#e74c3c',
            fontWeight: 'bold',
            fontSize: '1.4rem',
            textDecoration: 'none',
            letterSpacing: '1px',
          }}
        >
          🍄 MARIO ANALYTICS
        </Link>
        <Link to="/play" style={linkStyle}>
          Play
        </Link>
        <Link to="/leaderboard" style={linkStyle}>
          Leaderboard
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {isAuthenticated ? (
          <>
            <span style={{ color: '#2ecc71', fontSize: '0.95rem' }}>
              👤 {user?.username}
            </span>
            <button onClick={handleLogout} style={logoutBtnStyle}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle}>
              Login
            </Link>
            <Link to="/register" style={registerBtnStyle}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

const linkStyle = {
  color: '#ecf0f1',
  textDecoration: 'none',
  fontWeight: '500',
  fontSize: '1rem',
};

const logoutBtnStyle = {
  backgroundColor: '#c0392b',
  color: '#ffffff',
  border: 'none',
  padding: '6px 14px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const registerBtnStyle = {
  backgroundColor: '#e67e22',
  color: '#ffffff',
  padding: '6px 14px',
  borderRadius: '4px',
  textDecoration: 'none',
  fontWeight: 'bold',
};

