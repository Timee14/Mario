import React from 'react';
import GameCanvas from '../components/GameCanvas.jsx';

/**
 * Home page hosting the Phaser 3 Mario platformer.
 */
export default function Home() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#1a1a2e',
        color: '#ffffff',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1
          style={{
            margin: '0 0 8px 0',
            fontSize: '2.4rem',
            color: '#e74c3c',
            textShadow: '2px 2px 0px #f39c12',
            letterSpacing: '1px',
          }}
        >
          MARIO ANALYTICS
        </h1>
        <p style={{ margin: 0, color: '#bdc3c7', fontSize: '1rem' }}>
          Full-Stack Platformer with Real-Time Telemetry & AI Difficulty
        </p>
      </header>

      <main style={{ width: '100%', maxWidth: '840px' }}>
        <GameCanvas />

        <div
          style={{
            marginTop: '20px',
            backgroundColor: '#16213e',
            borderRadius: '8px',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: '16px',
            border: '1px solid #0f3460',
          }}
        >
          <div>
            <strong style={{ color: '#f1c40f' }}>Controls:</strong>
            <div style={{ fontSize: '0.9rem', color: '#ecf0f1', marginTop: '4px' }}>
              • Move: <kbd style={kbdStyle}>Left / Right</kbd> or <kbd style={kbdStyle}>A / D</kbd>
              <br />
              • Jump: <kbd style={kbdStyle}>Up / W / Space</kbd> (Hold for higher jump)
            </div>
          </div>

          <div>
            <strong style={{ color: '#2ecc71' }}>Objectives:</strong>
            <div style={{ fontSize: '0.9rem', color: '#ecf0f1', marginTop: '4px' }}>
              • Stomp enemies (+100 pts)
              <br />
              • Collect coins (+50 pts)
              <br />
              • Reach the flag pole to win!
            </div>
          </div>
        </div>
      </main>
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
