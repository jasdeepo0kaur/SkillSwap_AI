import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  Bell, 
  Shield, 
  Monitor, 
  LogOut, 
  Trash2, 
  AlertTriangle, 
  Check, 
  X,
  Smartphone
} from 'lucide-react';
import Modal from '../components/Modal';

const SettingsPage = ({ user, setUser }) => {
  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Settings state loaded from user
  const [formData, setFormData] = useState({
    notificationSettings: {
      emailNotifications: true,
      sessionRequests: true,
      reviews: true,
      aiCoach: true
    },
    privacySettings: {
      profileVisibility: 'Public',
      showSkillsPublicly: true,
      allowDirectMessages: true
    }
  });

  // Modal and toast states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [activeSessions, setActiveSessions] = useState([]);
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (user) {
      setFormData({
        notificationSettings: user.notificationSettings || {
          emailNotifications: true,
          sessionRequests: true,
          reviews: true,
          aiCoach: true
        },
        privacySettings: user.privacySettings || {
          profileVisibility: 'Public',
          showSkillsPublicly: true,
          allowDirectMessages: true
        }
      });
      setActiveSessions(user.activeSessions || []);
    }
  }, [user]);

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'transparent', width: '0%' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score, label: 'Weak', color: 'var(--danger-color)', width: '33%' };
    if (score <= 4) return { score, label: 'Medium', color: 'var(--warning-color)', width: '66%' };
    return { score, label: 'Strong', color: 'var(--success-color)', width: '100%' };
  };

  const strength = getPasswordStrength(newPassword);

  // API handler to save preferences
  const savePreferences = async (updatedFields) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedFields)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        triggerToast('Preferences saved successfully!', 'success');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update preferences');
      }
    } catch (error) {
      console.error(error);
      triggerToast(error.message || 'Error saving settings.', 'danger');
    }
  };

  const handleToggleNotification = (field) => {
    const newSettings = {
      ...formData.notificationSettings,
      [field]: !formData.notificationSettings[field]
    };
    setFormData(prev => ({
      ...prev,
      notificationSettings: newSettings
    }));
    savePreferences({ notificationSettings: newSettings });
  };

  const handleTogglePrivacy = (field) => {
    const newSettings = {
      ...formData.privacySettings,
      [field]: !formData.privacySettings[field]
    };
    setFormData(prev => ({
      ...prev,
      privacySettings: newSettings
    }));
    savePreferences({ privacySettings: newSettings });
  };

  const handleVisibilityChange = (e) => {
    const newSettings = {
      ...formData.privacySettings,
      profileVisibility: e.target.value
    };
    setFormData(prev => ({
      ...prev,
      privacySettings: newSettings
    }));
    savePreferences({ privacySettings: newSettings });
  };

  // Password submission handler
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return triggerToast('New passwords do not match.', 'danger');
    }
    if (newPassword.length < 6) {
      return triggerToast('New password must be at least 6 characters.', 'danger');
    }

    setPasswordLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();
      if (response.ok) {
        triggerToast('Password changed successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        throw new Error(data.message || 'Failed to update password');
      }
    } catch (error) {
      console.error(error);
      triggerToast(error.message || 'Error updating password.', 'danger');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Logout from other devices handler
  const handleLogoutOtherDevices = async () => {
    setSessionsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/logout-other-devices`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const remainingSessions = await response.json();
        setActiveSessions(remainingSessions);
        triggerToast('Successfully logged out from all other devices.', 'success');
      } else {
        throw new Error('Failed to logout other devices');
      }
    } catch (error) {
      console.error(error);
      triggerToast('Error logging out from other devices.', 'danger');
    } finally {
      setSessionsLoading(false);
    }
  };

  // Delete account handler
  const handleDeleteAccount = async () => {
    if (confirmName !== user?.name) {
      return triggerToast('Verification input does not match your username.', 'danger');
    }

    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        triggerToast('Account deleted successfully. Goodbye!', 'success');
        setTimeout(() => {
          localStorage.removeItem('token');
          window.location.href = '/';
        }, 1500);
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error(error);
      triggerToast(error.message || 'Error deleting account.', 'danger');
      setDeleteLoading(false);
    }
  };

  const handleLogoutLocal = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className="content-body" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 999999,
          backgroundColor: toast.type === 'success' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
          color: '#ffffff',
          padding: '0.85rem 1.5rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          backdropFilter: 'blur(10px)',
          animation: 'slideInRight 0.3s ease-out',
          fontSize: '0.9rem',
          fontWeight: 500
        }}>
          {toast.type === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .settings-card {
          margin-bottom: 2rem;
          padding: 1.75rem;
          border-radius: 18px !important;
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          box-shadow: var(--shadow-premium);
          backdrop-filter: blur(12px);
          transition: transform 0.3s ease, border-color 0.3s ease;
        }
        .settings-card:hover {
          border-color: var(--border-hover);
        }
        .settings-header-icon {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.75rem;
        }
        .settings-header-icon h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .settings-header-icon svg {
          color: var(--accent-purple);
        }
        .read-only-field {
          background-color: rgba(255, 255, 255, 0.015);
          border: 1px solid var(--border-color);
          padding: 0.65rem 0.85rem;
          border-radius: 10px;
          color: var(--text-secondary);
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .toggle-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }
        .toggle-container:last-child {
          border-bottom: none;
        }
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.1);
          transition: .3s;
          border-radius: 24px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
        }
        input:checked + .slider {
          background-color: var(--accent-purple-dark);
        }
        input:checked + .slider:before {
          transform: translateX(20px);
        }
        .password-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .password-toggle-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .password-toggle-btn:hover {
          color: var(--text-primary);
        }
        .session-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }
        .session-item:last-child {
          border-bottom: none;
        }
      `}</style>

      <div className="panel-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Security & Account Settings</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage your credentials, preferences, sessions, and visibility rules.</p>
        </div>
      </div>

      {/* 📧 Account Settings Card */}
      <div className="settings-card">
        <div className="settings-header-icon">
          <User size={20} />
          <h3>Account Information</h3>
        </div>
        
        {user && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label>Username / Name</label>
              <div className="read-only-field">
                <User size={14} />
                <span>{user.name}</span>
              </div>
            </div>
            
            <div className="form-group">
              <label>Email Address</label>
              <div className="read-only-field">
                <Mail size={14} />
                <span>{user.email}</span>
              </div>
            </div>

            <div className="form-group">
              <label>Account Created Date</label>
              <div className="read-only-field">
                <Calendar size={14} />
                <span>{formatDate(user.createdAt)}</span>
              </div>
            </div>

            <div className="form-group">
              <label>Last Login</label>
              <div className="read-only-field">
                <Clock size={14} />
                <span>{formatDate(user.lastLogin)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🔒 Security & Password Card */}
      <div className="settings-card">
        <div className="settings-header-icon">
          <Lock size={20} />
          <h3>Security & Password</h3>
        </div>

        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <div className="password-input-wrapper">
              <input
                type={showCurrentPassword ? "text" : "password"}
                id="currentPassword"
                className="form-control"
                style={{ width: '100%', paddingRight: '2.5rem' }}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  className="form-control"
                  style={{ width: '100%', paddingRight: '2.5rem' }}
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              {/* Strength Meter */}
              {newPassword && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Password Strength:</span>
                    <span style={{ color: strength.color, fontWeight: 'bold' }}>{strength.label}</span>
                  </div>
                  <div style={{ height: '5px', width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: strength.width, backgroundColor: strength.color, transition: 'width 0.3s ease' }} />
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  className="form-control"
                  style={{ width: '100%', paddingRight: '2.5rem' }}
                  placeholder="Verify new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: 'auto', alignSelf: 'flex-start', padding: '0.6rem 1.5rem' }}
            disabled={passwordLoading}
          >
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* 🔔 Notifications Preference Card */}
      <div className="settings-card">
        <div className="settings-header-icon">
          <Bell size={20} />
          <h3>Notifications Preferences</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="toggle-container">
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Email Notifications</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Receive critical messages and updates directly in your mailbox.</p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={formData.notificationSettings.emailNotifications}
                onChange={() => handleToggleNotification('emailNotifications')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="toggle-container">
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Session Request Notifications</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Get notified immediately when someone invites you to learn or teach.</p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={formData.notificationSettings.sessionRequests}
                onChange={() => handleToggleNotification('sessionRequests')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="toggle-container">
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Review Notifications</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Be alerted when a subject partner rates your exchange.</p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={formData.notificationSettings.reviews}
                onChange={() => handleToggleNotification('reviews')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="toggle-container">
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>AI Coach Notifications</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Receive alerts on newly generated skill recommendations and roadmaps.</p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={formData.notificationSettings.aiCoach}
                onChange={() => handleToggleNotification('aiCoach')}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* 🛡️ Privacy Settings Card */}
      <div className="settings-card">
        <div className="settings-header-icon">
          <Shield size={20} />
          <h3>Privacy Options</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="toggle-container" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '1rem' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Profile Visibility</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Decide if your trading card can be discovered in searches.</p>
            </div>
            <select
              className="form-control"
              style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', width: '130px' }}
              value={formData.privacySettings.profileVisibility}
              onChange={handleVisibilityChange}
            >
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>
          </div>

          <div className="toggle-container">
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Show Skills Publicly</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Allow non-logged in guests to see your listed expertise tags.</p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={formData.privacySettings.showSkillsPublicly}
                onChange={() => handleTogglePrivacy('showSkillsPublicly')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="toggle-container">
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Allow Direct Messages</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Accept messaging proposals from users who are not yet subject partners.</p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={formData.privacySettings.allowDirectMessages}
                onChange={() => handleTogglePrivacy('allowDirectMessages')}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* 📱 Active Sessions Card */}
      <div className="settings-card">
        <div className="settings-header-icon" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Monitor size={20} />
            <h3>Active Logged-in Sessions</h3>
          </div>
          {activeSessions.length > 1 && (
            <button
              onClick={handleLogoutOtherDevices}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', width: 'auto' }}
              disabled={sessionsLoading}
            >
              {sessionsLoading ? 'Logging out others...' : 'Logout other devices'}
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {activeSessions.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>No logged-in session history available.</p>
          ) : (
            activeSessions.map((session) => (
              <div key={session._id} className="session-item">
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.03)', 
                    padding: '0.5rem', 
                    borderRadius: '8px', 
                    color: 'var(--accent-purple)' 
                  }}>
                    {session.device.includes('iPhone') || session.device.includes('iOS') || session.device.includes('Android') ? (
                      <Smartphone size={20} />
                    ) : (
                      <Monitor size={20} />
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{session.device}</span>
                      {session.current && (
                        <span style={{ 
                          fontSize: '0.65rem', 
                          fontWeight: 700, 
                          color: 'var(--accent-teal)', 
                          backgroundColor: 'rgba(45, 212, 191, 0.1)', 
                          border: '1px solid rgba(45, 212, 191, 0.2)', 
                          padding: '0.1rem 0.4rem', 
                          borderRadius: '4px' 
                        }}>
                          Current Session
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      IP: {session.ip} • Last Active: {formatDate(session.lastActive)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 🚪 Danger Zone Card */}
      <div className="settings-card" style={{ border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.015)' }}>
        <div className="settings-header-icon" style={{ borderBottom: '1px solid rgba(239, 68, 68, 0.1)' }}>
          <LogOut size={20} style={{ color: 'var(--danger-color)' }} />
          <h3 style={{ color: 'var(--danger-color)' }}>Danger Zone</h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Standard Session Sign-Out</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Log out from this active device. You will need to type credentials again.</p>
          </div>
          <button 
            onClick={handleLogoutLocal}
            className="btn-secondary" 
            style={{ width: 'auto', padding: '0.5rem 1.25rem', border: '1px solid var(--border-color)' }}
          >
            Log Out
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0 0.5rem 0', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--danger-color)' }}>Permanently Delete Account</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>This deletes your profile, virtual coins, and all matches. This cannot be undone.</p>
          </div>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="btn-primary" 
            style={{ 
              width: 'auto', 
              padding: '0.5rem 1.25rem', 
              backgroundColor: 'var(--danger-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
            }}
          >
            <AlertTriangle size={14} />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <Modal 
          isOpen={true} 
          onClose={() => {
            setShowDeleteModal(false);
            setConfirmName('');
          }} 
          title="Permanently Delete Account"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ 
              display: 'flex', 
              gap: '0.75rem', 
              backgroundColor: 'rgba(239, 68, 68, 0.05)', 
              border: '1px solid rgba(239, 68, 68, 0.2)', 
              padding: '1rem', 
              borderRadius: '12px', 
              color: 'var(--danger-color)',
              fontSize: '0.85rem' 
            }}>
              <AlertTriangle size={24} style={{ flexShrink: 0 }} />
              <div>
                <strong>Warning: This action is permanent!</strong>
                <p style={{ marginTop: '0.25rem', color: 'var(--text-secondary)' }}>Deleting your account will erase your trust score, virtual SkillCoins, active skills, direct message histories, and scheduling calendar. There is no recovery option.</p>
              </div>
            </div>

            <div className="form-group">
              <label>To confirm, please enter your full profile name: <strong style={{ color: 'var(--text-primary)' }}>{user?.name}</strong></label>
              <input
                type="text"
                className="form-control"
                placeholder="Type your name to confirm"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
              />
            </div>

            <div className="modal-footer" style={{ borderTop: 'none', paddingTop: 0, marginTop: '0.5rem' }}>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmName('');
                }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                style={{ 
                  width: 'auto', 
                  padding: '0.6rem 1.5rem', 
                  backgroundColor: 'var(--danger-color)',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                }}
                disabled={confirmName !== user?.name || deleteLoading}
                onClick={handleDeleteAccount}
              >
                {deleteLoading ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default SettingsPage;
