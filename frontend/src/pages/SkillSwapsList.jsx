import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle2, AlertTriangle, MessageSquare, Star, Trash2 } from 'lucide-react';
import StarRating from '../components/StarRating';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import CustomDateTimePicker from '../components/CustomDateTimePicker';

const SkillSwapsList = ({ user }) => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Scheduling Modal State
  const [schedulingSession, setSchedulingSession] = useState(null);
  const [scheduledDate, setScheduledDate] = useState('');

  // Review Modal State
  const [reviewingSession, setReviewingSession] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/sessions/my-sessions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (sessionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/sessions/${sessionId}/accept`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setMessage({ text: 'Session accepted successfully!', type: 'success' });
        fetchSessions();
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Accept failed');
      }
    } catch (error) {
      setMessage({ text: error.message, type: 'danger' });
    }
  };

  const handleOpenSchedule = (session) => {
    setSchedulingSession(session);
    setScheduledDate('');
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/sessions/${schedulingSession._id}/schedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ scheduledDate })
      });
      if (response.ok) {
        setMessage({ text: 'Session scheduled successfully!', type: 'success' });
        setSchedulingSession(null);
        fetchSessions();
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Schedule failed');
      }
    } catch (error) {
      setMessage({ text: error.message, type: 'danger' });
    }
  };

  const handleCancel = async (sessionId) => {
    if (!window.confirm('Are you sure you want to cancel this swap? If the session has already been scheduled, a -10 token penalty will apply.')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/sessions/${sessionId}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ text: data.message || 'Session cancelled successfully.', type: 'warning' });
        fetchSessions();
      } else {
        throw new Error(data.message || 'Cancel failed');
      }
    } catch (error) {
      setMessage({ text: error.message, type: 'danger' });
    }
  };

  const handleComplete = async (sessionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/sessions/${sessionId}/complete`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        if (data.status === 'completed') {
          setMessage({ text: 'Session marked completed! SkillCoins exchanged successfully!', type: 'success' });
        } else {
          setMessage({ text: 'Completion confirmed. Waiting for the counterpart to confirm completion.', type: 'warning' });
        }
        fetchSessions();
      } else {
        throw new Error(data.message || 'Confirm completion failed');
      }
    } catch (error) {
      setMessage({ text: error.message, type: 'danger' });
    }
  };

  const handleOpenReview = (session) => {
    setReviewingSession(session);
    setReviewRating(5);
    setReviewComment('');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/sessions/${reviewingSession._id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ text: data.message || 'Review submitted successfully!', type: 'success' });
        setReviewingSession(null);
        fetchSessions();
      } else {
        throw new Error(data.message || 'Submit review failed');
      }
    } catch (error) {
      setMessage({ text: error.message, type: 'danger' });
    }
  };

  return (
    <div className="content-body">
      <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Skill Swap Sessions</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Accept swap offers, schedule times, confirm completions, and leave reviews.</p>
        </div>
      </div>

      {message.text && (
        <div style={{ 
          color: message.type === 'success' ? 'var(--success-color)' : message.type === 'warning' ? 'var(--warning-color)' : 'var(--danger-color)', 
          backgroundColor: 'rgba(255,255,255,0.02)', 
          padding: '1rem', 
          borderRadius: '10px', 
          fontSize: '0.9rem', 
          marginBottom: '1.5rem',
          border: `1px solid var(--border-color)`
        }}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          Loading your swaps...
        </div>
      ) : sessions.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          <h3>No Swap Sessions Found</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Go to the marketplace to request a swap, or list skills you can teach in profile to get requests!</p>
          <button 
            className="btn-primary" 
            style={{ width: 'auto', padding: '0.5rem 1.5rem', marginTop: '1rem' }}
            onClick={() => navigate('/marketplace')}
          >
            Go to Marketplace
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {sessions.map((session) => {
            const isLearner = session.learner?._id === user?._id;
            const partner = isLearner ? session.teacher : session.learner;
            
            return (
              <div key={session._id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div className="flex-align-center gap-1">
                    <div className="user-avatar" style={{ width: '3rem', height: '3rem', fontSize: '1.25rem' }}>
                      {partner?.name ? partner.name.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem' }}>{session.skill}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {isLearner ? 'Taught by' : 'Learned by'} <strong>{partner?.name || 'Deleted User'}</strong> (Trust Score: {partner?.trustScore || '5.0'})
                      </p>
                    </div>
                  </div>
                  <div className="flex-align-center gap-1">
                    <StatusBadge status={session.status} />
                    <button 
                      className="btn-secondary" 
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 1rem' }}
                      onClick={() => navigate(`/swaps/${session._id}`)}
                    >
                      <MessageSquare size={14} /> Enter Room
                    </button>
                  </div>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <strong>Goal Detail:</strong> {session.details || 'No session details provided.'}
                </div>

                <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.25rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={16} /> 
                    {session.scheduledDate ? (
                      <span>Scheduled for: <strong>{new Date(session.scheduledDate).toLocaleString()}</strong></span>
                    ) : (
                      <span>Not scheduled yet.</span>
                    )}
                  </div>

                  <div className="flex-align-center gap-1">
                    {/* 1. Pending Session - Teacher Actions */}
                    {session.status === 'pending' && !isLearner && (
                      <button className="btn-primary" style={{ width: 'auto', padding: '0.5rem 1.25rem' }} onClick={() => handleAccept(session._id)}>
                        Accept Swap Request
                      </button>
                    )}

                    {/* 2. Accepted/Scheduled Session - Teacher Actions */}
                    {(session.status === 'accepted' || (session.status === 'scheduled' && !isLearner)) && !isLearner && (
                      <button className="btn-secondary" style={{ padding: '0.5rem 1.25rem' }} onClick={() => handleOpenSchedule(session)}>
                        {session.status === 'scheduled' ? 'Reschedule Session' : 'Schedule Date/Time'}
                      </button>
                    )}

                    {/* 3. Scheduled Session - Completion Triggers */}
                    {session.status === 'scheduled' && (
                      <>
                        <button 
                          className="btn-primary" 
                          style={{ width: 'auto', padding: '0.5rem 1.25rem', backgroundColor: 'var(--success-color)' }}
                          onClick={() => handleComplete(session._id)}
                          disabled={(isLearner && session.learnerConfirmed) || (!isLearner && session.teacherConfirmed)}
                        >
                          {(isLearner && session.learnerConfirmed) || (!isLearner && session.teacherConfirmed) 
                            ? 'Completion Confirmed ✓' 
                            : 'Confirm Completion'}
                        </button>
                        <button 
                          className="action-btn" 
                          style={{ color: 'var(--danger-color)' }} 
                          onClick={() => handleCancel(session._id)}
                          title="Cancel Session"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}

                    {/* 4. Completed Session - Reviews */}
                    {session.status === 'completed' && (
                      <button className="btn-primary" style={{ width: 'auto', padding: '0.5rem 1.25rem' }} onClick={() => handleOpenReview(session)}>
                        <Star size={14} style={{ display: 'inline', marginRight: '0.4rem' }} /> Review Subject Partner
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Scheduling Modal */}
      {schedulingSession && (
        <Modal 
          isOpen={true} 
          onClose={() => setSchedulingSession(null)} 
          title="Schedule Session Date & Time"
        >
          <form onSubmit={handleScheduleSubmit}>
            <div className="form-group">
              <label htmlFor="scheduledDate">Scheduled Date & Time</label>
              <CustomDateTimePicker
                id="scheduledDate"
                className="form-control"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setSchedulingSession(null)}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0.6rem 1.5rem' }}>Save Schedule</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Review Modal */}
      {reviewingSession && (
        <Modal 
          isOpen={true} 
          onClose={() => setReviewingSession(null)} 
          title={`Submit Review for ${reviewingSession.learner?._id === user?._id ? reviewingSession.teacher?.name : reviewingSession.learner?.name}`}
        >
          <form onSubmit={handleReviewSubmit}>
            <div className="form-group" style={{ alignItems: 'center', margin: '1rem 0' }}>
              <label style={{ marginBottom: '0.5rem' }}>Session Rating</label>
              <StarRating rating={reviewRating} onRatingChange={setReviewRating} size={28} />
            </div>

            <div className="form-group">
              <label htmlFor="reviewComment">Review Comment</label>
              <textarea
                id="reviewComment"
                className="form-control"
                style={{ height: '100px', resize: 'vertical' }}
                placeholder="How was the session? Did you learn or teach effectively? Help others trust this user."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                required
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setReviewingSession(null)}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0.6rem 1.5rem' }}>Submit Review</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SkillSwapsList;
