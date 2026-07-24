import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { Send, ArrowLeft, Brain, Calendar, Info } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const SessionRoom = ({ user }) => {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [roadmap, setRoadmap] = useState('');
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchSessionDetails();
    fetchPastMessages();
    fetchRoadmap();

    // Setup Socket Connection
    const token = localStorage.getItem('token');
    socketRef.current = io(SOCKET_URL);

    // Join room on connection
    socketRef.current.on('connect', () => {
      socketRef.current.emit('join_room', { 
        sessionId, 
        username: user?.name || 'Member' 
      });
    });

    // Receive message
    socketRef.current.on('receive_message', (messagePayload) => {
      setMessages((prev) => [...prev, messagePayload]);
    });

    socketRef.current.on('user_joined', (data) => {
      console.log(`${data.user} ${data.message}`);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('receive_message');
        socketRef.current.off('user_joined');
        socketRef.current.disconnect();
      }
    };
  }, [sessionId, user]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchSessionDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/sessions/my-sessions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const list = await response.json();
        const found = list.find(s => s._id === sessionId);
        if (found) {
          setSession(found);
        } else {
          navigate('/swaps');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPastMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/sessions/${sessionId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRoadmap = async () => {
    setRoadmapLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/sessions/${sessionId}/roadmap`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRoadmap(data.roadmap);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRoadmapLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !socketRef.current) return;

    const payload = {
      sessionId,
      senderId: user?._id,
      senderName: user?.name || 'Member',
      text: inputText
    };

    socketRef.current.emit('send_message', payload);
    setInputText('');
  };

  if (!session) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
        Loading session room...
      </div>
    );
  }

  const isLearner = session.learner?._id === user?._id;
  const partner = isLearner ? session.teacher : session.learner;

  return (
    <div className="content-body" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      {/* Session Navigation Header */}
      <div className="flex-between" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <div className="flex-align-center gap-1">
          <button className="action-btn" onClick={() => navigate('/swaps')} title="Go back to list">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Swap Room: {session.skill}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Chatting with <strong>{partner?.name || 'Deleted User'}</strong>
            </p>
          </div>
        </div>

        <div className="flex-align-center gap-1">
          <StatusBadge status={session.status} />
          {session.scheduledDate && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Calendar size={14} /> {new Date(session.scheduledDate).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="room-split-container">
        {/* Left Side: Socket Chat */}
        <div className="glass-panel room-left" style={{ padding: '1.25rem' }}>
          <div className="ai-chat-header" style={{ marginBottom: '1rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              💬 Room Chat Console
            </span>
          </div>

          <div className="ai-chat-messages" style={{ height: '100%', marginBottom: '1rem' }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', margin: 'auto 0' }}>
                No messages yet. Send a message to greet your partner!
              </div>
            ) : (
              messages.map((msg) => {
                // Handle populated sender vs plain sender ID string
                const senderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
                const senderName = typeof msg.sender === 'object' ? msg.sender?.name : (senderId === user?._id ? user?.name : 'Partner');
                const isSelf = senderId === user?._id;

                return (
                  <div key={msg._id || Math.random()} className={`chat-bubble ${isSelf ? 'user' : 'ai'}`}>
                    {!isSelf && (
                      <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent-teal)', marginBottom: '0.2rem' }}>
                        {senderName}
                      </span>
                    )}
                    <span style={{ wordBreak: 'break-word' }}>{msg.text}</span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-box" style={{ marginTop: 'auto' }}>
            <input
              type="text"
              placeholder="Type a message to your partner..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="submit" className="btn-send" style={{ width: '2rem', height: '2rem' }}>
              <Send size={14} />
            </button>
          </form>
        </div>

        {/* Right Side: AI Roadmap Display */}
        <div className="glass-panel room-right" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <Brain size={18} color="var(--accent-purple)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>AI Learning Roadmap</h3>
          </div>

          <div className="roadmap-viewer">
            {roadmapLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                AI is compiling your 3-phase roadmap...
              </div>
            ) : roadmap ? (
              <div style={{ whiteSpace: 'pre-line' }}>
                {/* Simplified markdown parser for display */}
                {roadmap}
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', padding: '1rem 0' }}>
                No study roadmap has been generated for this session's topic. Click "Regenerate" to reload.
                <button className="btn-secondary" style={{ marginTop: '1rem', display: 'block' }} onClick={fetchRoadmap}>
                  Generate Study Plan
                </button>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
            <Info size={14} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <span>This roadmap is generated dynamically by Google Gemini based on the session goals: "{session.details || 'Learn subject fundamentals'}"</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionRoom;
