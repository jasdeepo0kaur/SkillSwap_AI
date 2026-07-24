import React, { useState, useEffect } from 'react';
import { Search, Sun, Moon, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = ({ user, notificationCount }) => {
  const navigate = useNavigate();
  const [isLightMode, setIsLightMode] = useState(
    document.body.classList.contains('light-theme')
  );

  const toggleTheme = () => {
    const body = document.body;
    if (body.classList.contains('light-theme')) {
      body.classList.remove('light-theme');
      setIsLightMode(false);
      localStorage.setItem('theme', 'dark');
    } else {
      body.classList.add('light-theme');
      setIsLightMode(true);
      localStorage.setItem('theme', 'light');
    }
  };

  // Restore saved theme on load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
      setIsLightMode(true);
    } else {
      document.body.classList.remove('light-theme');
      setIsLightMode(false);
    }
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const searchVal = e.target.search.value;
    if (searchVal.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchVal)}`);
    }
  };

  return (
    <div className="header">
      <form onSubmit={handleSearchSubmit} className="header-search">
        <Search size={16} className="text-muted" />
        <input 
          type="text" 
          name="search" 
          placeholder="Search for skills, people..." 
        />
      </form>

      <div className="header-actions">
        <button className="action-btn" onClick={toggleTheme} title="Toggle Light/Dark Theme">
          {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <button className="action-btn" onClick={() => navigate('/notifications')} title="View Notifications">
          <Bell size={18} />
          {notificationCount > 0 && <span className="badge">{notificationCount}</span>}
        </button>

        {user && (
          <div className="user-profile-badge" style={{ cursor: 'pointer' }} onClick={() => navigate('/skills')}>
            <div className="user-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-level">Level {1 + Math.floor((user.reviewCount || 0) / 5)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
