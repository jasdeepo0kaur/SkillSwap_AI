import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Send, 
  Trash2, 
  Bot, 
  Info, 
  ArrowLeft, 
  Brain,
  Compass
} from 'lucide-react';

const AICoach = ({ user }) => {
  const navigate = useNavigate();
  const [chatMessages, setChatMessages] = useState([
    { 
      sender: 'ai', 
      text: `Welcome to your AI Learning Coach, ${user ? user.name.split(' ')[0] : 'Swapper'}! 🚀\n\nI can help you build custom step-by-step learning roadmaps, design study plans, draft professional bios, or answer any skill-related questions.\n\nWhat skill or topic would you like to explore today?` 
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [activeDetail, setActiveDetail] = useState(null);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSendChat = async (textToSend) => {
    const query = textToSend || chatInput;
    if (!query.trim()) return;

    // Add user message to list
    setChatMessages(prev => [...prev, { sender: 'user', text: query }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const token = localStorage.getItem('token');
      let endpoint = '/ai/roadmap-generate';
      let payload = { skill: query, goals: 'General learning paths' };

      // Determine the AI endpoint based on prompt matching
      if (query.toLowerCase().includes('profile') || query.toLowerCase().includes('bio')) {
        endpoint = '/ai/bio-generate';
        payload = { 
          skillsTeach: user?.skillsTeach || [], 
          skillsLearn: user?.skillsLearn || [], 
          experience: user?.experience || 'Beginner' 
        };
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Server returned an error');
      }

      const data = await response.json();
      
      let aiTextResponse = '';
      let detailContent = null;

      if (endpoint === '/ai/bio-generate') {
        aiTextResponse = `Drafted a professional profile bio based on your skills! Check the details panel to the right to copy/paste it into your profile.`;
        detailContent = {
          title: 'AI Generated Bio Draft',
          subtitle: 'Profile Optimization',
          type: 'bio',
          content: data.bio || 'Unable to generate bio.'
        };
      } else {
        aiTextResponse = `I have compiled a custom 3-phase roadmap for "${query}". I've populated the detailed path on the right panel!`;
        detailContent = {
          title: `Roadmap: ${query}`,
          subtitle: 'Custom Learning Plan',
          type: 'roadmap',
          content: data.roadmap || 'No roadmap generated.'
        };
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: aiTextResponse, detail: detailContent }]);
      if (detailContent) {
        setActiveDetail(detailContent);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I ran into an error connecting to my server. Try again!' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Simple clean markdown-to-html previewer
  const renderDetailContent = (text) => {
    if (!text) return null;
    
    // Split lines
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('###')) {
        return <h3 key={idx} style={{ color: 'var(--text-primary)', marginTop: '1.25rem', marginBottom: '0.5rem', fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>{trimmed.replace('###', '').trim()}</h3>;
      }
      if (trimmed.startsWith('####')) {
        return <h4 key={idx} style={{ color: 'var(--accent-teal)', marginTop: '1rem', marginBottom: '0.4rem', fontSize: '0.95rem' }}>{trimmed.replace('####', '').trim()}</h4>;
      }
      if (trimmed.startsWith('-')) {
        return <li key={idx} style={{ marginLeft: '1.25rem', marginBottom: '0.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{trimmed.replace(/^-/, '').trim()}</li>;
      }
      if (trimmed === '') {
        return <div key={idx} style={{ height: '0.5rem' }} />;
      }
      
      return <p key={idx} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '0.5rem' }}>{trimmed}</p>;
    });
  };

  return (
    <div className="content-body" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      {/* Page Header */}
      <div className="flex-between" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <div className="flex-align-center gap-1">
          <button className="action-btn" onClick={() => navigate('/dashboard')} title="Go to Dashboard">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bot size={22} color="var(--accent-teal)" /> AI Learning Coach
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Get custom structured roadmaps, profile bio drafts, and guidance instantly
            </p>
          </div>
        </div>

        <button 
          className="btn-secondary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
          onClick={() => {
            setChatMessages([{ sender: 'ai', text: `Hi ${user ? user.name.split(' ')[0] : 'there'}! I'm your AI Coach. How can I help you today?` }]);
            setActiveDetail(null);
          }}
        >
          <Trash2 size={14} /> Clear Chat
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="room-split-container">
        {/* Left Column: Chat Conversation */}
        <div className="glass-panel room-left" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <div className="ai-chat-header" style={{ marginBottom: '1rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              💬 Chat Console
            </span>
          </div>

          {/* Messages Feed */}
          <div className="ai-chat-messages" style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', paddingRight: '0.25rem' }}>
            {chatMessages.map((msg, index) => (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <div className={`chat-bubble ${msg.sender}`} style={{ marginBottom: '0.25rem', maxWidth: '85%' }}>
                  {msg.text.split('\n').map((line, i) => <p key={i} style={{ margin: 0 }}>{line}</p>)}
                  
                  {msg.detail && (
                    <button 
                      className="btn-secondary" 
                      style={{ 
                        marginTop: '0.5rem', 
                        padding: '0.25rem 0.6rem', 
                        fontSize: '0.7rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.3rem',
                        backgroundColor: 'rgba(255,255,255,0.05)'
                      }}
                      onClick={() => setActiveDetail(msg.detail)}
                    >
                      <Brain size={12} /> View Details Panel
                    </button>
                  )}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="chat-bubble ai" style={{ opacity: 0.6 }}>
                AI Coach is thinking...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="suggestion-chips" style={{ marginBottom: '0.75rem' }}>
            <button className="suggestion-chip" onClick={() => handleSendChat('Suggest Python Web Development roadmap')}>
              🐍 Python Web Dev Roadmap
            </button>
            <button className="suggestion-chip" onClick={() => handleSendChat('Suggest UI/UX Design roadmap')}>
              🎨 UI/UX Design Roadmap
            </button>
            <button className="suggestion-chip" onClick={() => handleSendChat('Improve my profile bio')}>
              📝 Draft profile bio
            </button>
            <button className="suggestion-chip" onClick={() => handleSendChat('How to earn more tokens?')}>
              🪙 How to earn tokens?
            </button>
          </div>

          {/* Input Box */}
          <div className="chat-input-box">
            <input 
              type="text" 
              placeholder="Ask for custom roadmaps, study plans, or profile help..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              style={{ fontSize: '0.85rem' }}
            />
            <button className="btn-send" onClick={() => handleSendChat()} style={{ width: '2rem', height: '2rem' }}>
              <Send size={12} />
            </button>
          </div>
        </div>

        {/* Right Column: Roadmap Details View */}
        <div className="glass-panel room-right" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          {activeDetail ? (
            <>
              {/* Detail Panel Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <Brain size={18} color="var(--accent-purple)" />
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{activeDetail.title}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-teal)' }}>{activeDetail.subtitle}</span>
                </div>
              </div>

              {/* Detail Scrollable Content */}
              <div className="roadmap-viewer" style={{ flex: 1, overflowY: 'auto' }}>
                {activeDetail.type === 'bio' ? (
                  <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                    <p style={{ fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.6', marginBottom: '1rem' }}>
                      "{activeDetail.content}"
                    </p>
                    <button 
                      className="btn-secondary" 
                      style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                      onClick={() => {
                        navigator.clipboard.writeText(activeDetail.content);
                        alert('Bio copied to clipboard! You can paste it in your profile Settings page.');
                      }}
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                ) : (
                  <div>
                    {renderDetailContent(activeDetail.content)}
                  </div>
                )}
              </div>

              {/* Detail Footer Info */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: '0.4rem', marginTop: 'auto' }}>
                <Info size={14} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                <span>You can copy this roadmap details or request different subjects. Ask the coach to customize the phases.</span>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Compass size={36} color="var(--text-muted)" />
              </div>
              <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>AI Detail Workspace</h4>
              <p style={{ fontSize: '0.85rem', maxWidth: '300px', lineHeight: '1.5' }}>
                Enter a topic or click a chip on the left chat console. Your custom study roadmaps and profile drafts will load here in detail.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AICoach;
