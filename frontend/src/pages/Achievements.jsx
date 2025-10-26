import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTrophy, FaMedal, FaStar, FaLock } from 'react-icons/fa';
import './Achievements.css';

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [allAch, userAch] = await Promise.all([
        axios.get('/api/gamification/achievements', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/gamification/my-achievements', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setAchievements(allAch.data.data.achievements);
      setUserAchievements(userAch.data.data.achievements);
      setTotalPoints(userAch.data.totalPoints);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const isUnlocked = (achievementId) => {
    return userAchievements.some(ua => ua.achievement._id === achievementId);
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'bronze': return '#cd7f32';
      case 'silver': return '#c0c0c0';
      case 'gold': return '#ffd700';
      case 'platinum': return '#e5e4e2';
      default: return '#667eea';
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'platinum': return <FaStar />;
      case 'gold': return <FaTrophy />;
      case 'silver': return <FaMedal />;
      default: return <FaMedal />;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg spinner-primary"></div>
        <p>Loading achievements...</p>
      </div>
    );
  }

  return (
    <div className="achievements-page">
      <div className="container">
        <div className="achievements-header">
          <h1>🏆 Achievements</h1>
          <div className="achievements-stats">
            <div className="stat-box">
              <div className="stat-value">{userAchievements.length}</div>
              <div className="stat-label">Unlocked</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{achievements.length}</div>
              <div className="stat-label">Total</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{totalPoints}</div>
              <div className="stat-label">Points</div>
            </div>
          </div>
        </div>

        <div className="achievements-grid">
          {achievements.map((achievement) => {
            const unlocked = isUnlocked(achievement._id);
            return (
              <div
                key={achievement._id}
                className={`achievement-card ${unlocked ? 'unlocked' : 'locked'}`}
                style={{
                  borderColor: unlocked ? getTierColor(achievement.tier) : '#e0e0e0'
                }}
              >
                <div className="achievement-icon-container">
                  <div
                    className="achievement-icon"
                    style={{
                      background: unlocked
                        ? `linear-gradient(135deg, ${getTierColor(achievement.tier)}, #667eea)`
                        : '#f0f0f0'
                    }}
                  >
                    {unlocked ? achievement.icon : <FaLock />}
                  </div>
                  {unlocked && (
                    <div className="achievement-tier" style={{ color: getTierColor(achievement.tier) }}>
                      {getTierIcon(achievement.tier)}
                    </div>
                  )}
                </div>

                <div className="achievement-content">
                  <h3>{achievement.name}</h3>
                  <p>{achievement.description}</p>
                  <div className="achievement-meta">
                    <span className={`tier-badge tier-${achievement.tier}`}>
                      {achievement.tier}
                    </span>
                    <span className="points-badge">+{achievement.points} pts</span>
                  </div>
                </div>

                {unlocked && (
                  <div className="unlocked-banner">
                    ✓ Unlocked
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Achievements;
