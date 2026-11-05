import React from 'react';

/**
 * Placeholder home page component for Mario Analytics.
 */
export default function Home() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center' }}>
      <h1>Mario Analytics</h1>
      <p>A full-stack Mario-style platformer with telemetry and ML-driven analytics.</p>
      <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f0f0f0', borderRadius: '8px', display: 'inline-block' }}>
        <strong>Status:</strong> Scaffolding complete (Step 1)
      </div>
    </div>
  );
}

