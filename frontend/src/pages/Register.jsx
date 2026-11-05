import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * User registration page.
 */
export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(username, email, password);
      navigate('/play');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ textAlign: 'center', color: '#e67e22', marginBottom: '24px' }}>
          Create Player Account
        </h2>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
              placeholder="e.g. luigi_jumper"
            />
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="player@example.com"
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="At least 6 characters"
            />
          </div>

          <button type="submit" disabled={submitting} style={buttonStyle}>
            {submitting ? 'Registering...' : 'Register & Play'}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', color: '#bdc3c7', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#3498db', fontWeight: 'bold' }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: 'calc(100vh - 65px)',
  backgroundColor: '#1a1a2e',
};

const cardStyle = {
  backgroundColor: '#16213e',
  padding: '36px',
  borderRadius: '8px',
  border: '1px solid #0f3460',
  width: '100%',
  maxWidth: '400px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
};

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '0.9rem',
  color: '#ecf0f1',
  fontWeight: '500',
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '4px',
  border: '1px solid #0f3460',
  backgroundColor: '#1a1a2e',
  color: '#ffffff',
  boxSizing: 'border-box',
  fontSize: '1rem',
};

const buttonStyle = {
  backgroundColor: '#e67e22',
  color: '#ffffff',
  padding: '12px',
  borderRadius: '4px',
  border: 'none',
  fontSize: '1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '8px',
};

const errorStyle = {
  backgroundColor: '#c0392b',
  color: '#ffffff',
  padding: '10px 14px',
  borderRadius: '4px',
  marginBottom: '16px',
  fontSize: '0.9rem',
};

