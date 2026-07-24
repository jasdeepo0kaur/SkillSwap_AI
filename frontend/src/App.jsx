import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import ProfilePage from './pages/ProfilePage';
import SkillSwapsList from './pages/SkillSwapsList';
import SessionRoom from './pages/SessionRoom';
import AICoach from './pages/AICoach';
import TokensPage from './pages/TokensPage';
import LeaderboardPage from './pages/LeaderboardPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import Intro from './components/intro/Intro';

function App() {
  const [user, setUser] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    checkLoggedInUser();
  }, []);

  useEffect(() => {
  const timer = setTimeout(() => {
    setShowIntro(false);
  }, 5000);

  return () => clearTimeout(timer);
}, []);

  useEffect(() => {
    if (user) {
      fetchNotificationCount();
      const interval = setInterval(fetchNotificationCount, 30000);
      return () => clearInterval(interval);
    } else {
      setNotificationCount(0);
    }
  }, [user]);

  const fetchNotificationCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_URL}/sessions/my-sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const list = await response.json();
        const pendingCount = list.filter(
          s => s.status === 'pending' && 
          (s.teacher?._id === user?._id || s.teacher === user?._id)
        ).length;
        setNotificationCount(pendingCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const checkLoggedInUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error verifying token on app load:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#080a10',
        color: '#f3f4f6',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '3rem', 
            height: '3rem', 
            border: '3px solid rgba(255,255,255,0.1)', 
            borderTop: '3px solid #8b5cf6', 
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p>Verifying authentication details...</p>
        </div>
      </div>
    );
  }
if (showIntro) {
  return <Intro />;
}
  return (
    <Router>
      <div className="app-container">
        {user ? (
          <>
            {/* Authenticated Layout */}
            <Sidebar handleLogout={handleLogout} user={user} notificationCount={notificationCount} />
            <div className="main-content">
              <Header user={user} notificationCount={notificationCount} />
              <Routes>
                <Route path="/dashboard" element={<Dashboard user={user} setUser={setUser} />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/skills" element={<ProfilePage user={user} setUser={setUser} />} />
                <Route path="/swaps" element={<SkillSwapsList user={user} />} />
                <Route path="/swaps/:id" element={<SessionRoom user={user} />} />
                
                {/* Fallback endpoints */}
                <Route path="/wishlist" element={<Marketplace />} />
                <Route path="/tokens" element={<TokensPage user={user} />} />
                <Route path="/ai-coach" element={<AICoach user={user} />} />
                <Route path="/leaderboard" element={<LeaderboardPage user={user} />} />
                <Route path="/notifications" element={<NotificationsPage user={user} />} />
                <Route path="/messages" element={<SkillSwapsList user={user} />} />
                <Route path="/settings" element={<SettingsPage user={user} setUser={setUser} />} />
                
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </div>
          </>
        ) : (
          /* Unauthenticated Public Layout */
          <UnauthenticatedLayout setUser={setUser} />
        )}
      </div>
    </Router>
  );
}

function UnauthenticatedLayout({ setUser }) {
  const location = useLocation();
  const showHeader = location.pathname === '/auth';

  return (
    <div style={{ flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
      {showHeader && (
        <div className="header" style={{ borderBottom: 'none' }}>
          <div className="sidebar-logo">
            <div className="logo-icon">S</div>
            <div className="logo-text">Skill Swapper</div>
          </div>
          <button className="btn-primary" style={{ width: 'auto', padding: '0.5rem 1.5rem' }} onClick={() => window.location.href = '/auth'}>
            Login
          </button>
        </div>
      )}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage setUser={setUser} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
