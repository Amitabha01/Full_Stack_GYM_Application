import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaDumbbell, FaCalendarCheck, FaFire, FaUsers, FaTrophy } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [workoutStats, setWorkoutStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const requests = [
        axios.get('/api/workouts?limit=5'),
        axios.get('/api/bookings')
      ];

      // Only fetch workout stats if the endpoint exists
      try {
        const statsRes = await axios.get('/api/workouts/stats');
        setWorkoutStats(statsRes.data.data);
      } catch (err) {
        console.log('Workout stats not available yet');
        setWorkoutStats({
          totalWorkouts: 0,
          overall: { totalDuration: 0, totalCalories: 0 }
        });
      }

      const [workoutsRes, bookingsRes] = await Promise.all(requests);

      setRecentWorkouts(workoutsRes.data.data.workouts || []);
      setBookings(bookingsRes.data.data.bookings || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      // Set default values instead of showing error
      setWorkoutStats({
        totalWorkouts: 0,
        overall: { totalDuration: 0, totalCalories: 0 }
      });
      setRecentWorkouts([]);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg spinner-primary"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header fade-in">
          <div>
            <h1>Welcome back, {user?.name}! �</h1>
            <p>Here's your fitness journey overview</p>
          </div>
        </div>

        <div className="stats-grid fade-in">
          <div className="stat-card">
            <div className="stat-icon stat-icon-primary">
              <FaDumbbell />
            </div>
            <div className="stat-content">
              <div className="stat-value">{workoutStats?.totalWorkouts || 0}</div>
              <div className="stat-label">Total Workouts</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-warning">
              <FaCalendarCheck />
            </div>
            <div className="stat-content">
              <div className="stat-value">{bookings.length || 0}</div>
              <div className="stat-label">Class Bookings</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-info">
              <FaFire />
            </div>
            <div className="stat-content">
              <div className="stat-value">{Math.round(workoutStats?.overall?.totalCalories || 0)}</div>
              <div className="stat-label">Calories Burned</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-success">
              <FaTrophy />
            </div>
            <div className="stat-content">
              <div className="stat-value">{Math.round(workoutStats?.overall?.totalDuration || 0)}</div>
              <div className="stat-label">Minutes Trained</div>
            </div>
          </div>
        </div>

        <div className="dashboard-content fade-in">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Upcoming Classes</h2>
            </div>
            <div className="card-body">
              {bookings.length === 0 ? (
                <div className="empty-state">
                  <FaCalendarCheck />
                  <p>No upcoming classes. Book your first class!</p>
                </div>
              ) : (
                <div className="task-list">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking._id} className="task-item">
                      <div className="task-info">
                        <h3>{booking.classId?.name || 'Class'}</h3>
                        <p>{new Date(booking.bookingDate).toLocaleDateString()}</p>
                      </div>
                      <div className="task-meta">
                        <span className={`badge badge-${
                          booking.status === 'confirmed' ? 'success' :
                          booking.status === 'cancelled' ? 'danger' : 'warning'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Workouts</h2>
            </div>
            <div className="card-body">
              {recentWorkouts.length === 0 ? (
                <div className="empty-state">
                  <FaDumbbell />
                  <p>No workouts logged yet. Start tracking your progress!</p>
                </div>
              ) : (
                <div className="task-list">
                  {recentWorkouts.map((workout) => (
                    <div key={workout._id} className="task-item">
                      <div className="task-info">
                        <h3>{workout.title}</h3>
                        <p>{workout.duration} min • {workout.totalCalories} cal</p>
                      </div>
                      <div className="task-meta">
                        <span className={`badge badge-${
                          workout.type === 'strength' ? 'danger' :
                          workout.type === 'cardio' ? 'info' : 'success'
                        }`}>
                          {workout.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
