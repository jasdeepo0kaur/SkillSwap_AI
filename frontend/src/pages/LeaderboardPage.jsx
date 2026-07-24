import React, { useState, useEffect } from 'react';
import { Award, Coins, Star, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import StarRating from '../components/StarRating';

const LeaderboardPage = ({ user }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_URL}/users/leaderboard`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      } else {
        // Mock fallback if api fails
        setLeaderboard([
          { name: 'Riya Patel', skillCoins: 480, trustScore: 4.9, reviewCount: 22 },
          { name: 'Aarav Sharma', skillCoins: 360, trustScore: 4.8, reviewCount: 15 },
          { name: 'Kabir Mehta', skillCoins: 310, trustScore: 4.7, reviewCount: 18 },
          { name: 'Ananya Goel', skillCoins: 240, trustScore: 4.9, reviewCount: 10 },
          { name: 'Dev Kushwaha', skillCoins: 180, trustScore: 4.6, reviewCount: 8 },
          { name: user?.name || 'Armaan K.', skillCoins: user?.skillCoins || 100, trustScore: user?.trustScore || 5.0, reviewCount: user?.reviewCount || 0, isSelf: true }
        ].sort((a, b) => b.skillCoins - a.skillCoins));
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy size={18} color="#f59e0b" fill="#f59e0b" />; // Gold
      case 2:
        return <Trophy size={18} color="#94a3b8" fill="#94a3b8" />; // Silver
      case 3:
        return <Trophy size={18} color="#b45309" fill="#b45309" />; // Bronze
      default:
        return <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>#{rank}</span>;
    }
  };

  // Find user's position
  const userRankIdx = leaderboard.findIndex(item => item.isSelf || (item.name === user?.name));
  const userRank = userRankIdx !== -1 ? userRankIdx + 1 : '10+';

  return (
    <div className="content-body" style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={24} color="var(--currency-amber)" /> Global Leaderboard
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            See who has accumulated the most SkillCoins and earned the highest trust ratings
          </p>
        </div>
        
        {/* Current user status card */}
        <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--accent-purple-glow)' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Your Rank</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-purple)' }}>#{userRank}</span>
          </div>
          <div style={{ height: '1.5rem', borderLeft: '1px solid var(--border-color)' }} />
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Your Tokens</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--currency-amber)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Coins size={14} fill="var(--currency-amber)" /> {user?.skillCoins || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Main Leaderboard Table Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem', boxShadow: 'var(--shadow-premium)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
            Loading rank leaderboards...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 0.5rem', width: '80px' }}>Rank</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Swapper</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Trust Rating</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Completed Reviews</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>SkillCoins Balance</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((item, idx) => {
                  const isCurrent = item.isSelf || (item.name === user?.name);
                  const rank = idx + 1;

                  return (
                    <tr 
                      key={idx} 
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.02)',
                        backgroundColor: isCurrent ? 'rgba(139,92,246,0.04)' : 'transparent',
                        fontWeight: isCurrent ? '600' : 'normal',
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      {/* Rank Column */}
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2rem', height: '2rem' }}>
                          {getRankBadge(rank)}
                        </div>
                      </td>

                      {/* Swapper Details Column */}
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '2rem',
                            height: '2rem',
                            borderRadius: '50%',
                            backgroundColor: isCurrent ? 'var(--accent-purple-dark)' : 'rgba(255,255,255,0.05)',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '0.85rem'
                          }}>
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span style={{ fontSize: '0.9rem', color: isCurrent ? 'var(--accent-purple)' : 'var(--text-primary)' }}>
                              {item.name} {isCurrent && '(You)'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Trust Rating Column */}
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Star size={13} fill="#eab308" color="#eab308" />
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{item.trustScore?.toFixed(1) || '5.0'}</span>
                        </div>
                      </td>

                      {/* Completed Reviews Column */}
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {item.reviewCount || 0} reviews
                      </td>

                      {/* Token Balance Column */}
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end', fontWeight: 'bold' }}>
                          <Coins size={14} fill="var(--currency-amber)" color="var(--currency-amber)" />
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{item.skillCoins}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
