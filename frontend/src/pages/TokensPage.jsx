import React, { useState, useEffect } from 'react';
import { Coins, ArrowUpRight, ArrowDownLeft, Info, Sparkles, HelpCircle } from 'lucide-react';

const TokensPage = ({ user }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchLedgerData();
  }, [user]);

  const fetchLedgerData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_URL}/sessions/my-sessions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const sessions = await res.json();
        
        // Build dynamic ledger based on completed sessions
        const ledgerList = [];

        // 1. Filter out completed sessions
        const completedSessions = sessions.filter(s => s.status === 'completed');
        completedSessions.forEach(session => {
          const isTeacher = session.teacher?._id === user?._id || session.teacher === user?._id;
          const partnerName = isTeacher 
            ? (session.learner?.name || 'Partner') 
            : (session.teacher?.name || 'Tutor');

          if (isTeacher) {
            // Earned coins for teaching
            ledgerList.push({
              id: session._id,
              type: 'earn',
              title: `Taught "${session.skill}"`,
              subtitle: `Session with ${partnerName}`,
              amount: 20,
              date: new Date(session.updatedAt || session.createdAt).toLocaleDateString()
            });

            // Check if first swap bonus applies (we mock this or check if they received it)
            // If they have only completed 1 session and this is it, show first swap bonus
            if (completedSessions.length === 1 || session.logs?.teacherFirstSwapBonus) {
              ledgerList.push({
                id: `${session._id}-bonus`,
                type: 'earn',
                title: 'First Successful Swap Bonus',
                subtitle: 'Gained for teaching your first skill swap',
                amount: 20,
                date: new Date(session.updatedAt || session.createdAt).toLocaleDateString()
              });
            }
          } else {
            // Spent coins for learning
            ledgerList.push({
              id: session._id,
              type: 'spend',
              title: `Learned "${session.skill}"`,
              subtitle: `Session with ${partnerName}`,
              amount: 20,
              date: new Date(session.updatedAt || session.createdAt).toLocaleDateString()
            });

            if (completedSessions.length === 1 || session.logs?.learnerFirstSwapBonus) {
              ledgerList.push({
                id: `${session._id}-bonus`,
                type: 'earn',
                title: 'First Successful Swap Bonus',
                subtitle: 'Gained for learning your first skill swap',
                amount: 20,
                date: new Date(session.updatedAt || session.createdAt).toLocaleDateString()
              });
            }
          }
        });

        // 2. Add Profile Completion reward if true
        if (user?.profileCompletedReward) {
          ledgerList.push({
            id: 'profile-reward',
            type: 'earn',
            title: 'Complete Profile Reward',
            subtitle: 'Added bio, experience, and interests',
            amount: 10,
            date: new Date(user.updatedAt || user.createdAt).toLocaleDateString()
          });
        }

        // 3. Add Signup bonus (every user gets it)
        ledgerList.push({
          id: 'signup-bonus',
          type: 'earn',
          title: 'Welcome Gift',
          subtitle: 'Sign up signup bonus',
          amount: 100,
          date: new Date(user?.createdAt || Date.now()).toLocaleDateString()
        });

        // Sort by date (mock id/order is fine too, but we will present them order-wise)
        setTransactions(ledgerList);
      }
    } catch (error) {
      console.error('Error fetching token ledger:', error);
    } finally {
      setLoading(false);
    }
  };

  const cheatSheetRules = [
    { action: 'New User Signup', change: '+100 SkillCoins', desc: 'Gifted on successful signup to get you started' },
    { action: 'Complete Profile', change: '+10 SkillCoins', desc: 'Gifted when adding bio, experience, and interests' },
    { action: 'Teach a Skill', change: '+20 SkillCoins', desc: 'Earned by the teacher upon session completion' },
    { action: 'Learn a Skill', change: '-20 SkillCoins', desc: 'Cost deducted from learner upon session completion' },
    { action: 'First Swap Bonus', change: '+20 SkillCoins', desc: 'One-time bonus on your first completed session' },
    { action: 'Excellent Review', change: '+10 SkillCoins', desc: 'Earned when you receive a 5-star session rating' },
    { action: 'Cancellation Penalty', change: '-10 SkillCoins', desc: 'Deducted if a scheduled session is cancelled' }
  ];

  return (
    <div className="content-body">
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Coins size={24} color="var(--currency-amber)" fill="var(--currency-amber)" /> SkillCoin Wallet
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Manage your learning tokens, check transaction history, and see how the economy works
        </p>
      </div>

      <div className="room-split-container">
        {/* Left Pane: Current Balance & Ledger */}
        <div className="glass-panel room-left" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          {/* Current Balance Display Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(251, 191, 36, 0.05) 100%)',
            border: '1px solid var(--currency-amber-glow)',
            padding: '2rem 1.5rem',
            borderRadius: '16px',
            textAlign: 'center',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-premium)'
          }}>
            <div style={{ 
              width: '4rem', 
              height: '4rem', 
              backgroundColor: 'rgba(245, 158, 11, 0.2)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1rem auto',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)'
            }}>
              <Coins size={36} color="var(--currency-amber)" fill="var(--currency-amber)" />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available Balance</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0.25rem 0' }}>
              {user?.skillCoins || 0} <span style={{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--text-secondary)' }}>SkillCoins</span>
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              1 SkillCoin = 1 standard unit of peer-to-peer tutoring exchange
            </p>
          </div>

          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Transaction Ledger</h4>

          {/* Transactions List */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.25rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>
                Loading ledger records...
              </div>
            ) : transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                No recorded transactions yet.
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  transition: 'border-color 0.2s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '2.25rem',
                      height: '2.25rem',
                      borderRadius: '50%',
                      backgroundColor: tx.type === 'earn' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {tx.type === 'earn' 
                        ? <ArrowUpRight size={16} color="var(--success-color)" /> 
                        : <ArrowDownLeft size={16} color="var(--danger-color)" />
                      }
                    </div>
                    <div>
                      <h5 style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>{tx.title}</h5>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{tx.subtitle}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      color: tx.type === 'earn' ? 'var(--success-color)' : 'var(--danger-color)'
                    }}>
                      {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)' }}>{tx.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Pane: Economy Rules & Explanation */}
        <div className="glass-panel room-right" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
            <HelpCircle size={18} color="var(--accent-purple)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>How the Economy Works</h3>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              SkillSwap AI operates on a non-monetary token economy. We credit you with <strong>100 tokens</strong> on signup so you can instantly learn your first skills. Earn more tokens by teaching others what you do best!
            </p>

            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>SkillCoin Economy Sheet</h4>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                    <th style={{ padding: '0.5rem 0.25rem' }}>Action</th>
                    <th style={{ padding: '0.5rem 0.25rem' }}>Reward</th>
                    <th style={{ padding: '0.5rem 0.25rem' }}>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {cheatSheetRules.map((rule, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '0.75rem 0.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>{rule.action}</td>
                      <td style={{
                        padding: '0.75rem 0.25rem',
                        fontWeight: '700',
                        color: rule.change.startsWith('+') ? 'var(--success-color)' : 'var(--danger-color)'
                      }}>{rule.change}</td>
                      <td style={{ padding: '0.75rem 0.25rem', color: 'var(--text-secondary)' }}>{rule.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: '0.4rem', marginTop: '1rem' }}>
            <Info size={14} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <span>To earn tokens, make sure your skills are listed on your profile and explore requested skills on the Marketplace!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokensPage;
