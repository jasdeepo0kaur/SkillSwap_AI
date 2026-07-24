import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Dashboard.css";

import { 
  Coins, 
  Sparkles, 
  Send, 
  ArrowRight,
  Award,
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen
} from 'lucide-react';

const Dashboard = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: `Hi ${user ? user.name : 'there'}! I'm your AI Coach. How can I help you today?` }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [stats, setStats] = useState({
    skillsCount: 0,
    swapsCount: 0,
    coins: 100,
    profileScore: 50
  });

  // Feedback Form State
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSliderPaused, setIsSliderPaused] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const chatEndRef = useRef(null);
  const aiConsoleRef = useRef(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // 1. Fetch profile to ensure updated info
      const profileRes = await fetch(`${API_URL}/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUser(profileData);
        
        // Calculate profile completion score
        let score = 20; // base signup
        if (profileData.bio) score += 20;
        if (profileData.skillsTeach && profileData.skillsTeach.length > 0) score += 20;
        if (profileData.skillsLearn && profileData.skillsLearn.length > 0) score += 20;
        if (profileData.experience && profileData.availability) score += 20;

        setStats(prev => ({
          ...prev,
          coins: profileData.skillCoins,
          skillsCount: (profileData.skillsTeach?.length || 0) + (profileData.skillsLearn?.length || 0),
          profileScore: score
        }));
      }

      // 2. Fetch Sessions
      const sessionsRes = await fetch(`${API_URL}/sessions/my-sessions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        setSessions(sessionsData);
        
        const completedCount = sessionsData.filter(s => s.status === 'completed').length;
        setStats(prev => ({
          ...prev,
          swapsCount: completedCount
        }));
      }

      // 3. Fetch Leaderboard
      const leaderboardRes = await fetch(`${API_URL}/users/leaderboard`);
      if (leaderboardRes.ok) {
        const leaderboardData = await leaderboardRes.json();
        setLeaderboard(leaderboardData.slice(0, 3)); // show top 3
      } else {
        // Mock fallback if route not fully ready
        setLeaderboard([
          { name: 'Riya Patel', skillCoins: 5432, trustScore: 4.9 },
          { name: user?.name || 'Armaan K.', skillCoins: user?.skillCoins || 2450, trustScore: user?.trustScore || 5.0, isSelf: true },
          { name: 'Kabir Mehta', skillCoins: 3210, trustScore: 4.8 }
        ].sort((a,b) => b.skillCoins - a.skillCoins));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleSendChat = async (textToSend) => {
    const query = textToSend || chatInput;
    if (!query.trim()) return;

    setChatMessages(prev => [...prev, { sender: 'user', text: query }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const token = localStorage.getItem('token');
      // Request AI suggestions based on question topic
      let endpoint = '/ai/roadmap-generate';
      let payload = { skill: query, goals: 'General learning paths' };

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

      const data = await response.json();
      
      let aiTextResponse = '';
      if (endpoint === '/ai/bio-generate') {
        aiTextResponse = `Here's a draft of a professional bio based on your skills:\n\n"${data.bio}"\n\nYou can apply this in your profile!`;
      } else {
        aiTextResponse = data.roadmap || `I've analyzed your interest in "${query}". Here is some advice:\n\n- Build practical projects to reinforce concepts.\n- Teach this subject to others on SkillSwap to solidify your understanding.\n- Schedule swaps with expert mentors!`;
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: aiTextResponse }]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I ran into an error connecting to my server. Try again!' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed': return 'completed';
      case 'scheduled':
      case 'in-progress': return 'in-progress';
      case 'pending':
      case 'accepted': return 'pending';
      default: return 'cancelled';
    }
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (userRating === 0) return;
    setSubmittingFeedback(true);

    setTimeout(() => {
      setSubmittingFeedback(false);
      setFeedbackSubmitted(true);
      setTimeout(() => {
        setFeedbackSubmitted(false);
        setUserRating(0);
        setFeedbackText('');
      }, 4000);
    }, 1500);
  };

  // Slides data for slider
  const slides = [
    {
      badge: "Full-Stack Dev Track",
      title: "Next.js 15 & Rolldown",
      desc: "Learn advanced route handlers, React Server Components (RSC), and optimize builds using the next-generation Rolldown bundler.",
      time: "4 hours",
      level: "Intermediate",
      rating: "4.9",
      svg: (
        <svg viewBox="0 0 100 100" fill="none">
          <rect x="15" y="15" width="30" height="30" rx="8" fill="url(#grad1)" stroke="#fff" strokeWidth="1" />
          <rect x="55" y="15" width="30" height="30" rx="8" fill="url(#grad2)" stroke="#fff" strokeWidth="1" />
          <rect x="35" y="55" width="30" height="30" rx="8" fill="url(#grad3)" stroke="#fff" strokeWidth="1" />
          <path d="M45 30H55" stroke="#ec4899" strokeWidth="2" strokeDasharray="2" />
          <path d="M30 45V55H35" stroke="#a855f7" strokeWidth="2" strokeDasharray="2" />
          <circle cx="50" cy="50" r="4" fill="#00f5ff" />
          <defs>
            <linearGradient id="grad1" x1="0" y1="0" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#8a2be2" />
            </linearGradient>
            <linearGradient id="grad2" x1="0" y1="0" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8a2be2" />
              <stop offset="100%" stopColor="#00f5ff" />
            </linearGradient>
            <linearGradient id="grad3" x1="0" y1="0" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff0099" />
              <stop offset="100%" stopColor="#ffd600" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      badge: "Artificial Intelligence",
      title: "Generative LLM Agents",
      desc: "Assemble custom AI orchestrators using state-of-the-art framework systems, context prompt routers, and multi-agent databases.",
      time: "6 hours",
      level: "Advanced",
      rating: "5.0",
      svg: (
        <svg viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="16" fill="url(#grad2)" stroke="#fff" strokeWidth="1" />
          <circle cx="20" cy="30" r="8" fill="#111827" stroke="#ec4899" strokeWidth="1.5" />
          <circle cx="80" cy="30" r="8" fill="#111827" stroke="#ec4899" strokeWidth="1.5" />
          <circle cx="20" cy="70" r="8" fill="#111827" stroke="#00f5ff" strokeWidth="1.5" />
          <circle cx="80" cy="70" r="8" fill="#111827" stroke="#00f5ff" strokeWidth="1.5" />
          <line x1="28" y1="35" x2="42" y2="45" stroke="#ec4899" strokeWidth="1.5" />
          <line x1="72" y1="35" x2="58" y2="45" stroke="#ec4899" strokeWidth="1.5" />
          <line x1="28" y1="65" x2="42" y2="55" stroke="#00f5ff" strokeWidth="1.5" />
          <line x1="72" y1="65" x2="58" y2="55" stroke="#00f5ff" strokeWidth="1.5" />
        </svg>
      )
    },
    {
      badge: "Creative Design Systems",
      title: "Neon Glass Figma UI/UX",
      desc: "Implement high-fidelity interactive mockups using gradient border shapes, layout components, and neumorphic offsets.",
      time: "3.5 hours",
      level: "Beginner",
      rating: "4.8",
      svg: (
        <svg viewBox="0 0 100 100" fill="none">
          <path d="M30 20C30 30 40 30 50 30C60 30 70 30 70 20C70 10 60 10 50 10C40 10 30 10 30 20Z" fill="url(#grad3)" opacity="0.8" />
          <path d="M30 50C30 60 40 60 50 60C60 60 70 60 70 50V35H30V50Z" fill="url(#grad1)" opacity="0.8" />
          <circle cx="50" cy="75" r="15" fill="url(#grad2)" opacity="0.8" />
        </svg>
      )
    },
    {
      badge: "DevOps Architecture",
      title: "Docker & Kubernetes Containers",
      desc: "Learn isolation, multi-container compose flows, secure network routing, and orchestrate pod scales with K8s clusters.",
      time: "5 hours",
      level: "Intermediate",
      rating: "4.9",
      svg: (
        <svg viewBox="0 0 100 100" fill="none">
          <rect x="25" y="25" width="50" height="50" rx="6" fill="url(#grad2)" stroke="#fff" strokeWidth="1" />
          <rect x="35" y="35" width="30" height="30" rx="3" fill="#111827" stroke="#00f5ff" strokeWidth="1.5" />
          <line x1="25" y1="50" x2="75" y2="50" stroke="#fff" strokeWidth="1" />
          <line x1="50" y1="25" x2="50" y2="75" stroke="#fff" strokeWidth="1" />
        </svg>
      )
    },
    {
      badge: "Script Automation",
      title: "Python Automation Systems",
      desc: "Build task scripts, automate browser scrapers, orchestrate schedule triggers, and integrate Discord notification bots.",
      time: "3 hours",
      level: "Beginner",
      rating: "4.7",
      svg: (
        <svg viewBox="0 0 100 100" fill="none">
          <path d="M50 20C40 20 40 30 30 30C20 30 20 40 20 50C20 60 30 60 40 60H50" stroke="url(#grad1)" strokeWidth="4" strokeLinecap="round" />
          <path d="M50 80C60 80 60 70 70 70C80 70 80 60 80 50C80 40 70 40 60 40H50" stroke="url(#grad3)" strokeWidth="4" strokeLinecap="round" />
          <circle cx="35" cy="45" r="2" fill="#fff" />
          <circle cx="65" cy="55" r="2" fill="#fff" />
        </svg>
      )
    }
  ];

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Auto-play for the slider (paused when hovered)
  useEffect(() => {
    if (isSliderPaused) return;
    const timer = setInterval(() => {
      handleNextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide, isSliderPaused]);

  return (
    <div className="content-body">
      
      {/* 1. Launch Rocket Hero Banner */}
      <div className="dashboard-banner">
        <div className="banner-content">
          <h2 className="banner-title">
            Good evening, {user ? user.name.split(' ')[0] : 'Swapper'}! 👋
          </h2>
          <p className="banner-subtitle">
            Keep learning, keep sharing, keep growing. You have active swaps pending scheduling. Schedule them to earn trust.
          </p>
          <div className="banner-stats">
            <div className="stat-item">
              <span className="stat-val">{stats.skillsCount}</span>
              <span className="stat-lbl">Skills</span>
            </div>
            <div className="stat-item" style={{ borderLeft: '1px solid rgba(139, 92, 246, 0.25)', paddingLeft: '1.5rem' }}>
              <span className="stat-val">{stats.swapsCount}</span>
              <span className="stat-lbl">Swaps</span>
            </div>
            <div className="stat-item" style={{ borderLeft: '1px solid rgba(139, 92, 246, 0.25)', paddingLeft: '1.5rem' }}>
              <span className="stat-val" style={{ color: '#db2777' }}>{stats.coins}</span>
              <span className="stat-lbl">Tokens</span>
            </div>
            <div className="stat-item" style={{ borderLeft: '1px solid rgba(139, 92, 246, 0.25)', paddingLeft: '1.5rem' }}>
              <span className="stat-val">{stats.profileScore}%</span>
              <span className="stat-lbl">Profile Score</span>
              <div className="level-meter-container">
                <div className="level-meter" style={{ width: `${stats.profileScore}%`, background: 'linear-gradient(90deg, #ec4899, #a855f7)' }}></div>
              </div>
            </div>
          </div>
        </div>
        <div className="banner-illustration">
          {/* Custom Informative Vector Spaceship Graphic */}
          <svg className="rocket-svg" viewBox="0 0 100 100" fill="none">
            <path d="M50 15C50 15 35 35 35 60C35 75 50 82 50 82C50 82 65 75 65 60C65 35 50 15 50 15Z" fill="url(#bannerIllustrationGrad)" stroke="#fff" strokeWidth="1.5" />
            <circle cx="50" cy="45" r="8" fill="#fff" opacity="0.8" />
            <circle cx="50" cy="45" r="4" fill="#00f5ff" />
            <path d="M35 60L25 72V80L38 74" fill="#db2777" />
            <path d="M65 60L75 72V80L62 74" fill="#db2777" />
            <path d="M50 82V92" stroke="#ff0099" strokeWidth="3" strokeLinecap="round" />
            <path d="M45 84V90" stroke="#ffd600" strokeWidth="2" />
            <path d="M55 84V90" stroke="#ffd600" strokeWidth="2" />
            <defs>
              <linearGradient id="bannerIllustrationGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* 2. Widgets Grid */}
      <div className="widgets-grid">
        <div className="widget-card tokens">
          <div className="widget-info">
            <span className="widget-lbl">My Tokens</span>
            <span className="widget-val">
              <Coins size={20} color="#f59e0b" fill="#f59e0b" /> {stats.coins}
            </span>
            <span className="widget-trend">+20 this week</span>
          </div>
          <div className="widget-icon-box amber">
            {/* Custom Coin illustration SVG */}
            <svg viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" fill="url(#coinGrad)" stroke="#f59e0b" strokeWidth="1.5" />
              <circle cx="20" cy="20" r="11" fill="none" stroke="#fff" strokeWidth="1.5" strokeDasharray="4 2" />
              <text x="20" y="24" fill="#fff" fontSize="13" fontWeight="900" textAnchor="middle">$</text>
              <defs>
                <linearGradient id="coinGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <div className="widget-card swaps" style={{ cursor: 'pointer' }} onClick={() => navigate('/swaps')}>
          <div className="widget-info">
            <span className="widget-lbl">Active Swaps</span>
            <span className="widget-val">
              {sessions.filter(s => s.status !== 'completed' && s.status !== 'cancelled').length}
            </span>
            <span className="widget-trend">View all swaps</span>
          </div>
          <div className="widget-icon-box purple">
            {/* Custom overlapping active swap circles */}
            <svg viewBox="0 0 40 40">
              <circle cx="16" cy="20" r="10" fill="none" stroke="#a855f7" strokeWidth="2.5" />
              <circle cx="24" cy="20" r="10" fill="none" stroke="#ec4899" strokeWidth="2.5" />
              <path d="M20 15L23 18L20 21" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="widget-card wishlist" style={{ cursor: 'pointer' }} onClick={() => navigate('/skills')}>
          <div className="widget-info">
            <span className="widget-lbl">Wishlist</span>
            <span className="widget-val">{user?.skillsLearn?.length || 0}</span>
            <span className="widget-trend">Skills to learn</span>
          </div>
          <div className="widget-icon-box teal">
            {/* Custom Mesh Heart Illustration */}
            <svg viewBox="0 0 40 40">
              <path d="M12 12C9 15 9 20 13 24L20 31L27 24C31 20 31 15 28 12C24 9 22 13 20 15C18 13 16 9 12 12Z" fill="url(#heartGrad)" stroke="#fff" strokeWidth="1" />
              <path d="M15 15H25" stroke="#fff" strokeWidth="0.75" opacity="0.3" />
              <path d="M17 19H23" stroke="#fff" strokeWidth="0.75" opacity="0.3" />
              <defs>
                <linearGradient id="heartGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2dd4bf" />
                  <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <div className="widget-card coach" style={{ cursor: 'pointer' }} onClick={() => navigate('/ai-coach')}>
          <div className="widget-info">
            <span className="widget-lbl">AI Coach</span>
            <span className="widget-val" style={{ fontSize: '1.1rem' }}>Ask anything</span>
            <span className="widget-trend">Get dynamic roadmaps</span>
          </div>
          <div className="widget-icon-box pink">
            {/* Custom Neural Connective Brain Illustration */}
            <svg viewBox="0 0 40 40">
              <circle cx="15" cy="15" r="3" fill="#fff" />
              <circle cx="25" cy="15" r="3" fill="#fff" />
              <circle cx="20" cy="28" r="3" fill="#fff" />
              <line x1="15" y1="15" x2="25" y2="15" stroke="url(#brainGrad)" strokeWidth="2" />
              <line x1="15" y1="15" x2="20" y2="28" stroke="url(#brainGrad)" strokeWidth="2" />
              <line x1="25" y1="15" x2="20" y2="28" stroke="url(#brainGrad)" strokeWidth="2" />
              <circle cx="20" cy="19" r="6" fill="#ec4899" opacity="0.7" />
              <defs>
                <linearGradient id="brainGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#f43f5e" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* 3. NEW SECTION: Roadmap Slide Carousel */}
      <div 
        className="roadmap-slider-section"
        onMouseEnter={() => setIsSliderPaused(true)}
        onMouseLeave={() => setIsSliderPaused(false)}
      >
        <button className="slider-btn prev" onClick={handlePrevSlide}>
          <ChevronLeft size={24} />
        </button>
        <button className="slider-btn next" onClick={handleNextSlide}>
          <ChevronRight size={24} />
        </button>

        <div className="roadmap-slider-container">
          <div className="roadmap-slider-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {slides.map((slide, index) => (
              <div key={index} className="roadmap-slide">
                
                <div className="slide-info-panel">
                  <span className="slide-badge">{slide.badge}</span>
                  <h3 className="slide-title">{slide.title}</h3>
                  <p className="slide-desc">{slide.desc}</p>
                  
                  <div className="slide-meta-row">
                    <div className="slide-meta-item">
                      <Clock size={16} color="#ec4899" />
                      <span>{slide.time}</span>
                    </div>
                    <div className="slide-meta-item">
                      <BookOpen size={16} color="#a855f7" />
                      <span>{slide.level}</span>
                    </div>
                    <div className="slide-meta-item">
                      <Award size={16} color="#ffd600" />
                      <span>{slide.rating} Rating</span>
                    </div>
                  </div>

                  <div className="slider-actions-row">
                    <button className="btn-send" style={{ width: 'auto', borderRadius: '14px', padding: '0.6rem 1.5rem', fontWeight: '800', height: 'auto', fontSize: '0.85rem' }} onClick={() => { handleSendChat(`Suggest ${slide.title} roadmap`); aiConsoleRef.current?.scrollIntoView({ behavior: 'smooth' }); }}>
                      Start Study Roadmap <ArrowRight size={14} style={{ marginLeft: '0.35rem' }} />
                    </button>
                    
                    <select className="slider-topic-dropdown" defaultValue="" onChange={(e) => { if (e.target.value) { handleSendChat(`Suggest ${e.target.value} roadmap`); aiConsoleRef.current?.scrollIntoView({ behavior: 'smooth' }); e.target.value = ""; } }}>
                      <option value="" disabled>Explore More AI Topics...</option>
                      <option value="Python Script Automation">Python Script Automation</option>
                      <option value="Docker & Containers basics">Docker & Containers basics</option>
                      <option value="SQL Database Optimization">SQL Database Optimization</option>
                      <option value="Cyber Security basics">Cyber Security basics</option>
                      <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                      <option value="TailwindCSS layout systems">TailwindCSS layout systems</option>
                      <option value="Machine Learning Neural Networks">Machine Learning Neural Networks</option>
                    </select>
                  </div>
                </div>

                <div className="slide-graphic-panel">
                  {slide.svg}
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="slider-dots" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              style={{
                width: currentSlide === idx ? '1.5rem' : '0.5rem',
                height: '0.5rem',
                borderRadius: '9999px',
                border: 'none',
                background: currentSlide === idx ? 'linear-gradient(90deg, #ec4899, #a855f7)' : 'rgba(255,255,255,0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: currentSlide === idx ? '0 0 8px rgba(168, 85, 247, 0.5)' : 'none'
              }}
            />
          ))}
        </div>
      </div>

      {/* 4. Columns Split */}
      <div className="dashboard-columns">
        {/* Left Column: Recent Swaps */}
        <div className="glass-panel" style={{ minHeight: '380px' }}>
          <div className="panel-header">
            <h3 className="panel-title">Recent Swaps</h3>
            <span className="view-all-link" style={{ cursor: 'pointer' }} onClick={() => navigate('/swaps')}>View all</span>
          </div>

          <div className="swaps-list">
            {sessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
                <p>No swaps yet. Go to the marketplace to request a swap!</p>
                <button 
                  className="btn-send" 
                  style={{ width: 'auto', padding: '0.6rem 1.5rem', marginTop: '1rem', height: 'auto', borderRadius: '14px', fontWeight: '800' }}
                  onClick={() => navigate('/marketplace')}
                >
                  Explore Subject Marketplace
                </button>
              </div>
            ) : (
              sessions.slice(0, 4).map((session) => {
                const isLearner = session.learner?._id === user?._id;
                const partner = isLearner ? session.teacher : session.learner;
                return (
                  <div key={session._id} className="swap-card">
                    <div className="swap-user-info">
                      <div className="user-avatar">
                        {partner?.name ? partner.name.charAt(0).toUpperCase() : 'P'}
                      </div>
                      <div className="swap-details">
                        <span className="swap-meta-title">{isLearner ? 'Learning Subject' : 'Teaching Subject'}</span>
                        <span className="swap-skill-title">{session.skill}</span>
                        <span className="swap-partner-name">with {partner?.name || 'Deleted User'}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className={`status-badge ${getStatusClass(session.status)}`}>
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </span>
                      <button 
                        className="btn-send" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', height: 'auto', borderRadius: '10px' }}
                        onClick={() => navigate(`/swaps/${session._id}`)}
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

        {/* Right Column: AI Coach Chat Console & Leaderboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* AI Coach Console */}
          <div ref={aiConsoleRef} className="glass-panel ai-coach-console">
            <div className="ai-chat-header">
              <span className="ai-chat-title">
                <Sparkles size={16} color="#a855f7" /> AI Coach
              </span>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button 
                  className="btn-send" 
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem', height: 'auto', borderRadius: '8px' }}
                  onClick={() => navigate('/ai-coach')}
                >
                  Full Screen
                </button>
                <button 
                  className="btn-send" 
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem', height: 'auto', borderRadius: '8px' }}
                  onClick={() => setChatMessages([{ sender: 'ai', text: `Hi ${user ? user.name : 'there'}! I'm your AI Coach. How can I help you today?` }])}
                >
                  Reset Chat
                </button>
              </div>
            </div>

            <div className="ai-chat-messages">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`chat-bubble ${msg.sender}`}>
                  {msg.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                </div>
              ))}
              {chatLoading && (
                <div className="chat-bubble ai" style={{ opacity: 0.6 }}>
                  AI Coach is typing...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="suggestion-chips">
              <button className="suggestion-chip" onClick={() => handleSendChat('Suggest React roadmap')}>
                Suggest React roadmap
              </button>
              <button className="suggestion-chip" onClick={() => handleSendChat('Improve my profile bio')}>
                Improve my profile bio
              </button>
              <button className="suggestion-chip" onClick={() => handleSendChat('How to earn more tokens?')}>
                How to earn more tokens?
              </button>
            </div>

            <div className="chat-input-box">
              <input 
                type="text" 
                placeholder="Type your message..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              />
              <button className="btn-send" onClick={() => handleSendChat()}>
                <Send size={12} />
              </button>
            </div>
          </div>

          {/* Leaderboard Panel */}
          <div className="glass-panel leaderboard-panel">
            <div className="panel-header" style={{ marginBottom: '0.75rem' }}>
              <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Award size={18} color="#ffd600" /> Leaderboard
              </h3>
              <span className="view-all-link" style={{ cursor: 'pointer' }} onClick={() => navigate('/leaderboard')}>View full</span>
            </div>

            <div className="leader-list">
              {leaderboard.map((item, idx) => (
                <div 
                  key={idx} 
                  className="leader-item"
                  style={item.isSelf ? { border: '1px solid #ec4899', backgroundColor: 'rgba(236, 72, 153, 0.05)' } : {}}
                >
                  <div className="leader-rank-info">
                    <span className={`leader-rank rank-${idx + 1}`}>{idx + 1}</span>
                    <div className="leader-avatar">
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="leader-name">
                      {item.name} {item.isSelf && '(You)'}
                    </span>
                  </div>
                  <span className="leader-score">
                    <Coins size={12} fill="#d97706" color="#d97706" /> {item.skillCoins}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Platform Simulation Gallery */}
      <div className="glass-panel" style={{ marginTop: '2rem', padding: '2.25rem' }}>
        <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
          <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#a855f7' }}>
            <Sparkles size={18} color="#a855f7" /> How SkillSwap AI Works
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '700' }}>GUIDE MAP</span>
        </div>

        <div className="gallery-stack" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {[
            { 
              title: 'Collaborative Peer Exchanges', 
              desc: 'Meet fellow students directly inside our virtual swap rooms. Share design assets, solve coding roadblocks, and exchange insights.',
              img: '/skillswap_study_1.png'
            },
            { 
              title: 'Gemini AI Study Assistant', 
              desc: 'Ask the AI Coach for guidance. Gemini automatically outlines detailed, step-by-step roadmaps and suggests matches.',
              img: '/skillswap_study_2.png'
            },
            { 
              title: 'Interactive Tutor Classrooms', 
              desc: 'Earn tokens by teaching your favorite topics. Spend coins to book high-reputation mentors, keeping the balance fair.',
              img: '/skillswap_study_3.png'
            },
            { 
              title: 'Zero-Cost SkillCoin Wallets', 
              desc: 'Receive 100 free SkillCoins upon registration. Transact securely inside video swap sessions without paying cash.',
              img: '/skillswap_study_4.png'
            }
          ].map((item, idx) => (
            <div key={idx} className="gallery-card" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '2.5rem', alignItems: 'center', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '1.5rem', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
              {/* Image side */}
              <div style={{ borderRadius: '16px', overflow: 'hidden', height: '220px' }}>
                <img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              
              {/* Text side */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textCombineUpright: 'none' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#ec4899', textTransform: 'uppercase', letterSpacing: '0.05em' }}>STEP 0{idx + 1}</span>
                <h4 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>{item.title}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community Feedback Box */}
      <div className="glass-panel feedback-section" style={{ marginTop: '2rem' }}>
        <div className="panel-header" style={{ marginBottom: '0.75rem' }}>
          <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ec4899' }}>
            <Award size={18} color="#ec4899" /> Submit Beta Feedback Review
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '700' }}>TRANSMIT TO DEVS</span>
        </div>
        
        <div className="feedback-box-container" style={{ margin: '0 auto', maxWidth: '600px', width: '100%' }}>
          {!feedbackSubmitted ? (
            <form onSubmit={handleFeedbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.25rem', color: 'var(--text-primary)', textAlign: 'center' }}>
                How would you rate your experience with SkillSwap AI?
              </h4>
              
              <div className="rating-stars-selection" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', margin: '0.5rem 0' }}>
                {[1, 2, 3, 4, 5].map((starIdx) => (
                  <button
                    key={starIdx}
                    type="button"
                    className={`rating-star-btn ${(hoverRating || userRating) >= starIdx ? 'rating-star-btn-active' : ''}`}
                    onMouseEnter={() => setHoverRating(starIdx)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setUserRating(starIdx)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                  >
                    <svg viewBox="0 0 24 24" width="32" height="32" fill={(hoverRating || userRating) >= starIdx ? '#ffd600' : 'transparent'} stroke="#ffd600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: (hoverRating || userRating) >= starIdx ? 'drop-shadow(0 0 6px rgba(255, 214, 0, 0.4))' : 'none' }}>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                ))}
              </div>

              <textarea
                className="feedback-textarea"
                placeholder="Tell us what features or design details you'd like to see in our upcoming launch..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                required
                style={{ width: '100%', minHeight: '100px', background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '1rem', color: 'var(--text-primary)', outline: 'none', fontSize: '0.88rem' }}
              />

              <button 
                type="submit" 
                className="btn-send" 
                disabled={userRating === 0 || submittingFeedback}
                style={{ width: '100%', height: 'auto', padding: '0.75rem', borderRadius: '14px', fontWeight: '800', fontSize: '0.9rem', opacity: userRating === 0 ? 0.6 : 1 }}
              >
                {submittingFeedback ? 'Transmitting Data...' : 'Submit Feedback'}
              </button>
            </form>
          ) : (
            <div style={{ padding: '2rem 0', textAlign: 'center' }}>
              <div style={{ width: '4.5rem', height: '4.5rem', borderRadius: '50%', background: 'rgba(0, 255, 149, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00ff95', margin: '0 auto 1.5rem auto', border: '2px solid rgba(0, 255, 149, 0.25)', boxShadow: '0 0 20px rgba(0, 255, 149, 0.2)' }}>
                <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '0.75rem', color: '#00ff95', fontWeight: '800' }}>Thank You!</h3>
              <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
                Your feedback has been successfully registered. You've earned a beta participant tag!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
