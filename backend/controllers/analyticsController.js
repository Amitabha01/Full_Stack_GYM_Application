import Workout from '../models/Workout.js';
import Booking from '../models/Booking.js';
import MemberProgress from '../models/MemberProgress.js';
import User from '../models/User.js';

// Get advanced workout analytics
export const getWorkoutAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const workouts = await Workout.find({
      member: req.user._id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    // Calculate daily stats
    const dailyStats = {};
    workouts.forEach(workout => {
      const date = workout.date.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          workouts: 0,
          duration: 0,
          calories: 0,
          types: new Set()
        };
      }
      dailyStats[date].workouts += 1;
      dailyStats[date].duration += workout.duration || 0;
      dailyStats[date].calories += workout.caloriesBurned || 0;
      dailyStats[date].types.add(workout.type);
    });

    // Convert to array and format
    const timeSeriesData = Object.values(dailyStats).map(day => ({
      date: day.date,
      workouts: day.workouts,
      duration: day.duration,
      calories: day.calories,
      variety: day.types.size
    }));

    // Calculate workout type distribution
    const typeDistribution = {};
    workouts.forEach(w => {
      typeDistribution[w.type] = (typeDistribution[w.type] || 0) + 1;
    });

    // Calculate weekly trends
    const weeklyData = [];
    for (let i = 0; i < parseInt(period) / 7; i++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const weekWorkouts = workouts.filter(w => 
        w.date >= weekStart && w.date < weekEnd
      );

      weeklyData.push({
        week: i + 1,
        workouts: weekWorkouts.length,
        totalDuration: weekWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0),
        totalCalories: weekWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
        avgIntensity: weekWorkouts.length > 0 
          ? weekWorkouts.reduce((sum, w) => sum + (w.intensity || 5), 0) / weekWorkouts.length
          : 0
      });
    }

    // Get body metrics over time
    const bodyMetrics = await MemberProgress.find({
      member: req.user._id,
      recordedAt: { $gte: startDate }
    }).sort({ recordedAt: 1 });

    const bodyMetricsData = bodyMetrics.map(m => ({
      date: m.recordedAt.toISOString().split('T')[0],
      weight: m.weight,
      bodyFat: m.bodyFat,
      muscleMass: m.muscleMass
    }));

    // Calculate summary stats
    const summary = {
      totalWorkouts: workouts.length,
      totalDuration: workouts.reduce((sum, w) => sum + (w.duration || 0), 0),
      totalCalories: workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
      avgWorkoutsPerWeek: (workouts.length / (parseInt(period) / 7)).toFixed(1),
      mostCommonType: Object.keys(typeDistribution).reduce((a, b) => 
        typeDistribution[a] > typeDistribution[b] ? a : b, 'none'
      ),
      currentStreak: await calculateCurrentStreak(req.user._id),
      longestStreak: await calculateLongestStreak(req.user._id)
    };

    res.status(200).json({
      success: true,
      data: {
        summary,
        timeSeriesData,
        weeklyData,
        typeDistribution,
        bodyMetricsData,
        period: parseInt(period)
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
};

// Calculate current workout streak
const calculateCurrentStreak = async (userId) => {
  const workouts = await Workout.find({ member: userId })
    .sort({ date: -1 })
    .select('date');

  if (workouts.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const workout of workouts) {
    const workoutDate = new Date(workout.date);
    workoutDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0 || daysDiff === 1) {
      streak++;
      currentDate = workoutDate;
    } else {
      break;
    }
  }

  return streak;
};

// Calculate longest workout streak
const calculateLongestStreak = async (userId) => {
  const workouts = await Workout.find({ member: userId })
    .sort({ date: 1 })
    .select('date');

  if (workouts.length === 0) return 0;

  let longestStreak = 0;
  let currentStreak = 1;
  let lastDate = new Date(workouts[0].date);
  lastDate.setHours(0, 0, 0, 0);

  for (let i = 1; i < workouts.length; i++) {
    const workoutDate = new Date(workouts[i].date);
    workoutDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((workoutDate - lastDate) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else if (daysDiff > 1) {
      currentStreak = 1;
    }

    lastDate = workoutDate;
  }

  return Math.max(longestStreak, currentStreak);
};

// Get class attendance analytics
export const getClassAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const bookings = await Booking.find({
      member: req.user._id,
      createdAt: { $gte: startDate }
    }).populate('class', 'name category trainer');

    // Calculate class type distribution
    const classTypes = {};
    bookings.forEach(b => {
      if (b.class) {
        const category = b.class.category || 'Other';
        classTypes[category] = (classTypes[category] || 0) + 1;
      }
    });

    // Calculate attendance by day of week
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const attendanceByDay = {};
    dayOfWeek.forEach(day => attendanceByDay[day] = 0);

    bookings.forEach(b => {
      const day = dayOfWeek[b.createdAt.getDay()];
      attendanceByDay[day]++;
    });

    res.status(200).json({
      success: true,
      data: {
        totalClasses: bookings.length,
        classTypes,
        attendanceByDay,
        recentClasses: bookings.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Get class analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching class analytics',
      error: error.message
    });
  }
};

// Get personal records and milestones
export const getPersonalRecords = async (req, res) => {
  try {
    const workouts = await Workout.find({ member: req.user._id });

    const records = {
      longestWorkout: Math.max(...workouts.map(w => w.duration || 0), 0),
      mostCalories: Math.max(...workouts.map(w => w.caloriesBurned || 0), 0),
      totalWorkouts: workouts.length,
      totalCalories: workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
      totalDuration: workouts.reduce((sum, w) => sum + (w.duration || 0), 0),
      currentStreak: await calculateCurrentStreak(req.user._id),
      longestStreak: await calculateLongestStreak(req.user._id)
    };

    // Get body composition progress
    const firstProgress = await MemberProgress.findOne({ member: req.user._id })
      .sort({ recordedAt: 1 });
    const latestProgress = await MemberProgress.findOne({ member: req.user._id })
      .sort({ recordedAt: -1 });

    if (firstProgress && latestProgress) {
      records.weightChange = latestProgress.weight - firstProgress.weight;
      records.bodyFatChange = latestProgress.bodyFat - firstProgress.bodyFat;
    }

    res.status(200).json({
      success: true,
      data: { records }
    });
  } catch (error) {
    console.error('Get personal records error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching personal records',
      error: error.message
    });
  }
};
