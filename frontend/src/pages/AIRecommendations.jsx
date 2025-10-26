import { useState, useEffect } from 'react';
import { FaRobot, FaDumbbell, FaFire, FaStar, FaPlay } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AIRecommendations.css';

const AIRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchRecommendations();
    fetchExercises();
  }, [selectedCategory]);

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(
        '/api/ai/recommendations',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecommendations(data.data.recommendations);
    } catch (error) {
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const fetchExercises = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = selectedCategory !== 'all' ? `?category=${selectedCategory}` : '';
      const { data } = await axios.get(
        `/api/ai/exercises${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExercises(data.data.exercises);
    } catch (error) {
      console.error('Failed to load exercises');
    }
  };

  const handleSeedExercises = async () => {
    try {
      setSeeding(true);
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/ai/exercises/seed',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('✅ Exercise library seeded successfully!');
      fetchRecommendations();
      fetchExercises();
    } catch (error) {
      toast.error('Failed to seed exercises. You may need admin privileges.');
      console.error('Seed error:', error);
    } finally {
      setSeeding(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return '#666';
    }
  };

  if (loading) {
    return <div className="loading-container">Loading recommendations...</div>;
  }

  return (
    <div className="ai-recommendations-page">
      <div className="page-header">
        <h1><FaRobot /> AI Workout Recommendations</h1>
        <p>Personalized exercises based on your fitness level and goals</p>
        {exercises.length === 0 && (
          <button 
            className="seed-button" 
            onClick={handleSeedExercises}
            disabled={seeding}
          >
            {seeding ? 'Seeding...' : '🌱 Seed Exercise Library'}
          </button>
        )}
      </div>

      {/* AI Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="recommendations-section">
          <h2>🎯 Recommended For You</h2>
          <div className="recommendations-grid">
            {recommendations.map((rec, index) => (
              <div key={index} className="recommendation-card featured">
                <div className="recommendation-badge">
                  <FaStar /> Top Pick
                </div>
                <div className="score-badge">
                  Match: {Math.round(rec.score)}%
                </div>
                
                <h3>{rec.exercise.name}</h3>
                <p className="exercise-description">{rec.exercise.description}</p>
                
                <div className="exercise-details">
                  <span className="category">{rec.exercise.category}</span>
                  <span 
                    className="difficulty"
                    style={{ background: getDifficultyColor(rec.exercise.difficulty) }}
                  >
                    {rec.exercise.difficulty}
                  </span>
                </div>

                <div className="muscle-groups">
                  {rec.exercise.muscleGroups?.map((muscle, idx) => (
                    <span key={idx} className="muscle-tag">{muscle}</span>
                  ))}
                </div>

                <div className="recommendation-reason">
                  <FaRobot /> {rec.reason}
                </div>

                {rec.exercise.videoUrl && (
                  <button className="watch-video-btn">
                    <FaPlay /> Watch Tutorial
                  </button>
                )}

                <div className="exercise-stats">
                  <div>
                    <FaFire /> {rec.exercise.calories || 0} cal/rep
                  </div>
                  <div>
                    <FaDumbbell /> {rec.exercise.equipment?.join(', ') || 'Bodyweight'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exercise Library */}
      <div className="exercise-library-section">
        <h2>📚 Exercise Library</h2>
        
        <div className="category-filters">
          <button 
            className={selectedCategory === 'all' ? 'active' : ''}
            onClick={() => setSelectedCategory('all')}
          >
            All
          </button>
          <button 
            className={selectedCategory === 'cardio' ? 'active' : ''}
            onClick={() => setSelectedCategory('cardio')}
          >
            Cardio
          </button>
          <button 
            className={selectedCategory === 'strength' ? 'active' : ''}
            onClick={() => setSelectedCategory('strength')}
          >
            Strength
          </button>
          <button 
            className={selectedCategory === 'flexibility' ? 'active' : ''}
            onClick={() => setSelectedCategory('flexibility')}
          >
            Flexibility
          </button>
          <button 
            className={selectedCategory === 'balance' ? 'active' : ''}
            onClick={() => setSelectedCategory('balance')}
          >
            Balance
          </button>
        </div>

        {exercises.length === 0 ? (
          <div className="empty-state">
            <FaDumbbell size={50} color="#ccc" />
            <h3>No exercises found</h3>
            <p>Click the "Seed Exercise Library" button above to populate with sample exercises</p>
          </div>
        ) : (
          <div className="exercises-grid">
            {exercises.map((exercise) => (
            <div key={exercise._id} className="exercise-card">
              {exercise.thumbnailUrl && (
                <div className="exercise-thumbnail">
                  <img src={exercise.thumbnailUrl} alt={exercise.name} />
                </div>
              )}
              
              <div className="exercise-content">
                <h4>{exercise.name}</h4>
                <p>{exercise.description}</p>
                
                <div className="exercise-meta">
                  <span className="category">{exercise.category}</span>
                  <span 
                    className="difficulty"
                    style={{ background: getDifficultyColor(exercise.difficulty) }}
                  >
                    {exercise.difficulty}
                  </span>
                </div>

                {exercise.muscleGroups?.length > 0 && (
                  <div className="muscle-groups-small">
                    {exercise.muscleGroups.slice(0, 3).map((muscle, idx) => (
                      <span key={idx}>{muscle}</span>
                    ))}
                  </div>
                )}

                {exercise.instructions?.length > 0 && (
                  <div className="instructions-preview">
                    <strong>Instructions:</strong>
                    <ol>
                      {exercise.instructions.slice(0, 3).map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                <div className="exercise-footer">
                  <span><FaFire /> {exercise.calories || 0} cal</span>
                  {exercise.videoUrl && (
                    <button className="video-btn">
                      <FaPlay /> Video
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRecommendations;
