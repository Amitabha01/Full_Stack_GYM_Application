import { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { FaFire, FaDumbbell, FaCalendar, FaTrophy, FaChartLine } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Analytics.css';

const COLORS = ['#667eea', '#764ba2', '#f59e0b', '#ef4444', '#10b981'];

const Analytics = () => {
  const [period, setPeriod] = useState('30');
  const [workoutData, setWorkoutData] = useState(null);
  const [classData, setClassData] = useState(null);
  const [records, setRecords] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [workouts, classes, personalRecords] = await Promise.all([
        axios.get(`/api/analytics/workouts?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`/api/analytics/classes?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/analytics/records', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setWorkoutData(workouts.data.data);
      setClassData(classes.data.data);
      setRecords(personalRecords.data.data.records);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading analytics...</div>;
  }

  const typeDistributionData = workoutData?.typeDistribution 
    ? Object.entries(workoutData.typeDistribution).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
      }))
    : [];

  const classTypeData = classData?.classTypes
    ? Object.entries(classData.classTypes).map(([name, value]) => ({
        name,
        classes: value
      }))
    : [];

  const attendanceData = classData?.attendanceByDay
    ? Object.entries(classData.attendanceByDay).map(([day, count]) => ({
        day: day.slice(0, 3),
        classes: count
      }))
    : [];

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>📊 Advanced Analytics</h1>
        <div className="period-selector">
          <button 
            className={period === '7' ? 'active' : ''} 
            onClick={() => setPeriod('7')}
          >
            7 Days
          </button>
          <button 
            className={period === '30' ? 'active' : ''} 
            onClick={() => setPeriod('30')}
          >
            30 Days
          </button>
          <button 
            className={period === '90' ? 'active' : ''} 
            onClick={() => setPeriod('90')}
          >
            90 Days
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="card-icon" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            <FaDumbbell />
          </div>
          <div className="card-content">
            <h3>{workoutData?.summary?.totalWorkouts || 0}</h3>
            <p>Total Workouts</p>
            <span className="sub-text">{workoutData?.summary?.avgWorkoutsPerWeek || 0}/week avg</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon" style={{background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'}}>
            <FaFire />
          </div>
          <div className="card-content">
            <h3>{workoutData?.summary?.totalCalories?.toLocaleString() || 0}</h3>
            <p>Calories Burned</p>
            <span className="sub-text">{Math.round(workoutData?.summary?.totalCalories / workoutData?.summary?.totalWorkouts) || 0}/workout</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
            <FaCalendar />
          </div>
          <div className="card-content">
            <h3>{records?.currentStreak || 0} 🔥</h3>
            <p>Current Streak</p>
            <span className="sub-text">Longest: {records?.longestStreak || 0} days</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon" style={{background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)'}}>
            <FaTrophy />
          </div>
          <div className="card-content">
            <h3>{Math.round((workoutData?.summary?.totalDuration || 0) / 60)} hrs</h3>
            <p>Total Duration</p>
            <span className="sub-text">{workoutData?.summary?.mostCommonType || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Workout Trend */}
        <div className="chart-card large">
          <h3><FaChartLine /> Workout Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={workoutData?.timeSeriesData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="workouts" 
                stroke="#667eea" 
                fill="#667eea" 
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Calories Burned */}
        <div className="chart-card large">
          <h3><FaFire /> Calories Burned Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={workoutData?.timeSeriesData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="calories" 
                stroke="#f59e0b" 
                strokeWidth={3}
                dot={{ fill: '#f59e0b' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Workout Type Distribution */}
        <div className="chart-card">
          <h3>Workout Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={typeDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {typeDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Progress */}
        <div className="chart-card">
          <h3>Weekly Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={workoutData?.weeklyData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="workouts" fill="#667eea" />
              <Bar dataKey="totalCalories" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Class Attendance by Day */}
        {classData?.totalClasses > 0 && (
          <div className="chart-card">
            <h3>Class Attendance by Day</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="classes" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Body Metrics */}
        {workoutData?.bodyMetricsData?.length > 0 && (
          <div className="chart-card">
            <h3>Body Metrics Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={workoutData.bodyMetricsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="weight" stroke="#667eea" />
                <Line type="monotone" dataKey="bodyFat" stroke="#ef4444" />
                <Line type="monotone" dataKey="muscleMass" stroke="#10b981" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Personal Records */}
      <div className="records-section">
        <h2>🏆 Personal Records</h2>
        <div className="records-grid">
          <div className="record-card">
            <h4>Longest Workout</h4>
            <p>{records?.longestWorkout || 0} minutes</p>
          </div>
          <div className="record-card">
            <h4>Most Calories</h4>
            <p>{records?.mostCalories || 0} kcal</p>
          </div>
          <div className="record-card">
            <h4>Total Workouts</h4>
            <p>{records?.totalWorkouts || 0}</p>
          </div>
          <div className="record-card">
            <h4>Total Calories</h4>
            <p>{records?.totalCalories?.toLocaleString() || 0} kcal</p>
          </div>
          {records?.weightChange && (
            <div className="record-card">
              <h4>Weight Change</h4>
              <p className={records.weightChange < 0 ? 'positive' : 'neutral'}>
                {records.weightChange > 0 ? '+' : ''}{records.weightChange.toFixed(1)} kg
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
