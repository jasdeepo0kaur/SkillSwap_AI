import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, ShieldAlert, Sparkles, Brain, ArrowRight, Star, Send, 
  ChevronDown, Compass, Users, Check, 
  Terminal, Palette, Zap, Cpu, GraduationCap, Coins, TrendingUp
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const starCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const titleRef = useRef(null);

  // FAQ Accordion state
  const [activeFaq, setActiveFaq] = useState(null);

  // AI Mentor chat state
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your SkillSwap AI Coach. Tell me what subject or technology you want to learn, and I will outline a customized peer roadmap.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatBottomRef = useRef(null);

  // Student Showcase Active Tab
  const [showcaseTab, setShowcaseTab] = useState('all');

  // Stats numbers increment triggers
  const [stats, setStats] = useState({ swaps: 0, rating: 0, coins: 0, students: 0 });
  const statsSectionRef = useRef(null);
  const statsAnimated = useRef(false);

  // Mouse Parallax coordinates
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const xOffset = (clientX - window.innerWidth / 2) * 0.015;
      const yOffset = (clientY - window.innerHeight / 2) * 0.015;
      document.documentElement.style.setProperty('--mouse-x', `${xOffset}px`);
      document.documentElement.style.setProperty('--mouse-y', `${yOffset}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Galaxy Canvas star rendering
  useEffect(() => {
    const canvas = starCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create stars
    const stars = [];
    const starCount = 90;
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        twinkleSpeed: 0.01 + Math.random() * 0.02,
        twinklePhase: Math.random() * Math.PI * 2,
        color: i % 3 === 0 ? '#00f5ff' : i % 3 === 1 ? '#ff0099' : '#ffffff'
      });
    }

    // Shooting star trigger
    let shootingStar = null;
    const triggerShootingStar = () => {
      shootingStar = {
        x: Math.random() * canvas.width * 0.7,
        y: Math.random() * canvas.height * 0.4,
        length: 80 + Math.random() * 100,
        dx: 4 + Math.random() * 6,
        dy: 2 + Math.random() * 3,
        alpha: 1,
        fadeSpeed: 0.015 + Math.random() * 0.01
      };
    };

    // Draw frame loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Twinkling Stars
      stars.forEach(star => {
        star.twinklePhase += star.twinkleSpeed;
        const currentAlpha = 0.3 + (Math.sin(star.twinklePhase) + 1) * 0.35;
        
        ctx.fillStyle = star.color;
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Shooting Star
      if (shootingStar) {
        ctx.globalAlpha = shootingStar.alpha;
        const grad = ctx.createLinearGradient(
          shootingStar.x, 
          shootingStar.y, 
          shootingStar.x - shootingStar.length * 0.6, 
          shootingStar.y - shootingStar.length * 0.3
        );
        grad.addColorStop(0, '#00f5ff');
        grad.addColorStop(0.3, '#ff0099');
        grad.addColorStop(1, 'transparent');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(
          shootingStar.x - shootingStar.length * 0.8, 
          shootingStar.y - shootingStar.length * 0.4
        );
        ctx.stroke();

        // Move shooting star
        shootingStar.x += shootingStar.dx;
        shootingStar.y += shootingStar.dy;
        shootingStar.alpha -= shootingStar.fadeSpeed;

        if (shootingStar.alpha <= 0) {
          shootingStar = null;
        }
      } else if (Math.random() < 0.003) {
        triggerShootingStar();
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Stats Count Up triggers on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!statsSectionRef.current || statsAnimated.current) return;
      const rect = statsSectionRef.current.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;

      if (isVisible) {
        statsAnimated.current = true;
        
        const duration = 2000;
        const steps = 60;
        const interval = duration / steps;
        
        let currentStep = 0;
        const targetSwaps = 12450;
        const targetRating = 4.9;
        const targetCoins = 48200;
        const targetStudents = 2150;

        const timer = setInterval(() => {
          currentStep++;
          const progress = currentStep / steps;
          
          setStats({
            swaps: Math.floor(targetSwaps * progress),
            rating: parseFloat((targetRating * progress).toFixed(1)),
            coins: Math.floor(targetCoins * progress),
            students: Math.floor(targetStudents * progress)
          });

          if (currentStep >= steps) {
            clearInterval(timer);
            setStats({
              swaps: targetSwaps,
              rating: targetRating,
              coins: targetCoins,
              students: targetStudents
            });
          }
        }, interval);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // AI Mentor message responses simulation
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiTyping) return;

    const userMsgText = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsgText }]);
    setChatInput('');
    setIsAiTyping(true);

    // Auto-scroll chat to bottom
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    setTimeout(() => {
      let aiResponseText = '';
      const textLower = userMsgText.toLowerCase();

      if (textLower.includes('react') || textLower.includes('programming') || textLower.includes('js') || textLower.includes('web')) {
        aiResponseText = "🚀 Custom Roadmap Created!\n\nPhase 1: React Basics & UI Layout (Taught by Sarah K. - Rating 5.0)\nPhase 2: Global State Management (Taught by Alex M. - Rating 4.9)\nPhase 3: Real-Time Integrations (Taught by Marcus G. - Rating 4.8)\n\nI recommend requesting a 1-on-1 swap with Sarah K. using 20 SkillCoins.";
      } else if (textLower.includes('ai') || textLower.includes('python') || textLower.includes('learning')) {
        aiResponseText = "🧠 Gemini AI Guided Pathway:\n\nPhase 1: Data Preprocessing with Python (Taught by David R.)\nPhase 2: Neural Networks & Pytorch (Taught by Clara V.)\nPhase 3: Large Language Model Fine-Tuning (Taught by Dev L.)\n\nYou currently have 100 free SkillCoins. Tutors Clara V. and Dev L. are matching your schedule!";
      } else if (textLower.includes('design') || textLower.includes('figma') || textLower.includes('ux')) {
        aiResponseText = "🎨 Visual Design Custom Study Plan:\n\nPhase 1: Figma Layouts & Grid Systems (Taught by Kenji S.)\nPhase 2: Typography & High-Contrast Colors (Taught by Elena T.)\nPhase 3: Design Systems & Components (Taught by Sophia H.)\n\nEarn 20 SkillCoins by completing your introductory profile setup, then start your first swap session!";
      } else {
        aiResponseText = "🤖 Analyzing matching teachers on SkillSwap AI...\n\nI've generated a 3-part study stage for you. I recommend browsing our interactive tutor marketplace and sending a session proposal. Teachers typically reply within 2 hours!";
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: aiResponseText }]);
      setIsAiTyping(false);

      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    }, 1800);
  };



  // Student showcase items
  const studentData = [
    { name: 'Sarah Jenkins', role: 'UI Designer & Coder', quote: 'I taught Figma layout grids to standard web developers and in return learned python scripting. The SkillCoin ledger worked seamlessly, and Gemini AI drafted our study syllabus.', teach: ['Figma', 'UI Design', 'CSS'], learn: ['Python', 'Web Dev'], type: 'design' },
    { name: 'David Kim', role: 'Full Stack Engineer', quote: 'SkillSwap AI lets me trade my React knowledge to learn Public Speaking. Verified Trust Scores ensure you only book with high-reputation community peers.', teach: ['React', 'JavaScript', 'Node.js'], learn: ['Public Speaking', 'Pitching'], type: 'tech' },
    { name: 'Aria Patel', role: 'Product Marketing Manager', quote: 'I traded my career growth hacks for direct UI/UX prototyping. I unlocked level 4 recommends after receiving consecutive 5-star session ratings!', teach: ['Marketing', 'Resume Writing'], learn: ['Figma Design', 'Photoshop'], type: 'growth' },
    { name: 'Elena Rostova', role: 'Languages & AI Student', quote: 'Gemini AI automatically suggested my tutor matches. I taught Russian conversation and learned neural network basics from an computer science major!', teach: ['Russian', 'French'], learn: ['Machine Learning', 'AI Models'], type: 'all' }
  ];

  const filteredStudents = showcaseTab === 'all' 
    ? studentData 
    : studentData.filter(s => s.type === showcaseTab);

  // Navigation handlers
  const handleScrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-wrapper" ref={containerRef}>
      
      {/* Fixed Background Canvas for Galaxy Stars */}
      <div className="galaxy-canvas-container">
        <canvas ref={starCanvasRef} />
      </div>

      {/* Moving auroras and nebulae */}
      <div className="nebula-glow-1" />
      <div className="nebula-glow-2" />
      <div className="nebula-glow-3" />

      {/* Custom Premium Navbar */}
      <header className="landing-navbar">
        <a href="/" className="landing-nav-logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <div className="landing-nav-logo-icon">S</div>
          <span className="landing-nav-logo-text">SkillSwap AI</span>
        </a>
        <ul className="landing-nav-links">
          <li><span className="landing-nav-link" onClick={() => handleScrollToSection('about')}>About</span></li>
          <li><span className="landing-nav-link" onClick={() => handleScrollToSection('features')}>Features</span></li>
          <li><span className="landing-nav-link" onClick={() => handleScrollToSection('timeline')}>Timeline</span></li>
          <li><span className="landing-nav-link" onClick={() => handleScrollToSection('ai-mentor')}>AI Coach</span></li>
          <li><span className="landing-nav-link" onClick={() => handleScrollToSection('leaderboard')}>Rankings</span></li>
          <li><span className="landing-nav-link" onClick={() => handleScrollToSection('faq')}>FAQ</span></li>
        </ul>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="landing-nav-btn" onClick={() => navigate('/auth')}>Launch App</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-section" style={{ minHeight: '90vh', padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <div className="hero-content-inner">
          <motion.div 
            className="hero-logo-box"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.2 }}
          >
            <div className="landing-nav-logo-icon" style={{ width: '4.5rem', height: '4.5rem', fontSize: '2.5rem', borderRadius: '20px' }}>S</div>
          </motion.div>

          <motion.h1 
            ref={titleRef}
            className="hero-heading"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
          >
            Learn. Teach. <span className="gradient-text-rainbow">Grow.</span>
          </motion.h1>

          <motion.p 
            className="hero-subtitle-large"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            SkillSwap AI is a peer-to-peer futuristic learning community where students exchange expertise instead of money. Powered by Google Gemini AI to structure roadmaps and match top tutors.
          </motion.p>

          <motion.div 
            className="hero-cta-buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <button className="btn-rainbow-glow" onClick={() => navigate('/auth')}>
              Start Swapping Now <ArrowRight size={18} />
            </button>
            <button className="btn-secondary-glow" onClick={() => handleScrollToSection('about')}>
              Explore Platform
            </button>
          </motion.div>
        </div>
      </section>

      {/* About SkillSwap AI */}
      <section id="about" className="landing-section">
        <div className="section-header-centered">
          <span className="section-label">Visionary Hub</span>
          <h2 className="section-title-large">Welcome to the future of peer education</h2>
          <p className="section-desc-light">
            SkillSwap AI bypasses traditional financial barters to unlock raw community intelligence. We track skill exchanges on a verifiable ledger, verify peer trust ratings, and harness Generative AI to map your optimal academic learning trajectory.
          </p>
        </div>

        {/* Large Cinematic Illustration / Details Box */}
        <div className="neon-glow-card" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '2rem', marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }} className="gradient-text-cyan-blue">Intellectual Capital Redefined</h3>
            <p style={{ color: '#9ca3af', lineHeight: '1.6', fontSize: '1rem', marginBottom: '1.5rem' }}>
              Why pay exorbitant costs for custom tutoring when the person next to you can trade their computer coding insights for your design aesthetic? SkillCoins keep the platform balanced, allowing users to earn value by teaching and redeem it when studying.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', background: 'rgba(0, 245, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f5ff' }}><Check size={12} strokeWidth={3} /></div>
                <span style={{ fontWeight: 600 }}>Decentralized knowledge economy powered by SkillCoins</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', background: 'rgba(255, 0, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff0099' }}><Check size={12} strokeWidth={3} /></div>
                <span style={{ fontWeight: 600 }}>Gemini-powered request generators and visual progress maps</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', background: 'rgba(0, 255, 149, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00ff95' }}><Check size={12} strokeWidth={3} /></div>
                <span style={{ fontWeight: 600 }}>Interactive session reviews protecting user Trust Score benchmarks</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {/* Pulsing AI Neural Network Graphic */}
            <div style={{ width: '100%', maxWidth: '320px', height: '320px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="trust-shield-glow" style={{ width: '250px', height: '250px' }} />
              <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 15px rgba(138,43,226,0.3))' }}>
                <circle cx="50" cy="50" r="38" stroke="#8a2be2" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
                <circle cx="50" cy="50" r="22" stroke="#ff0099" strokeWidth="2" fill="none" />
                <line x1="50" y1="12" x2="50" y2="88" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
                <line x1="12" y1="50" x2="88" y2="50" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
                {/* Orbital nodes */}
                <circle cx="50" cy="12" r="5" fill="#00f5ff" />
                <circle cx="50" cy="88" r="5" fill="#ffd600" />
                <circle cx="12" cy="50" r="5" fill="#ff0099" />
                <circle cx="88" cy="50" r="5" fill="#00ff95" />
                <circle cx="50" cy="50" r="10" fill="#fff" />
                <path d="M50 43 L57 54 L43 54 Z" fill="#03050c" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="landing-section">
        <div className="section-header-centered">
          <span className="section-label">State of the Art Architecture</span>
          <h2 className="section-title-large">Engineered for peer performance</h2>
          <p className="section-desc-light">
            Each feature is meticulously crafted to ensure seamless academic exchange, protected tokens accountability, and highly structured tutoring workflows.
          </p>
        </div>

        <div className="features-container-grid">
          <div className="neon-glow-card">
            <div className="card-icon-container accent-blue">
              <Brain size={24} />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>AI Guided Roadmaps</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.92rem', lineHeight: '1.6' }}>
              Input any skill you desire, and our integrated Google Gemini engine instantly constructs custom progressive study stages and curriculum syllabus.
            </p>
          </div>

          <div className="neon-glow-card">
            <div className="card-icon-container accent-purple">
              <Award size={24} />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>SkillCoin Ledger</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.92rem', lineHeight: '1.6' }}>
              Start with 100 free tokens. Earn +20 tokens by teaching others. Spend 20 tokens to book expert sessions, maintaining a fair community circulation.
            </p>
          </div>

          <div className="neon-glow-card">
            <div className="card-icon-container accent-pink">
              <ShieldAlert size={24} />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>Trust Score Ratings</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.92rem', lineHeight: '1.6' }}>
              Every completed video swap is graded by the learner. Maintain high average ratings to unlock public recommendations and expert levels.
            </p>
          </div>
        </div>
      </section>

      {/* How SkillSwap Works */}
      <section className="landing-section">
        <div className="section-header-centered">
          <span className="section-label">Tutor Cycle Blueprint</span>
          <h2 className="section-title-large">How SkillSwap AI Works</h2>
          <p className="section-desc-light">
            Getting started takes under 2 minutes. Experience a completely friction-free educational match loop.
          </p>
        </div>

        <div className="how-it-works-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="card-icon-container accent-orange" style={{ marginTop: '1rem' }}>
              <Compass size={24} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>Create Profile</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.88rem', lineHeight: '1.5' }}>
              Sign up and receive 100 free SkillCoins. List the skills you excel at and the topics you want to learn. Gemini writes your professional bio.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <div className="card-icon-container accent-yellow" style={{ marginTop: '1rem' }}>
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>Match & Request</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.88rem', lineHeight: '1.5' }}>
              Browse the tutor marketplace. Gemini assists in drafting compelling, tailored session request proposals. Schedule is arranged automatically.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <div className="card-icon-container accent-green" style={{ marginTop: '1rem' }}>
              <Zap size={24} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>Swap & Review</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.88rem', lineHeight: '1.5' }}>
              Meet in the built-in video session room. Swap tokens, rate your teacher's clarity, leave reviews, and watch your public Trust Score grow!
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Timeline */}
      <section id="timeline" className="landing-section">
        <div className="section-header-centered">
          <span className="section-label">User Journey Ledger</span>
          <h2 className="section-title-large">Verifiable Timeline Ledger</h2>
          <p className="section-desc-light">
            Trace the typical timeline of a student leveraging peer exchanges to level up their academic profile.
          </p>
        </div>

        <div className="timeline-wrapper">
          <div className="timeline-line" />

          {/* Timeline Item 1 */}
          <div className="timeline-item timeline-item-left">
            <div className="timeline-node" />
            <div className="timeline-content-box">
              <span className="section-label" style={{ color: '#ff6b00' }}>Initial Setup</span>
              <h4 style={{ fontSize: '1.2rem', margin: '0.5rem 0', fontFamily: 'var(--font-heading)' }}>Joined community</h4>
              <p style={{ color: '#9ca3af', fontSize: '0.88rem', lineHeight: '1.5' }}>
                Sarah K. signed up, complete profile details, and instantly received a 100 SkillCoins registration award.
              </p>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginTop: '1rem' }}>TX: #01A94B - Wallet Balance: 100 SC</span>
            </div>
          </div>

          {/* Timeline Item 2 */}
          <div className="timeline-item">
            <div className="timeline-node" style={{ borderColor: '#8a2be2', boxShadow: '0 0 12px #8a2be2' }} />
            <div className="timeline-content-box">
              <span className="section-label" style={{ color: '#c084fc' }}>Learn Session Completed</span>
              <h4 style={{ fontSize: '1.2rem', margin: '0.5rem 0', fontFamily: 'var(--font-heading)' }}>Learned AI roadmaps</h4>
              <p style={{ color: '#9ca3af', fontSize: '0.88rem', lineHeight: '1.5' }}>
                Completed 1-hour swap learning Python Neural Networks. Spent 20 SkillCoins.
              </p>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginTop: '1rem' }}>TX: #03F88B - Wallet Balance: 80 SC</span>
            </div>
          </div>

          {/* Timeline Item 3 */}
          <div className="timeline-item timeline-item-left">
            <div className="timeline-node" style={{ borderColor: '#ff0099', boxShadow: '0 0 12px #ff0099' }} />
            <div className="timeline-content-box">
              <span className="section-label" style={{ color: '#ff0099' }}>Teach Session Completed</span>
              <h4 style={{ fontSize: '1.2rem', margin: '0.5rem 0', fontFamily: 'var(--font-heading)' }}>Taught Figma UI systems</h4>
              <p style={{ color: '#9ca3af', fontSize: '0.88rem', lineHeight: '1.5' }}>
                Taught Elena R. 1-hour Figma basics. Earned +20 SkillCoins. Received an excellent 5-star rating!
              </p>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginTop: '1rem' }}>TX: #05D71C - Wallet Balance: 100 SC</span>
            </div>
          </div>

          {/* Timeline Item 4 */}
          <div className="timeline-item">
            <div className="timeline-node" style={{ borderColor: '#00ff95', boxShadow: '0 0 12px #00ff95' }} />
            <div className="timeline-content-box">
              <span className="section-label" style={{ color: '#00ff95' }}>System Reward</span>
              <h4 style={{ fontSize: '1.2rem', margin: '0.5rem 0', fontFamily: 'var(--font-heading)' }}>Trust Level Level-up</h4>
              <p style={{ color: '#9ca3af', fontSize: '0.88rem', lineHeight: '1.5' }}>
                Earned +10 SkillCoins bonus for maintaining a 5-star review average. Trust rating upgraded to Expert Level!
              </p>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginTop: '1rem' }}>TX: #07C922 - Wallet Balance: 110 SC</span>
            </div>
          </div>
        </div>
      </section>

      {/* Skill Categories */}
      <section className="landing-section">
        <div className="section-header-centered">
          <span className="section-label">Academic Disciplines</span>
          <h2 className="section-title-large">Interactive Skill Domains</h2>
          <p className="section-desc-light">
            Scroll or hover over these primary category channels to see our high-fidelity illustrative nodes.
          </p>
        </div>

        <div className="categories-grid">
          {/* Programming */}
          <div className="category-card">
            <div className="category-svg-container">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="20" width="80" height="50" rx="4" stroke="#00f5ff" strokeWidth="3" fill="rgba(0,245,255,0.05)"/>
                <path d="M5 70H95" stroke="#00f5ff" strokeWidth="4"/>
                <path d="M40 70L35 80H65L60 70" stroke="#00f5ff" strokeWidth="3"/>
                <path d="M20 32L30 40L20 48" stroke="#00f5ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M35 48H55" stroke="#00ff95" strokeWidth="3" strokeLinecap="round"/>
                <circle cx="50" cy="80" r="1.5" fill="#00f5ff"/>
              </svg>
            </div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Programming</h4>
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>React, Node, Python, HTML</span>
          </div>

          {/* AI */}
          <div className="category-card">
            <div className="category-svg-container">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="22" stroke="#8a2be2" strokeWidth="3" fill="rgba(138,43,226,0.05)"/>
                <circle cx="50" cy="50" r="8" fill="#ffd600"/>
                <path d="M50 15V28M50 72V85M15 50H28M72 50H85" stroke="#8a2be2" strokeWidth="2" strokeDasharray="3 3"/>
                <path d="M25 25L35 35M65 65L75 75M25 75L35 65M65 35L75 25" stroke="#00f5ff" strokeWidth="2"/>
                <circle cx="50" cy="15" r="4" fill="#00f5ff"/>
                <circle cx="50" cy="85" r="4" fill="#ff0099"/>
                <circle cx="15" cy="50" r="4" fill="#ffd600"/>
                <circle cx="85" cy="50" r="4" fill="#00ff95"/>
              </svg>
            </div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>AI Models</h4>
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Gemini, Prompting, PyTorch</span>
          </div>

          {/* Design */}
          <div className="category-card">
            <div className="category-svg-container">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="30" stroke="#ff0099" strokeWidth="2" strokeDasharray="5 5"/>
                <path d="M25 50C25 36.1929 36.1929 25 50 25C63.8071 25 75 36.1929 75 50C75 63.8071 63.8071 75 50 75" stroke="#ff6b00" strokeWidth="3"/>
                <rect x="42" y="42" width="16" height="16" rx="3" fill="#ff0099" transform="rotate(45 50 50)"/>
                <path d="M30 30L45 45M70 30L55 45" stroke="#ffd600" strokeWidth="2"/>
                <circle cx="30" cy="30" r="3" fill="#ff6b00"/>
                <circle cx="70" cy="30" r="3" fill="#ff6b00"/>
              </svg>
            </div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Design UI</h4>
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Figma, Prototyping, Illustrator</span>
          </div>

          {/* Communication */}
          <div className="category-card">
            <div className="category-svg-container">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M25 35H75C77.7614 35 80 37.2386 80 40V60C80 62.7614 77.7614 65 75 65H40L25 75V65C22.2386 65 20 62.7614 20 60V40C20 37.2386 22.2386 35 25 35Z" stroke="#00ff95" strokeWidth="3" fill="rgba(0,255,149,0.05)"/>
                <circle cx="38" cy="50" r="3" fill="#00ff95"/>
                <circle cx="50" cy="50" r="3" fill="#00ff95"/>
                <circle cx="62" cy="50" r="3" fill="#00ff95"/>
                <path d="M60 25C68 25 78 30 78 40" stroke="#00f5ff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Communication</h4>
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Speaking, English, Spanish</span>
          </div>

          {/* Teamwork */}
          <div className="category-card">
            <div className="category-svg-container">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="18" stroke="#ffd600" strokeWidth="2"/>
                <circle cx="50" cy="24" r="7" fill="#ffd600"/>
                <circle cx="28" cy="62" r="7" fill="#00f5ff"/>
                <circle cx="72" cy="62" r="7" fill="#ff0099"/>
                <path d="M42 35L33 50M58 35L67 50M35 68H65" stroke="#fff" strokeWidth="2"/>
              </svg>
            </div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Teamwork</h4>
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Collaboration, Agile Scrum</span>
          </div>

          {/* Career Growth */}
          <div className="category-card">
            <div className="category-svg-container">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 85H85" stroke="#00f5ff" strokeWidth="3"/>
                <path d="M20 75L40 50L60 60L85 25" stroke="#ff6b00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M85 25H72M85 25V38" stroke="#ff6b00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="85" cy="25" r="4" fill="#ffd600"/>
                <circle cx="40" cy="50" r="3.5" fill="#00ff95"/>
                <circle cx="60" cy="60" r="3.5" fill="#8a2be2"/>
              </svg>
            </div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Career Growth</h4>
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Interviews, Resume, Pitching</span>
          </div>

          {/* Students Learning Illustration */}
          <div className="category-card">
            <div className="category-svg-container" style={{ color: '#00f5ff' }}>
              <GraduationCap size={48} strokeWidth={1.5} style={{ filter: 'drop-shadow(0 0 8px rgba(0, 245, 255, 0.4))' }} />
            </div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Peer Academics</h4>
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Math, Physics, Chemistry</span>
          </div>

          {/* Students Teaching Illustration */}
          <div className="category-card">
            <div className="category-svg-container" style={{ color: '#ffd600' }}>
              <Users size={48} strokeWidth={1.5} style={{ filter: 'drop-shadow(0 0 8px rgba(255, 214, 0, 0.4))' }} />
            </div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Leadership</h4>
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Mentorship, Group Swapping</span>
          </div>
        </div>
      </section>

      {/* SkillCoins Section */}
      <section className="landing-section">
        <div className="coin-showcase-container">
          <div className="coin-viewport">
            <div className="coin-shadow-floor" />
            <div className="floating-coin-mesh">
              <div className="coin-face">
                S
                <div className="coin-shine" />
              </div>
            </div>
          </div>

          <div>
            <span className="section-label">Platform Currency</span>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }} className="gradient-text-pink-orange">The SkillCoin Token Economy</h2>
            <p style={{ color: '#9ca3af', lineHeight: '1.6', fontSize: '1rem', marginBottom: '1.5rem' }}>
              To prevent parasitic users who consume learning without giving back, SkillSwap operates on a decentralized SkillCoin ledger. Users transact coins to unlock tutoring.
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: '#050814', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#ffd600' }}>Action</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#ffd600' }}>Token Reward</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>New User Signup</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', fontWeight: '700', color: '#00ff95' }}>+100 Coins</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>Teach a Session</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', fontWeight: '700', color: '#00ff95' }}>+20 Coins</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>Learn from a Peer</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', fontWeight: '700', color: '#ff0099' }}>-20 Coins</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>Get 5-Star Rating</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', fontWeight: '700', color: '#00ff95' }}>+10 Coins</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Trust Score Section */}
      <section className="landing-section">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <span className="section-label">Accountability Matrix</span>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }} className="gradient-text-yellow-green">Algorithmic Trust Scores</h2>
            <p style={{ color: '#9ca3af', lineHeight: '1.6', fontSize: '1rem', marginBottom: '1.5rem' }}>
              We enforce high education standards by checking session outcomes. Ratings adjustments are immediate:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ width: '1.25rem', height: '1.25rem', borderRadius: '50%', background: 'rgba(0, 255, 149, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00ff95', marginTop: '2px' }}><Check size={10} strokeWidth={3} /></div>
                <p style={{ fontSize: '0.92rem', color: '#9ca3af' }}><strong>Complete Profile Bonus:</strong> Get a one-time +10 Coins boost upon writing details bio.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ width: '1.25rem', height: '1.25rem', borderRadius: '50%', background: 'rgba(255, 0, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff0099', marginTop: '2px' }}><Check size={10} strokeWidth={3} /></div>
                <p style={{ fontSize: '0.92rem', color: '#9ca3af' }}><strong>Cancellation Penalty:</strong> Scheduled slots missed result in a -10 SkillCoin deduction.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ width: '1.25rem', height: '1.25rem', borderRadius: '50%', background: 'rgba(0, 245, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f5ff', marginTop: '2px' }}><Check size={10} strokeWidth={3} /></div>
                <p style={{ fontSize: '0.92rem', color: '#9ca3af' }}><strong>Consecutive Ratings Boost:</strong> Maintaining 4.8+ ratings flags you for automated home page recommendation features.</p>
              </div>
            </div>
          </div>

          <div className="trust-shield-wrapper">
            <div className="trust-shield-glow" />
            <div className="trust-gauge-circle">
              <svg className="gauge-svg">
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00ff95" />
                    <stop offset="100%" stopColor="#00f5ff" />
                  </linearGradient>
                </defs>
                <circle className="gauge-track" cx="90" cy="90" r="75" />
                <circle className="gauge-fill" cx="90" cy="90" r="75" />
              </svg>
              <div className="gauge-value">
                <span className="gauge-score">4.95</span>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>Trust Score</span>
                <div className="gauge-stars">
                  <Star size={10} fill="#00ff95" color="#00ff95" />
                  <Star size={10} fill="#00ff95" color="#00ff95" />
                  <Star size={10} fill="#00ff95" color="#00ff95" />
                  <Star size={10} fill="#00ff95" color="#00ff95" />
                  <Star size={10} fill="#00ff95" color="#00ff95" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Mentor */}
      <section id="ai-mentor" className="landing-section">
        <div className="section-header-centered">
          <span className="section-label">Google Gemini Integration</span>
          <h2 className="section-title-large">Integrated AI Mentor Coach</h2>
          <p className="section-desc-light">
            Test drive our active simulator below. Prompt the coach to map out educational steps or drafts.
          </p>
        </div>

        <div className="ai-coach-showcase">
          <div className="chat-mock-interface">
            <div className="chat-mock-header">
              <div className="chat-mock-avatar">
                <Sparkles size={14} fill="#fff" />
              </div>
              <div>
                <div className="chat-mock-title">AI Study Coach</div>
                <div style={{ fontSize: '0.7rem', color: '#00ff95', fontWeight: '600' }}>● ONLINE & RETRIEVING</div>
              </div>
            </div>

            <div className="chat-mock-messages">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`chat-msg ${msg.sender === 'user' ? 'chat-msg-user' : 'chat-msg-ai'}`}>
                  {msg.text.split('\n').map((line, idx) => (
                    <span key={idx} style={{ display: 'block', minHeight: line === '' ? '0.75rem' : 'auto' }}>{line}</span>
                  ))}
                </div>
              ))}
              {isAiTyping && (
                <div className="chat-msg chat-msg-ai" style={{ width: '4rem', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                  <span style={{ animation: 'twinkle 1s infinite alternate' }}>•</span>
                  <span style={{ animation: 'twinkle 1s infinite alternate 0.3s' }}>•</span>
                  <span style={{ animation: 'twinkle 1s infinite alternate 0.6s' }}>•</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            <form onSubmit={handleSendMessage} className="chat-mock-input-row">
              <input 
                type="text" 
                className="chat-mock-input" 
                placeholder="Try: React setup, AI models roadmap, Prototyping..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isAiTyping}
              />
              <button type="submit" className="chat-mock-btn" disabled={isAiTyping}>
                <Send size={14} />
              </button>
            </form>
          </div>

          <div>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }} className="gradient-text-cyan-blue">Interactive Roadmap Generation</h3>
            <p style={{ color: '#9ca3af', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Whenever you enter a request inside the marketplace, Google Gemini automatically parses the teacher's profile bio and reviews, helping you draft customizable proposals. 
            </p>
            <div style={{ background: '#050814', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
              <h5 style={{ fontFamily: 'var(--font-heading)', color: '#00f5ff', fontSize: '1rem', marginBottom: '0.75rem' }}>Sample AI Pitch Generator</h5>
              <div style={{ background: '#03050c', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', color: '#9ca3af', lineHeight: '1.5' }}>
                "Hello Clara! I noticed you teach neural networks. I am preparing a research paper and have 80 SkillCoins. Could we swap a 1-hour session? I can teach you Figma design in return."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section id="leaderboard" className="landing-section">
        <div className="section-header-centered">
          <span className="section-label">Top Ranked Swappers</span>
          <h2 className="section-title-large">SkillSwap AI Leaderboard</h2>
          <p className="section-desc-light">
            Meet our top contributing teachers. Ranks are determined by level, active coins, and rating.
          </p>
        </div>

        <div className="leaderboard-preview-container">
          <div className="leaderboard-header-row">
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem' }} className="gradient-text-rainbow">Weekly Top Scholars</h3>
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>UPDATES REALTIME</span>
          </div>

          {/* Podium */}
          <div className="leaderboard-podium">
            {/* Rank 2 */}
            <div className="podium-card podium-card-2">
              <span className="podium-rank-badge rank-silver">2</span>
              <div className="podium-avatar podium-avatar-2">M</div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Marcus G.</div>
              <div style={{ fontSize: '0.75rem', color: '#00f5ff', marginTop: '0.25rem', fontWeight: '600' }}>LEVEL 8</div>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.5rem' }}>380 SC • 4.9★</div>
            </div>

            {/* Rank 1 */}
            <div className="podium-card podium-card-1">
              <span className="podium-rank-badge rank-gold">1</span>
              <div className="podium-avatar podium-avatar-1">S</div>
              <div style={{ fontWeight: '800', fontSize: '1rem' }}>Sarah K.</div>
              <div style={{ fontSize: '0.75rem', color: '#ffd600', marginTop: '0.25rem', fontWeight: '700' }}>LEVEL 12</div>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.5rem' }}>520 SC • 5.0★</div>
            </div>

            {/* Rank 3 */}
            <div className="podium-card podium-card-3">
              <span className="podium-rank-badge rank-bronze">3</span>
              <div className="podium-avatar podium-avatar-3">E</div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Elena R.</div>
              <div style={{ fontSize: '0.75rem', color: '#ff6b00', marginTop: '0.25rem', fontWeight: '600' }}>LEVEL 6</div>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.5rem' }}>260 SC • 4.8★</div>
            </div>
          </div>

          {/* Table List rows */}
          <div className="leaderboard-list">
            <div className="leaderboard-list-row">
              <div className="leaderboard-row-left">
                <span className="row-index">4</span>
                <div className="row-user-details">
                  <div className="row-avatar">A</div>
                  <span className="row-name">Alex M.</span>
                  <span className="row-level">Lvl 5</span>
                </div>
              </div>
              <div className="leaderboard-row-right">
                <div className="row-stat" style={{ color: '#ffd600' }}><Coins size={14} /> 210 SC</div>
                <div className="row-stat" style={{ color: '#00ff95' }}><Star size={14} fill="#00ff95" /> 4.85</div>
              </div>
            </div>

            <div className="leaderboard-list-row">
              <div className="leaderboard-row-left">
                <span className="row-index">5</span>
                <div className="row-user-details">
                  <div className="row-avatar">K</div>
                  <span className="row-name">Kenji S.</span>
                  <span className="row-level">Lvl 4</span>
                </div>
              </div>
              <div className="leaderboard-row-right">
                <div className="row-stat" style={{ color: '#ffd600' }}><Coins size={14} /> 190 SC</div>
                <div className="row-stat" style={{ color: '#00ff95' }}><Star size={14} fill="#00ff95" /> 4.80</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Success Statistics */}
      <section ref={statsSectionRef} className="landing-section">
        <div className="section-header-centered">
          <span className="section-label">Realtime Verification metrics</span>
          <h2 className="section-title-large">Global Community Statistics</h2>
        </div>

        <div className="stats-container-grid">
          <div className="stat-glow-box">
            <span className="stat-big-number gradient-text-cyan-blue">
              {stats.swaps.toLocaleString()}+
            </span>
            <span className="stat-desc">Sessions Exchanged</span>
          </div>

          <div className="stat-glow-box">
            <span className="stat-big-number gradient-text-yellow-green">
              {stats.rating}★
            </span>
            <span className="stat-desc">Avg Teacher Rating</span>
          </div>

          <div className="stat-glow-box">
            <span className="stat-big-number gradient-text-pink-orange">
              {stats.coins.toLocaleString()}
            </span>
            <span className="stat-desc">SkillCoins Transacted</span>
          </div>

          <div className="stat-glow-box">
            <span className="stat-big-number" style={{ background: 'linear-gradient(135deg, #00ff95, #ffd600)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {stats.students}+
            </span>
            <span className="stat-desc">Active Swappers</span>
          </div>
        </div>
      </section>

      {/* Interactive Student Showcase */}
      <section className="landing-section">
        <div className="section-header-centered">
          <span className="section-label">Community Profiles</span>
          <h2 className="section-title-large">Interactive Student Showcase</h2>
          <p className="section-desc-light">
            Filter profiles to view their primary skill matches. Click cards to inspect active bio quotes.
          </p>
        </div>

        <div className="showcase-tab-menu">
          <button 
            className={`tab-menu-item ${showcaseTab === 'all' ? 'tab-menu-item-active' : ''}`}
            onClick={() => setShowcaseTab('all')}
          >
            All Swappers
          </button>
          <button 
            className={`tab-menu-item ${showcaseTab === 'tech' ? 'tab-menu-item-active' : ''}`}
            onClick={() => setShowcaseTab('tech')}
          >
            Tech & Coding
          </button>
          <button 
            className={`tab-menu-item ${showcaseTab === 'design' ? 'tab-menu-item-active' : ''}`}
            onClick={() => setShowcaseTab('design')}
          >
            UI Design
          </button>
          <button 
            className={`tab-menu-item ${showcaseTab === 'growth' ? 'tab-menu-item-active' : ''}`}
            onClick={() => setShowcaseTab('growth')}
          >
            Business & Growth
          </button>
        </div>

        {/* Tab Cards */}
        <div className="student-showcase-panel">
          {filteredStudents.map((student, i) => (
            <div key={i} className="student-showcase-card">
              <div className="student-meta-top">
                <div className="student-meta-info">
                  <div className="student-pic">{student.name.charAt(0)}</div>
                  <div>
                    <h4 className="student-fullname">{student.name}</h4>
                    <span className="student-badge-role">{student.role}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', color: '#ffd600', gap: '0.25rem', fontSize: '0.9rem', fontWeight: '700' }}>
                  <Star size={14} fill="#ffd600" /> 5.0
                </div>
              </div>

              <p className="student-bio-quote">"{student.quote}"</p>

              <div className="student-skills-pills">
                <span className="skill-pill skill-pill-teach">Teaches: {student.teach.join(', ')}</span>
                <span className="skill-pill skill-pill-learn">Wants: {student.learn.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof (Testimonials Carousel) */}
      <section className="landing-section" style={{ maxWidth: '100%', paddingLeft: 0, paddingRight: 0 }}>
        <div className="section-header-centered" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
          <span className="section-label">Verified Peer Feedback</span>
          <h2 className="section-title-large">Social Proof Reviews</h2>
          <p className="section-desc-light">
            Here is what active learners say about video quality and SkillCoin transactions.
          </p>
        </div>

        <div className="carousel-wrapper">
          <div className="carousel-marquee">
            {/* Slide block duplicate for loop effect */}
            {[1, 2].map((loopIdx) => (
              <React.Fragment key={loopIdx}>
                <div className="testimonial-card-premium">
                  <div className="testimonial-rating-row">
                    <Star size={14} fill="#ffd600" color="#ffd600" />
                    <Star size={14} fill="#ffd600" color="#ffd600" />
                    <Star size={14} fill="#ffd600" color="#ffd600" />
                    <Star size={14} fill="#ffd600" color="#ffd600" />
                    <Star size={14} fill="#ffd600" color="#ffd600" />
                  </div>
                  <p className="testimonial-text">
                    "I was skeptical about swap quality, but the trust rankings are accurate. I learned custom hooks from Marcus in under an hour!"
                  </p>
                  <div className="testimonial-author">
                    <div className="author-pic" style={{ borderColor: '#00f5ff', color: '#00f5ff' }}>J</div>
                    <div>
                      <div className="author-name">Jonah L.</div>
                      <div className="author-title">Computer Science Sophomore</div>
                    </div>
                  </div>
                </div>

                <div className="testimonial-card-premium">
                  <div className="testimonial-rating-row">
                    <Star size={14} fill="#ffd600" color="#ffd600" />
                    <Star size={14} fill="#ffd600" color="#ffd600" />
                    <Star size={14} fill="#ffd600" color="#ffd600" />
                    <Star size={14} fill="#ffd600" color="#ffd600" />
                    <Star size={14} fill="#ffd600" color="#ffd600" />
                  </div>
                  <p className="testimonial-text">
                    "SkillSwap AI completely replaced standard private tutors. I earned +40 coins teaching UI Design and used them to learn data structure algorithms."
                  </p>
                  <div className="testimonial-author">
                    <div className="author-pic" style={{ borderColor: '#ff0099', color: '#ff0099' }}>A</div>
                    <div>
                      <div className="author-name">Amara O.</div>
                      <div className="author-title">Lead Product Designer</div>
                    </div>
                  </div>
                </div>

                <div className="testimonial-card-premium">
                  <div className="testimonial-rating-row">
                    <Star size={14} fill="#ffd600" color="#ffd600" />
                    <Star size={14} fill="#ffd600" color="#ffd600" />
                    <Star size={14} fill="#ffd600" color="#ffd600" />
                    <Star size={14} fill="#ffd600" color="#ffd600" />
                    <Star size={14} fill="#ffd600" color="#ffd600" />
                  </div>
                  <p className="testimonial-text">
                    "The Gemini roadmap parsed exactly what skills I needed to complete. High fidelity classroom audio, built-in timeline ledger."
                  </p>
                  <div className="testimonial-author">
                    <div className="author-pic" style={{ borderColor: '#00ff95', color: '#00ff95' }}>R</div>
                    <div>
                      <div className="author-name">Robert H.</div>
                      <div className="author-title">Agile Scrum Manager</div>
                    </div>
                  </div>
                </div>

                <div className="testimonial-card-premium">
                  <div className="testimonial-rating-row">
                    <Star size={14} fill="#ffd600" color="#ffd600" />
                    <Star size={14} fill="#ffd600" color="#ffd600" />
                    <Star size={14} fill="#ffd600" color="#ffd600" />
                    <Star size={14} fill="#ffd600" color="#ffd600" />
                    <Star size={14} fill="#ffd600" color="#ffd600" />
                  </div>
                  <p className="testimonial-text">
                    "Awesome community matching features! Earned coins to study biology from pre-med students by teaching resume pitch tricks."
                  </p>
                  <div className="testimonial-author">
                    <div className="author-pic" style={{ borderColor: '#ffd600', color: '#ffd600' }}>T</div>
                    <div>
                      <div className="author-name">Teresa F.</div>
                      <div className="author-title">Marketing Lead</div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="landing-section">
        <div className="section-header-centered">
          <span className="section-label">General Help Database</span>
          <h2 className="section-title-large">Frequently Asked Questions</h2>
        </div>

        <div className="faq-accordion-list">
          {[
            { q: "Is SkillSwap AI completely free to use?", a: "Yes! There are no monetary transaction charges. The system functions entirely on peer-to-peer SkillCoin balances. You start with 100 free SkillCoins which lets you book 5 hours of learning. When you teach a skill, you earn +20 coins back." },
            { q: "How does Google Gemini AI assist me?", a: "Whenever you list a new subject you want to learn, Gemini parses the topic and generates a structured, multi-phase progressive study roadmap. Additionally, when you find a tutor, Gemini helps you draft a customized request message based on your profile skills." },
            { q: "What happens if a user cancels a scheduled session?", a: "To protect student time commitments, scheduled sessions cancelled under 12 hours result in an automatic -10 SkillCoin penalty deducted from the cancellation party's wallet." },
            { q: "How is the Trust Score calculated?", a: "The Trust Score is a rolling average of reviews, completion rates, and feedback. Maintaining consecutive 5-star ratings boosts your visibility rank on our public leaderboard." }
          ].map((faq, i) => (
            <div key={i} className={`faq-accordion-item ${activeFaq === i ? 'faq-accordion-item-active' : ''}`}>
              <button 
                className="faq-trigger-btn"
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
              >
                <span>{faq.q}</span>
                <ChevronDown size={18} className={`faq-icon-arrow ${activeFaq === i ? 'faq-icon-arrow-open' : ''}`} />
              </button>
              
              <AnimatePresence>
                {activeFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="faq-body-content" style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="landing-section">
        <div className="cta-rainbow-banner">
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: '900', marginBottom: '1.25rem', color: '#fff' }}>
            Ready to trade intelligence?
          </h2>
          <p style={{ color: '#d1d5db', maxWidth: '650px', margin: '0 auto 2.5rem auto', fontSize: '1.1rem', lineHeight: '1.6' }}>
            Join thousands of active students trading technical, creative, and academic skills. Build a verified transcript, earn coins, and learn for free.
          </p>
          <button className="btn-rainbow-glow" style={{ margin: '0 auto' }} onClick={() => navigate('/auth')}>
            Register & Claim 100 Coins <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="footer-premium-box">
        <div className="footer-glowing-divider" />
        
        <div className="footer-grid-cols">
          <div className="footer-col-about">
            <div className="landing-nav-logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ cursor: 'pointer' }}>
              <div className="landing-nav-logo-icon">S</div>
              <span className="landing-nav-logo-text">SkillSwap AI</span>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '0.88rem', lineHeight: '1.6' }}>
              Futuristic peer-to-peer knowledge ledger. Teach, learn, and build trusted academic profiles without financial barriers.
            </p>
            <div className="footer-social-icons">
              <a href="#" className="social-icon-btn"><Terminal size={16} /></a>
              <a href="#" className="social-icon-btn"><Cpu size={16} /></a>
              <a href="#" className="social-icon-btn"><Palette size={16} /></a>
              <a href="#" className="social-icon-btn"><TrendingUp size={16} /></a>
            </div>
          </div>

          <div className="footer-col-links">
            <h4>Quick Links</h4>
            <ul className="footer-links-list">
              <li className="footer-link-item"><span onClick={() => handleScrollToSection('about')} style={{ cursor: 'pointer' }}>About Hub</span></li>
              <li className="footer-link-item"><span onClick={() => handleScrollToSection('features')} style={{ cursor: 'pointer' }}>Platform Features</span></li>
              <li className="footer-link-item"><span onClick={() => handleScrollToSection('timeline')} style={{ cursor: 'pointer' }}>Verifiable Timeline</span></li>
              <li className="footer-link-item"><span onClick={() => navigate('/auth')} style={{ cursor: 'pointer' }}>Login Portal</span></li>
            </ul>
          </div>

          <div className="footer-col-links">
            <h4>Contact Core</h4>
            <ul className="footer-links-list">
              <li className="footer-link-item" style={{ color: '#9ca3af', fontSize: '0.92rem' }}>support@skillswap.ai</li>
              <li className="footer-link-item" style={{ color: '#9ca3af', fontSize: '0.92rem' }}>developers@skillswap.ai</li>
              <li className="footer-link-item" style={{ color: '#9ca3af', fontSize: '0.92rem' }}>Security smart contracts audit</li>
              <li className="footer-link-item" style={{ color: '#9ca3af', fontSize: '0.92rem' }}>Academic partnership program</li>
            </ul>
          </div>

          <div className="footer-col-newsletter">
            <h4>Newsletter Channel</h4>
            <p className="footer-news-desc">Subscribe to get beta launch features and community stats updates.</p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed to Newsletter!'); e.target.reset(); }} className="footer-news-form">
              <input type="email" placeholder="space-coder@domain.com" required className="footer-news-input" />
              <button type="submit" className="footer-news-btn">JOIN</button>
            </form>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <span>&copy; {new Date().getFullYear()} SkillSwap AI community hub. All rights reserved on-ledger.</span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#" style={{ color: '#6b7280', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: '#6b7280', textDecoration: 'none' }}>Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
