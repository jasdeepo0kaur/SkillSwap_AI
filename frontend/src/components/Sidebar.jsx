import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Award, 
  RefreshCw, 
  Heart, 
  Coins, 
  Bot, 
  Trophy, 
  Bell, 
  Mail, 
  Settings, 
  LogOut,
  Sparkles
} from 'lucide-react';

const Sidebar = ({ handleLogout, user, notificationCount }) => {
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Skills', path: '/skills', icon: Award },
    { name: 'Skill Swaps', path: '/swaps', icon: RefreshCw },
    { name: 'Wishlist', path: '/wishlist', icon: Heart },
    { name: 'Tokens', path: '/tokens', icon: Coins },
    { name: 'AI Coach', path: '/ai-coach', icon: Bot },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Notifications', path: '/notifications', icon: Bell, badgeCount: notificationCount },
    { name: 'Messages', path: '/messages', icon: Mail },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
        <div className="logo-icon">S</div>
        <div className="logo-text">Skill Swapper</div>
      </div>

      <ul className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.name}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
                {item.badgeCount && (
                  <span className="badge-counter">{item.badgeCount}</span>
                )}
              </NavLink>
            </li>
          );
        })}
        {user && (
          <li>
            <button 
              onClick={handleLogout} 
              className="sidebar-link" 
              style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
            >
              <LogOut size={18} />
              <span>Log Out</span>
            </button>
          </li>
        )}
      </ul>

      <div className="sidebar-pro">
        <h4 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
          <Sparkles size={16} color="#fbbf24" fill="#fbbf24" /> Upgrade to Pro
        </h4>
        <p>Unlock AI Mentor chat, roadmaps, and badges.</p>
        <button className="btn-pro" onClick={() => alert('Premium tier is coming soon!')}>Upgrade to Pro</button>
      </div>
    </div>
  );
};

export default Sidebar;
