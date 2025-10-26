import { useState, useEffect } from 'react';
import { FaTrophy, FaFire, FaUsers, FaCalendar, FaMedal } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Challenges.css';

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
    fetchMyChallenges();
  }, [activeTab]);

  const fetchChallenges = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(
        `/api/challenges?status=${activeTab}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChallenges(data.data.challenges);
    } catch (error) {
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyChallenges = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(
        '/api/challenges/my-challenges',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMyChallenges(data.data.challenges);
    } catch (error) {
      console.error('Failed to load my challenges');
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `/api/challenges/${challengeId}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('🎉 Challenge joined successfully!');
      fetchChallenges();
      fetchMyChallenges();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join challenge');
    }
  };

  const getChallengeIcon = (category) => {
    switch(category) {
      case 'calories': return <FaFire />;
      case 'workouts': return <FaTrophy />;
      case 'duration': return <FaCalendar />;
      default: return <FaMedal />;
    }
  };

  const getProgressPercentage = (challenge) => {
    if (!challenge.userProgress) return 0;
    return Math.min((challenge.userProgress / challenge.goal.target) * 100, 100);
  };

  const isJoined = (challengeId) => {
    return myChallenges.some(c => c._id === challengeId);
  };

  if (loading) {
    return <div className="loading-container">Loading challenges...</div>;
  }

  return (
    <div className="challenges-page">
      <div className="challenges-header">
        <h1>🎯 Fitness Challenges</h1>
        <p>Join challenges, compete with others, and achieve your goals!</p>
      </div>

      <div className="tabs">
        <button 
          className={activeTab === 'active' ? 'active' : ''} 
          onClick={() => setActiveTab('active')}
        >
          Active
        </button>
        <button 
          className={activeTab === 'upcoming' ? 'active' : ''} 
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
        </button>
        <button 
          className={activeTab === 'completed' ? 'active' : ''} 
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
      </div>

      {myChallenges.length > 0 && (
        <div className="my-challenges-section">
          <h2>My Active Challenges</h2>
          <div className="challenges-grid">
            {myChallenges.map(challenge => (
              <div key={challenge._id} className="challenge-card my-challenge">
                <div className="challenge-badge">
                  {getChallengeIcon(challenge.category)}
                </div>
                <h3>{challenge.name}</h3>
                <p className="challenge-description">{challenge.description}</p>
                
                <div className="challenge-goal">
                  <span>Goal: {challenge.goal.target} {challenge.goal.unit}</span>
                  <span className="rank">Rank: #{challenge.userRank || '-'}</span>
                </div>

                <div className="progress-section">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${getProgressPercentage(challenge)}%` }}
                    />
                  </div>
                  <span className="progress-text">
                    {challenge.userProgress || 0} / {challenge.goal.target} {challenge.goal.unit}
                  </span>
                </div>

                <div className="challenge-dates">
                  <span>Ends: {new Date(challenge.endDate).toLocaleDateString()}</span>
                </div>

                {challenge.rewards?.points && (
                  <div className="reward-badge">
                    <FaTrophy /> {challenge.rewards.points} points
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="all-challenges-section">
        <h2>All Challenges</h2>
        <div className="challenges-grid">
          {challenges.length === 0 ? (
            <div className="no-challenges">
              <p>No {activeTab} challenges available</p>
            </div>
          ) : (
            challenges.map(challenge => (
              <div key={challenge._id} className="challenge-card">
                <div className="challenge-badge">
                  {getChallengeIcon(challenge.category)}
                </div>
                
                <div className="challenge-type">
                  {challenge.type === 'team' && <FaUsers />}
                  <span>{challenge.type}</span>
                </div>

                <h3>{challenge.name}</h3>
                <p className="challenge-description">{challenge.description}</p>
                
                <div className="challenge-goal">
                  <strong>Goal:</strong> {challenge.goal.target} {challenge.goal.unit}
                </div>

                <div className="challenge-participants">
                  <FaUsers /> {challenge.participants?.length || 0} participants
                  {challenge.maxParticipants && ` / ${challenge.maxParticipants}`}
                </div>

                <div className="challenge-dates">
                  <div>
                    <strong>Start:</strong> {new Date(challenge.startDate).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>End:</strong> {new Date(challenge.endDate).toLocaleDateString()}
                  </div>
                </div>

                {challenge.rewards?.points && (
                  <div className="reward-badge">
                    <FaTrophy /> {challenge.rewards.points} points
                  </div>
                )}

                {!isJoined(challenge._id) && activeTab === 'active' && (
                  <button 
                    className="btn-join"
                    onClick={() => handleJoinChallenge(challenge._id)}
                  >
                    Join Challenge
                  </button>
                )}

                {isJoined(challenge._id) && (
                  <button className="btn-joined" disabled>
                    ✓ Joined
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Challenges;
