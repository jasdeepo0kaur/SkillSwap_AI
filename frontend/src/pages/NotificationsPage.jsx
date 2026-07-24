import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Check, 
  X, 
  Calendar, 
  CheckCircle, 
  MessageSquare,
  Clock, 
  User, 
  Info,
  RefreshCw
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import CustomDateTimePicker from '../components/CustomDateTimePicker';

const NotificationsPage = ({ user }) => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduleDateMap, setScheduleDateMap] = useState({});
  const [submittingMap, setSubmittingMap] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_URL}/sessions/my-sessions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (e) {
      console.error('Error fetching sessions:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (sessionId, action, body = {}) => {
    setSubmittingMap(prev => ({ ...prev, [sessionId]: true }));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/sessions/${sessionId}/${action}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setSuccessMsg(`Session request updated successfully!`);
        setTimeout(() => setSuccessMsg(''), 4000);
        await fetchSessions();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message || 'Operation failed'}`);
      }
    } catch (e) {
      console.error(e);
      alert('Network error performing session action');
    } finally {
      setSubmittingMap(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  // Categorize notifications
  const actionItems = [];
  const inboxUpdates = [];

  sessions.forEach(session => {
    const isTeacher = session.teacher?._id === user?._id || session.teacher === user?._id;
    const isLearner = session.learner?._id === user?._id || session.learner === user?._id;
    const partner = isTeacher ? session.learner : session.teacher;

    if (session.status === 'pending') {
      if (isTeacher) {
        // High priority action: Accept or Decline request
        actionItems.push({
          type: 'incoming_request',
          title: 'Incoming Swap Request',
          desc: `${partner?.name || 'A user'} wants to learn "${session.skill}" from you.`,
          details: session.details || 'No additional details provided.',
          session,
          actionView: (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
              <button 
                className="btn-primary" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', width: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                onClick={() => handleAction(session._id, 'accept')}
                disabled={submittingMap[session._id]}
              >
                <Check size={14} /> Accept Proposal
              </button>
              <button 
                className="btn-secondary" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', width: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem', borderColor: 'var(--danger-color)', color: 'var(--danger-color)' }}
                onClick={() => handleAction(session._id, 'cancel')}
                disabled={submittingMap[session._id]}
              >
                <X size={14} /> Decline
              </button>
            </div>
          )
        });
      } else {
        // Learner inbox: Waiting for response
        inboxUpdates.push({
          type: 'waiting_response',
          title: 'Request Sent',
          desc: `Sent a proposal to learn "${session.skill}" from ${partner?.name || 'Tutor'}.`,
          status: 'pending',
          session
        });
      }
    } else if (session.status === 'accepted') {
      if (isTeacher) {
        // High priority action: Schedule date
        const dateVal = scheduleDateMap[session._id] || '';
        actionItems.push({
          type: 'needs_scheduling',
          title: 'Schedule Session Date',
          desc: `You accepted ${partner?.name || 'Learner'}'s proposal for "${session.skill}". Pick a date and time.`,
          session,
          actionView: (
            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <CustomDateTimePicker 
                  value={dateVal}
                  onChange={(e) => setScheduleDateMap(prev => ({ ...prev, [session._id]: e.target.value }))}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)',
                    padding: '0.4rem 0.5rem',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem'
                  }}
                />
                <button 
                  className="btn-primary" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', width: 'auto' }}
                  onClick={() => {
                    if (!dateVal) return alert('Please pick a date first');
                    handleAction(session._id, 'schedule', { scheduledDate: dateVal });
                  }}
                  disabled={submittingMap[session._id]}
                >
                  Schedule
                </button>
              </div>
            </div>
          )
        });
      } else {
        // Learner inbox: Accepted, waiting for teacher to schedule date
        inboxUpdates.push({
          type: 'accepted_waiting_schedule',
          title: 'Proposal Accepted',
          desc: `${partner?.name || 'Tutor'} accepted your request for "${session.skill}". Waiting for them to set a date.`,
          status: 'accepted',
          session
        });
      }
    } else if (session.status === 'scheduled') {
      const alreadyConfirmed = isTeacher ? session.teacherConfirmed : session.learnerConfirmed;
      if (!alreadyConfirmed) {
        // Action Required: Confirm Completion
        actionItems.push({
          type: 'confirm_completion',
          title: 'Confirm Swap Completion',
          desc: `Have you completed your "${session.skill}" session with ${partner?.name || 'Partner'} scheduled for ${new Date(session.scheduledDate).toLocaleString()}?`,
          session,
          actionView: (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
              <button 
                className="btn-primary" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', width: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'var(--success-color)', border: 'none' }}
                onClick={() => handleAction(session._id, 'complete')}
                disabled={submittingMap[session._id]}
              >
                <CheckCircle size={14} /> Yes, Completed
              </button>
              <button 
                className="btn-secondary" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', width: 'auto' }}
                onClick={() => navigate(`/swaps/${session._id}`)}
              >
                Enter Chat Room
              </button>
            </div>
          )
        });
      } else {
        // Already confirmed, waiting for partner confirmation
        inboxUpdates.push({
          type: 'waiting_partner_confirm',
          title: 'Awaiting Confirmation',
          desc: `You confirmed completion of "${session.skill}". Waiting for ${partner?.name || 'Partner'} to confirm.`,
          status: 'scheduled',
          session
        });
      }
    } else {
      // Completed or Cancelled logs
      inboxUpdates.push({
        type: session.status,
        title: session.status === 'completed' ? 'Swap Completed' : 'Swap Cancelled',
        desc: session.status === 'completed' 
          ? `Successfully finished "${session.skill}" swap with ${partner?.name || 'Partner'}.`
          : `Swap for "${session.skill}" with ${partner?.name || 'Partner'} was cancelled.`,
        status: session.status,
        session
      });
    }
  });

  return (
    <div className="content-body">
      {/* Page Title */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={24} color="var(--accent-purple)" /> Notifications & Action Center
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Review incoming requests, schedule accepted sessions, and confirm completions
          </p>
        </div>
        <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={fetchSessions}>
          <RefreshCw size={12} style={{ marginRight: '0.25rem' }} /> Refresh
        </button>
      </div>

      {successMsg && (
        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success-color)', padding: '0.75rem 1rem', borderRadius: '10px', color: '#a7f3d0', fontSize: '0.85rem', marginBottom: '1rem' }}>
          ✓ {successMsg}
        </div>
      )}

      <div className="room-split-container">
        {/* Left Column: Action Required items */}
        <div className="glass-panel room-left" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            ⚡ Action Required ({actionItems.length})
          </h4>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.25rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
                Loading action items...
              </div>
            ) : actionItems.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                <CheckCircle size={32} color="var(--success-color)" style={{ marginBottom: '0.75rem' }} />
                <h5 style={{ fontWeight: 600, color: 'var(--text-primary)' }}>You are all caught up!</h5>
                <p style={{ fontSize: '0.8rem', maxWidth: '280px', marginTop: '0.25rem' }}>
                  No pending requests or scheduling actions needed at this moment.
                </p>
              </div>
            ) : (
              actionItems.map((item, idx) => (
                <div 
                  key={item.session._id + idx} 
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>{item.title}</h5>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(item.session.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{item.desc}</p>
                  
                  {item.details && (
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', margin: '0.5rem 0', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                      "{item.details}"
                    </div>
                  )}

                  {item.actionView}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: History/Updates Feed */}
        <div className="glass-panel room-right" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>
            📋 Activity Updates Logs
          </h4>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.25rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
                Loading activity updates...
              </div>
            ) : inboxUpdates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No recent activity records.
              </div>
            ) : (
              inboxUpdates.map((item, idx) => {
                const badgeStatus = item.status || 'cancelled';
                return (
                  <div key={item.session._id + idx} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid rgba(255, 255, 255, 0.03)',
                    borderRadius: '10px'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxWidth: '75%' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>{item.title}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{item.desc}</span>
                      {item.session.scheduledDate && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.2rem' }}>
                          <Calendar size={12} /> {new Date(item.session.scheduledDate).toLocaleString()}
                        </span>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.65rem',
                        borderRadius: '4px',
                        backgroundColor: badgeStatus === 'completed' ? 'rgba(16,185,129,0.1)' : badgeStatus === 'pending' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                        color: badgeStatus === 'completed' ? 'var(--success-color)' : badgeStatus === 'pending' ? 'var(--warning-color)' : 'var(--danger-color)',
                        textTransform: 'uppercase',
                        fontWeight: 'bold'
                      }}>
                        {badgeStatus}
                      </span>
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem' }}
                        onClick={() => navigate(`/swaps/${item.session._id}`)}
                      >
                        Enter Room
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
