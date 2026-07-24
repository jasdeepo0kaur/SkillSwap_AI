import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Sparkles, Filter, Award, User, RefreshCw, Calendar } from 'lucide-react';
import StarRating from '../components/StarRating';
import Modal from '../components/Modal';

const Marketplace = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [expFilter, setExpFilter] = useState('');
  
  // Request Modal State
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [requestDetails, setRequestDetails] = useState('');
  const [requestSkill, setRequestSkill] = useState('');
  const [aiDraftLoading, setAiDraftLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchMarketplaceData();
  }, [searchQuery, expFilter]);

  const fetchMarketplaceData = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/users/search`;
      const queryParams = [];
      if (searchQuery) queryParams.push(`query=${encodeURIComponent(searchQuery)}`);
      if (expFilter) queryParams.push(`experience=${encodeURIComponent(expFilter)}`);

      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        // Filter out ourselves if we are logged in, but wait, the endpoint doesn't know our ID unless we send token.
        // We'll filter out local user if token is present and matches.
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const profileRes = await fetch(`${API_URL}/users/profile`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (profileRes.ok) {
              const myProfile = await profileRes.ok ? await profileRes.json() : null;
              if (myProfile) {
                setTutors(data.filter(t => t._id !== myProfile._id));
                setLoading(false);
                return;
              }
            }
          } catch (e) {}
        }
        setTutors(data);
      }
    } catch (error) {
      console.error('Error fetching marketplace:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRequest = (tutor) => {
    setSelectedTutor(tutor);
    setRequestSkill(tutor.skillsTeach?.[0] || '');
    setRequestDetails('');
    setMessage({ text: '', type: '' });
  };

  const handleAiDraft = async () => {
    if (!requestSkill) {
      setMessage({ text: 'Please select a skill first.', type: 'danger' });
      return;
    }
    setAiDraftLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/ai/request-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          skill: requestSkill,
          teacherName: selectedTutor.name,
          currentGoals: requestDetails || 'Learn the basics'
        })
      });
      if (response.ok) {
        const data = await response.json();
        setRequestDetails(data.message);
      } else {
        throw new Error('AI drafting failed.');
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: 'AI failed to draft. Writing fallback message...', type: 'warning' });
      setRequestDetails(`Hi ${selectedTutor.name},\n\nI'd love to swap skills! I want to learn ${requestSkill} from you. In exchange, I can teach you skills listed on my profile. Let's connect!`);
    } finally {
      setAiDraftLoading(false);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({ text: 'Please log in to request a swap.', type: 'danger' });
        setSubmitLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/sessions/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          teacherId: selectedTutor._id,
          skill: requestSkill,
          details: requestDetails
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ text: 'SkillSwap request sent successfully! You can track this in Skill Swaps.', type: 'success' });
        setTimeout(() => {
          setSelectedTutor(null);
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to send request.');
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: error.message || 'Error sending request.', type: 'danger' });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="content-body">
      <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Skill Marketplace</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Search for mentors, filter by subject expertise, and propose swaps.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="filters-panel">
        <div className="header-search" style={{ width: '300px', background: 'var(--bg-card)' }}>
          <Search size={16} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search for skills..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select 
          className="filter-select"
          value={expFilter}
          onChange={(e) => setExpFilter(e.target.value)}
        >
          <option value="">All Experience Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Expert">Expert</option>
        </select>
      </div>

      {/* Grid of Users/Tutors */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          Loading marketplace partners...
        </div>
      ) : tutors.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          <h3>No matching mentors found</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Try refining your search query or choosing another experience filter.</p>
        </div>
      ) : (
        <div className="market-grid">
          {tutors.map((tutor) => (
            <div key={tutor._id} className="glass-panel skill-card">
              <div className="skill-header">
                <div className="flex-align-center gap-05">
                  <div className="user-avatar" style={{ width: '2.5rem', height: '2.5rem', fontSize: '1.1rem' }}>
                    {tutor.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="skill-title" style={{ fontSize: '1rem', margin: 0 }}>{tutor.name}</h4>
                    <span className="skill-teacher" style={{ fontSize: '0.8rem' }}>{tutor.experience} Mentor</span>
                  </div>
                </div>
                <div className="trust-badge">
                  <StarRating rating={Math.round(tutor.trustScore)} size={12} />
                  <span style={{ fontSize: '0.75rem' }}>({tutor.reviewCount})</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Teaches:</span>
                <div className="skill-tags">
                  {tutor.skillsTeach?.map((s, idx) => (
                    <span key={idx} className="skill-tag">{s}</span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Wants to Learn:</span>
                <div className="skill-tags">
                  {tutor.skillsLearn?.map((s, idx) => (
                    <span key={idx} className="skill-tag" style={{ borderColor: 'var(--accent-teal-glow)' }}>{s}</span>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={14} /> Available: {tutor.availability || 'Flexible'}
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineClamp: 2, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.4rem' }}>
                {tutor.bio || 'No bio provided.'}
              </p>

              <div className="skill-footer">
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-purple)' }}>Swap Cost: 20 tokens</span>
                <button className="btn-request" onClick={() => handleOpenRequest(tutor)}>Propose Swap</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Swap Request Modal */}
      {selectedTutor && (
        <Modal 
          isOpen={true} 
          onClose={() => setSelectedTutor(null)} 
          title={`Propose SkillSwap to ${selectedTutor.name}`}
        >
          {message.text && (
            <div style={{ 
              color: message.type === 'success' ? 'var(--success-color)' : message.type === 'warning' ? 'var(--warning-color)' : 'var(--danger-color)', 
              backgroundColor: 'rgba(255, 255, 255, 0.02)', 
              padding: '0.75rem', 
              borderRadius: '8px', 
              fontSize: '0.85rem', 
              marginBottom: '1rem',
              border: `1px solid var(--border-color)`
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmitRequest}>
            <div className="form-group">
              <label htmlFor="requestSkill">Select Subject to Learn</label>
              <select
                id="requestSkill"
                className="form-control"
                value={requestSkill}
                onChange={(e) => setRequestSkill(e.target.value)}
                required
              >
                {selectedTutor.skillsTeach?.map((s, idx) => (
                  <option key={idx} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <div className="flex-between">
                <label htmlFor="requestDetails">Your Learning Goals / Details</label>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                  onClick={handleAiDraft}
                  disabled={aiDraftLoading}
                >
                  <Sparkles size={12} color="var(--accent-teal)" /> {aiDraftLoading ? 'Drafting...' : 'AI Draft'}
                </button>
              </div>
              <textarea
                id="requestDetails"
                className="form-control"
                style={{ height: '140px', resize: 'vertical' }}
                placeholder="What are you hoping to learn? (e.g. state management, API requests)"
                value={requestDetails}
                onChange={(e) => setRequestDetails(e.target.value)}
                required
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setSelectedTutor(null)}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0.6rem 1.5rem' }} disabled={submitLoading}>
                {submitLoading ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Marketplace;
