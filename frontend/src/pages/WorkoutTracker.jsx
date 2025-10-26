import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPlus, FaDumbbell, FaFire, FaClock, FaTrash, FaEdit } from 'react-icons/fa';
import './WorkoutTracker.css';

const WorkoutTracker = () => {
  const [workouts, setWorkouts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'strength',
    duration: '',
    totalCalories: '',
    feeling: 'good',
    notes: ''
  });

  useEffect(() => {
    fetchWorkouts();
    fetchStats();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const response = await axios.get('/api/workouts');
      setWorkouts(response.data.data.workouts);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      toast.error('Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/workouts/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post('/api/workouts', formData);
      toast.success('Workout logged successfully!');
      setShowModal(false);
      resetForm();
      fetchWorkouts();
      fetchStats();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to log workout';
      toast.error(message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workout?')) return;

    try {
      await axios.delete(`/api/workouts/${id}`);
      toast.success('Workout deleted successfully');
      fetchWorkouts();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete workout');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'strength',
      duration: '',
      totalCalories: '',
      feeling: 'good',
      notes: ''
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg spinner-primary"></div>
        <p>Loading workouts...</p>
      </div>
    );
  }

  return (
    <div className="workout-tracker-page">
      <div className="container">
        <div className="page-top">
          <h1>Workout Tracker</h1>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FaPlus /> Log Workout
          </button>
        </div>

        {stats && (
          <div className="workout-stats fade-in">
            <div className="stat-box">
              <div className="stat-icon">
                <FaDumbbell />
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.totalWorkouts || 0}</div>
                <div className="stat-label">Total Workouts</div>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon">
                <FaClock />
              </div>
              <div className="stat-info">
                <div className="stat-value">{Math.round(stats.overall?.totalDuration || 0)}</div>
                <div className="stat-label">Total Minutes</div>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon">
                <FaFire />
              </div>
              <div className="stat-info">
                <div className="stat-value">{Math.round(stats.overall?.totalCalories || 0)}</div>
                <div className="stat-label">Calories Burned</div>
              </div>
            </div>
          </div>
        )}

        <div className="workouts-list fade-in">
          <h2>Recent Workouts</h2>
          {workouts.length === 0 ? (
            <div className="empty-state">
              <FaDumbbell />
              <p>No workouts logged yet. Start tracking your fitness journey!</p>
            </div>
          ) : (
            <div className="workout-items">
              {workouts.map((workout) => (
                <div key={workout._id} className="workout-item">
                  <div className="workout-header">
                    <h3>{workout.title}</h3>
                    <div className="workout-actions">
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(workout._id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <div className="workout-details">
                    <span className={`workout-type type-${workout.type}`}>
                      {workout.type}
                    </span>
                    <span><FaClock /> {workout.duration} min</span>
                    <span><FaFire /> {workout.totalCalories} cal</span>
                    <span>{new Date(workout.date).toLocaleDateString()}</span>
                  </div>

                  {workout.notes && (
                    <p className="workout-notes">{workout.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Log Workout Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Log Workout</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Workout Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select
                      className="form-control"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="strength">Strength</option>
                      <option value="cardio">Cardio</option>
                      <option value="flexibility">Flexibility</option>
                      <option value="sports">Sports</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Duration (min) *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Calories</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.totalCalories}
                      onChange={(e) => setFormData({ ...formData, totalCalories: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">How did you feel?</label>
                    <select
                      className="form-control"
                      value={formData.feeling}
                      onChange={(e) => setFormData({ ...formData, feeling: e.target.value })}
                    >
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="average">Average</option>
                      <option value="tired">Tired</option>
                      <option value="exhausted">Exhausted</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows="3"
                  />
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Log Workout
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutTracker;
