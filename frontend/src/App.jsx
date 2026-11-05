import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Play from './pages/Play.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

/**
 * Root Application Component with global authentication context and routing.
 */
export default function App() {
  return (
    <AuthProvider>
      <div style={{ minHeight: '100vh', backgroundColor: '#1a1a2e' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/play"
            element={
              <ProtectedRoute>
                <Play />
              </ProtectedRoute>
            }
          />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}
