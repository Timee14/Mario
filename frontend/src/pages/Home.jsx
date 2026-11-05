import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Landing Home page introducing Mario Analytics.
 */
export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 65px)',
        backgroundColor: '#1a1a2e',
        color: '#ffffff',
        padding: '60px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: '650px' }}>
        <h1
          style={{
            fontSize: '3.2rem',
            margin: '0 0 16px 0',
            color: '#e74c3c',
            textShadow: '3px 3px 0px #f39c12',
            letterSpacing: '1px',
          }}
        >
          MARIO ANALYTICS
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#bdc3c7', lineHeight: '1.6', marginBottom: '32px' }}>
          A full-stack Mario-style platformer featuring real-time gameplay telemetry,
          player skill profiling, and dynamic AI-driven difficulty adaptation.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link
            to="/play"
            style={{
              backgroundColor: '#e74c3c',
              color: '#ffffff',
              padding: '14px 28px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              boxShadow: '0 4px 14px rgba(231, 76, 60, 0.4)',
            }}
          >
            🎮 {isAuthenticated ? 'Play Game' : 'Sign In & Play'}
          </Link>
          <Link
            to="/leaderboard"
            style={{
              backgroundColor: '#16213e',
              border: '2px solid #0f3460',
              color: '#f1c40f',
              padding: '14px 28px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '1.1rem',
            }}
          >
            🏆 Leaderboard
          </Link>
        </div>

        {isAuthenticated ? (
          <p style={{ marginTop: '28px', color: '#2ecc71', fontSize: '0.95rem' }}>
            Logged in as <strong>{user?.username}</strong>
          </p>
        ) : (
          <p style={{ marginTop: '28px', color: '#95a5a6', fontSize: '0.9rem' }}>
            New player? <Link to="/register" style={{ color: '#3498db' }}>Create an account</Link> to save your runs.
          </p>
        )}
      </div>
    </div>
  );
}
