import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchLeaderboard, fetchLevels } from '../api/client.js';

/**
 * Leaderboard page displaying top runs from v_leaderboard.
 */
export default function Leaderboard() {
  const [entries, setEntries] = useState([]);
  const [levels, setLevels] = useState([]);
  const [selectedLevelId, setSelectedLevelId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLeaderboard = async (levelId = null) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchLeaderboard(levelId || null);
      setEntries(data);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      setError('Failed to load leaderboard entries. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const lvlList = await fetchLevels();
        setLevels(lvlList);
      } catch (err) {
        console.warn('Could not fetch level list:', err);
      }
      await loadLeaderboard();
    }
    init();
  }, []);

  const handleLevelChange = (e) => {
    const val = e.target.value;
    setSelectedLevelId(val);
    loadLeaderboard(val ? parseInt(val, 10) : null);
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 65px)',
        backgroundColor: '#1a1a2e',
        color: '#ffffff',
        padding: '32px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: '880px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <h1 style={{ margin: 0, color: '#f1c40f', fontSize: '2rem' }}>
              🏆 Global Leaderboard
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#bdc3c7', fontSize: '0.9rem' }}>
              Top 10 completed speed & score runs
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {levels.length > 0 && (
              <select
                value={selectedLevelId}
                onChange={handleLevelChange}
                style={{
                  backgroundColor: '#16213e',
                  color: '#ffffff',
                  border: '1px solid #0f3460',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                }}
              >
                <option value="">All Levels</option>
                {levels.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.name} ({lvl.difficulty})
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => loadLeaderboard(selectedLevelId ? parseInt(selectedLevelId, 10) : null)}
              style={{
                backgroundColor: '#0f3460',
                color: '#ffffff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.9rem',
              }}
            >
              🔄 Refresh
            </button>

            <Link
              to="/play"
              style={{
                backgroundColor: '#27ae60',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '4px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '0.9rem',
              }}
            >
              🎮 Play Now
            </Link>
          </div>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#c0392b',
              padding: '12px 16px',
              borderRadius: '6px',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#bdc3c7' }}>
            Loading top scores...
          </div>
        ) : entries.length === 0 ? (
          <div
            style={{
              backgroundColor: '#16213e',
              padding: '48px',
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid #0f3460',
            }}
          >
            <p style={{ fontSize: '1.2rem', color: '#bdc3c7', margin: 0 }}>
              No completed runs recorded yet!
            </p>
            <p style={{ color: '#7f8c8d', marginTop: '8px' }}>
              Be the first to clear the level and claim the #1 spot.
            </p>
            <Link
              to="/play"
              style={{
                display: 'inline-block',
                marginTop: '16px',
                backgroundColor: '#e74c3c',
                color: '#ffffff',
                padding: '10px 20px',
                borderRadius: '4px',
                textDecoration: 'none',
                fontWeight: 'bold',
              }}
            >
              Start Run
            </Link>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: '#16213e',
              borderRadius: '8px',
              border: '1px solid #0f3460',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f3460', color: '#f1c40f', fontSize: '0.85rem' }}>
                  <th style={thStyle}>RANK</th>
                  <th style={thStyle}>PLAYER</th>
                  <th style={thStyle}>SCORE</th>
                  <th style={thStyle}>COINS</th>
                  <th style={thStyle}>STOMPS</th>
                  <th style={thStyle}>TIME</th>
                  <th style={thStyle}>DATE</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => {
                  const rankIcon =
                    idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
                  const formattedDate = new Date(entry.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <tr
                      key={entry.run_id}
                      style={{
                        borderBottom: '1px solid #1a1a2e',
                        backgroundColor: idx % 2 === 0 ? '#16213e' : '#141c33',
                      }}
                    >
                      <td style={{ ...tdStyle, fontWeight: 'bold' }}>{rankIcon}</td>
                      <td style={{ ...tdStyle, color: '#3498db', fontWeight: 'bold' }}>
                        {entry.username}
                      </td>
                      <td style={{ ...tdStyle, color: '#2ecc71', fontWeight: 'bold' }}>
                        {entry.score.toLocaleString()}
                      </td>
                      <td style={tdStyle}>🪙 {entry.coins}</td>
                      <td style={tdStyle}>👾 {entry.enemies_stomped}</td>
                      <td style={tdStyle}>⏱️ {entry.duration_sec}s</td>
                      <td style={{ ...tdStyle, color: '#95a5a6', fontSize: '0.85rem' }}>
                        {formattedDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const thStyle = {
  padding: '12px 16px',
  letterSpacing: '0.5px',
};

const tdStyle = {
  padding: '12px 16px',
  fontSize: '0.95rem',
};
