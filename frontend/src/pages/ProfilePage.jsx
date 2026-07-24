import React, { useState, useEffect } from 'react';
import { Sparkles, Award, Coins, Calendar, Check, AlertCircle } from 'lucide-react';
import StarRating from '../components/StarRating';

const ProfilePage = ({ user, setUser }) => {
  const [formData, setFormData] = useState({
    bio: '',
    skillsTeach: '',
    skillsLearn: '',
    experience: 'Beginner',
    availability: 'Flexible'
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (user) {
      setFormData({
        bio: user.bio || '',
        skillsTeach: user.skillsTeach ? user.skillsTeach.join(', ') : '',
        skillsLearn: user.skillsLearn ? user.skillsLearn.join(', ') : '',
        experience: user.experience || 'Beginner',
        availability: user.availability || 'Flexible'
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAiBio = async () => {
    setAiLoading(true);
    setMessage({ text: '', type: '' });

    const teachArray = formData.skillsTeach.split(',').map(s => s.trim()).filter(Boolean);
    const learnArray = formData.skillsLearn.split(',').map(s => s.trim()).filter(Boolean);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/ai/bio-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          skillsTeach: teachArray,
          skillsLearn: learnArray,
          experience: formData.experience
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          bio: data.bio
        }));
        setMessage({ text: 'AI Bio generated successfully!', type: 'success' });
      } else {
        throw new Error('AI bio generation failed');
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: 'AI Bio Generation failed. Falling back to default format...', type: 'warning' });
      setFormData(prev => ({
        ...prev,
        bio: `Passionate ${formData.experience}-level practitioner. Eager to teach ${teachArray.join(', ') || 'various topics'} and looking to learn and collaborate on ${learnArray.join(', ') || 'new things'}. Let's swap skills and grow together!`
      }));
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    const teachArray = formData.skillsTeach.split(',').map(s => s.trim()).filter(Boolean);
    const learnArray = formData.skillsLearn.split(',').map(s => s.trim()).filter(Boolean);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bio: formData.bio,
          skillsTeach: teachArray,
          skillsLearn: learnArray,
          experience: formData.experience,
          availability: formData.availability
        })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        if (data.rewardedInfo) {
          setMessage({ text: `${data.rewardedInfo} Profile updated successfully.`, type: 'success' });
        } else {
          setMessage({ text: 'Profile updated successfully!', type: 'success' });
        }
      } else {
        throw new Error(data.message || 'Failed to update profile.');
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: error.message || 'Error updating profile.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-body" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Profile & Skills</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Customize your trading card: tell users what you teach, learn, and availability details.</p>
        </div>
      </div>

      {user && (
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="user-avatar" style={{ width: '4.5rem', height: '4.5rem', fontSize: '2rem' }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <h3 style={{ fontSize: '1.4rem' }}>{user.name}</h3>
            <div className="flex-align-center gap-1" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span className="flex-align-center gap-05"><StarRating rating={Math.round(user.trustScore)} size={14} /> ({user.reviewCount} reviews)</span>
              <span style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }} className="flex-align-center gap-05">
                <Coins size={14} color="var(--currency-amber)" fill="var(--currency-amber)" /> {user.skillCoins} Tokens
              </span>
            </div>
            {user.skillsLearned && user.skillsLearned.length > 0 && (
              <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-teal)', marginRight: '0.2rem' }}>Acquired Skill(s):</span>
                {user.skillsLearned.map((s, idx) => (
                  <span key={idx} className="skill-tag" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', border: '1px solid var(--accent-teal)', borderRadius: '6px', color: 'var(--text-primary)', background: 'rgba(45, 212, 191, 0.05)' }}>
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {message.text && (
        <div style={{ 
          color: message.type === 'success' ? 'var(--success-color)' : message.type === 'warning' ? 'var(--warning-color)' : 'var(--danger-color)', 
          backgroundColor: 'rgba(255, 255, 255, 0.02)', 
          padding: '1rem', 
          borderRadius: '10px', 
          fontSize: '0.9rem', 
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          border: `1px solid var(--border-color)`
        }}>
          {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="form-group">
          <label htmlFor="skillsTeach">Skills You Can Teach (Comma-separated)</label>
          <input
            type="text"
            id="skillsTeach"
            name="skillsTeach"
            className="form-control"
            placeholder="e.g. React, Node.js, Public Speaking"
            value={formData.skillsTeach}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="skillsLearn">Skills You Want to Learn (Comma-separated)</label>
          <input
            type="text"
            id="skillsLearn"
            name="skillsLearn"
            className="form-control"
            placeholder="e.g. Guitar, Python, UI/UX Design"
            value={formData.skillsLearn}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label htmlFor="experience">Your Subject Experience Level</label>
            <select
              id="experience"
              name="experience"
              className="form-control"
              value={formData.experience}
              onChange={handleChange}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="availability">Weekly Availability Description</label>
            <input
              type="text"
              id="availability"
              name="availability"
              className="form-control"
              placeholder="e.g. Weekends, Weekday evenings"
              value={formData.availability}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <div className="flex-between">
            <label htmlFor="bio">Profile Bio</label>
            <button 
              type="button" 
              className="btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
              onClick={handleAiBio}
              disabled={aiLoading}
            >
              <Sparkles size={12} color="var(--accent-teal)" /> {aiLoading ? 'Generating...' : 'AI Bio Gen'}
            </button>
          </div>
          <textarea
            id="bio"
            name="bio"
            className="form-control"
            style={{ height: '100px', resize: 'vertical' }}
            placeholder="Write a short description about yourself or use the AI bio generator..."
            value={formData.bio}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Profile Details'}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
