import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import GameCanvas from '../components/GameCanvas.jsx';
import { submitRun } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Play page hosting the game canvas and submitting run telemetry.
 */
export default function Play() {
  const { user, isAuthenticated } = useAuth();
  const [notification, setNotification] = useState(null);

  const handleRunCompleted = async (runData) => {
    if (!isAuthenticated) {
      setNotification({
        type: 'warning',
        message: 'Guest run finished. Log in to record your scores on the global leaderboard!',
      });
      return;
    }

    let finalRun = runData;
    if (!finalRun.id && !finalRun.error) {
      try {
        finalRun = await submitRun(runData);
      } catch (err) {
        console.error('Failed to submit fallback run:', err);
      }
    }

    if (finalRun.error) {
      setNotification({
        type: 'error',
        message: 'Failed to upload run to server. Please check your connection.',
      });
    } else {
      setNotification({
        type: 'success',
        message: `Run saved! Score: ${finalRun.score} | Coins: ${finalRun.coins} | ${
          finalRun.completed ? '🏆 Course Cleared!' : '💀 Game Over'
        }`,
      });
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 65px)',
        backgroundColor: '#1a1a2e',
        color: '#ffffff',
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: '820px' }}>
        {/* Status notification banner */}
        {notification && (
          <div
            style={{
              padding: '12px 20px',
              borderRadius: '6px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor:
                notification.type === 'success'
                  ? '#27ae60'
                  : notification.type === 'warning'
                  ? '#d35400'
                  : '#c0392b',
              color: '#ffffff',
              fontWeight: '500',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            <span>{notification.message}</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link
                to="/leaderboard"
                style={{
                  color: '#f1c40f',
                  fontWeight: 'bold',
                  textDecoration: 'underline',
                }}
              >
                View Leaderboard →
              </Link>
              <button
                onClick={() => setNotification(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Phaser Game */}
        <GameCanvas onRunCompleted={handleRunCompleted} />

        {/* Controls and Player Status Info */}
        <div
          style={{
            marginTop: '20px',
            backgroundColor: '#16213e',
            borderRadius: '8px',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            border: '1px solid #0f3460',
          }}
        >
          <div>
            <strong style={{ color: '#f1c40f' }}>Controls:</strong>
            <span style={{ marginLeft: '12px', color: '#ecf0f1', fontSize: '0.9rem' }}>
              <kbd style={kbdStyle}>A</kbd> / <kbd style={kbdStyle}>D</kbd> or{' '}
              <kbd style={kbdStyle}>←</kbd> / <kbd style={kbdStyle}>→</kbd> to move |{' '}
              <kbd style={kbdStyle}>Space</kbd> / <kbd style={kbdStyle}>W</kbd> to jump (hold for higher jump)
            </span>
          </div>

          <div>
            {isAuthenticated ? (
              <span style={{ color: '#2ecc71', fontSize: '0.9rem' }}>
                Signed in as <strong>{user?.username}</strong>
              </span>
            ) : (
              <Link to="/login" style={{ color: '#3498db', fontSize: '0.9rem', fontWeight: 'bold' }}>
                Sign in to save scores →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const kbdStyle = {
  backgroundColor: '#0f3460',
  padding: '2px 6px',
  borderRadius: '4px',
  border: '1px solid #1a1a2e',
  fontSize: '0.85rem',
  fontWeight: 'bold',
};

