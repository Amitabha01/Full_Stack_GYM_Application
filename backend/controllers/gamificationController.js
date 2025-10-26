import Achievement from '../models/Achievement.js';
import UserAchievement from '../models/UserAchievement.js';
import Leaderboard from '../models/Leaderboard.js';
import Workout from '../models/Workout.js';
import Booking from '../models/Booking.js';
import { createNotification } from './notificationController.js';

// Get all achievements
export const getAchievements = async (req, res) => {
  try {
    const { category } = req.query;
    
    const query = { isActive: true };
    if (category) query.category = category;

    const achievements = await Achievement.find(query).sort({ tier: 1, points: 1 });

    res.status(200).json({
      success: true,
      count: achievements.length,
      data: { achievements }
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching achievements',
      error: error.message
    });
  }
};

// Get user achievements
export const getUserAchievements = async (req, res) => {
  try {
    const userAchievements = await UserAchievement.find({ user: req.user._id })
      .populate('achievement')
      .sort({ unlockedAt: -1 });

    const totalPoints = userAchievements.reduce((sum, ua) => 
      sum + (ua.achievement?.points || 0), 0
    );

    res.status(200).json({
      success: true,
      count: userAchievements.length,
      totalPoints,
      data: { achievements: userAchievements }
    });
  } catch (error) {
    console.error('Get user achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user achievements',
      error: error.message
    });
  }
};

// Check and unlock achievements
export const checkAchievements = async (userId) => {
  try {
    const achievements = await Achievement.find({ isActive: true });
    const newlyUnlocked = [];

    for (const achievement of achievements) {
      // Check if user already has this achievement
      const existing = await UserAchievement.findOne({
        user: userId,
        achievement: achievement._id
      });

      if (existing) continue;

      let qualified = false;
      let progress = 0;

      // Check criteria
      switch (achievement.criteria.type) {
        case 'workout_count':
          const workoutCount = await Workout.countDocuments({ user: userId });
          progress = workoutCount;
          qualified = workoutCount >= achievement.criteria.target;
          break;

        case 'calories_burned':
          const caloriesData = await Workout.aggregate([
            { $match: { user: userId } },
            { $group: { _id: null, total: { $sum: '$totalCalories' } } }
          ]);
          progress = caloriesData[0]?.total || 0;
          qualified = progress >= achievement.criteria.target;
          break;

        case 'class_attendance':
          const classCount = await Booking.countDocuments({
            user: userId,
            status: 'completed'
          });
          progress = classCount;
          qualified = classCount >= achievement.criteria.target;
          break;

        case 'duration':
          const durationData = await Workout.aggregate([
            { $match: { user: userId } },
            { $group: { _id: null, total: { $sum: '$duration' } } }
          ]);
          progress = durationData[0]?.total || 0;
          qualified = progress >= achievement.criteria.target;
          break;
      }

      if (qualified) {
        // Unlock achievement
        const userAchievement = await UserAchievement.create({
          user: userId,
          achievement: achievement._id,
          progress: achievement.criteria.target
        });

        newlyUnlocked.push(achievement);

        // Create notification
        await createNotification(
          userId,
          'achievement',
          '🏆 Achievement Unlocked!',
          `Congratulations! You've earned the "${achievement.name}" badge!`,
          { achievementId: achievement._id, points: achievement.points }
        );

        // Update leaderboard points
        await updateLeaderboardPoints(userId, achievement.points);
      }
    }

    return newlyUnlocked;
  } catch (error) {
    console.error('Check achievements error:', error);
    throw error;
  }
};

// Get leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const { period = 'all_time', limit = 50 } = req.query;

    const leaderboard = await Leaderboard.find({ period })
      .populate('user', 'name email avatar')
      .sort({ totalPoints: -1 })
      .limit(parseInt(limit));

    // Add rank
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Find current user's position
    const userEntry = await Leaderboard.findOne({
      user: req.user._id,
      period
    }).populate('user', 'name email avatar');

    let userRank = null;
    if (userEntry) {
      const higherCount = await Leaderboard.countDocuments({
        period,
        totalPoints: { $gt: userEntry.totalPoints }
      });
      userRank = { ...userEntry.toObject(), rank: higherCount + 1 };
    }

    res.status(200).json({
      success: true,
      data: {
        leaderboard,
        userRank
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error.message
    });
  }
};

// Update leaderboard points
export const updateLeaderboardPoints = async (userId, points) => {
  try {
    const leaderboard = await Leaderboard.findOneAndUpdate(
      { user: userId, period: 'all_time' },
      { $inc: { totalPoints: points } },
      { upsert: true, new: true }
    );

    // Calculate level (every 100 points = 1 level)
    const level = Math.floor(leaderboard.totalPoints / 100) + 1;
    leaderboard.level = level;
    await leaderboard.save();

    return leaderboard;
  } catch (error) {
    console.error('Update leaderboard error:', error);
    throw error;
  }
};

// Update workout stats in leaderboard
export const updateWorkoutStats = async (userId, workout) => {
  try {
    const update = {
      $inc: {
        totalWorkouts: 1,
        totalCalories: workout.totalCalories || 0,
        totalDuration: workout.duration || 0
      },
      lastWorkoutDate: new Date()
    };

    // Update streak
    const leaderboard = await Leaderboard.findOne({
      user: userId,
      period: 'all_time'
    });

    if (leaderboard) {
      const lastDate = leaderboard.lastWorkoutDate;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (lastDate) {
        const lastWorkout = new Date(lastDate);
        lastWorkout.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today - lastWorkout) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Consecutive day
          update.$inc.currentStreak = 1;
          const newStreak = (leaderboard.currentStreak || 0) + 1;
          if (newStreak > (leaderboard.longestStreak || 0)) {
            update.longestStreak = newStreak;
          }
        } else if (diffDays > 1) {
          // Streak broken
          update.currentStreak = 1;
        }
      } else {
        update.currentStreak = 1;
      }
    }

    await Leaderboard.findOneAndUpdate(
      { user: userId, period: 'all_time' },
      update,
      { upsert: true, new: true }
    );

    // Award points for workout completion
    await updateLeaderboardPoints(userId, 10);

    // Check for achievements
    await checkAchievements(userId);
  } catch (error) {
    console.error('Update workout stats error:', error);
    throw error;
  }
};

// Seed initial achievements
export const seedAchievements = async (req, res) => {
  try {
    const achievements = [
      {
        name: 'First Step',
        description: 'Complete your first workout',
        icon: '🏃',
        category: 'workout',
        points: 10,
        tier: 'bronze',
        criteria: { type: 'workout_count', target: 1 }
      },
      {
        name: 'Dedication',
        description: 'Complete 10 workouts',
        icon: '💪',
        category: 'workout',
        points: 50,
        tier: 'silver',
        criteria: { type: 'workout_count', target: 10 }
      },
      {
        name: 'Champion',
        description: 'Complete 50 workouts',
        icon: '🏆',
        category: 'workout',
        points: 200,
        tier: 'gold',
        criteria: { type: 'workout_count', target: 50 }
      },
      {
        name: 'Calorie Crusher',
        description: 'Burn 10,000 calories total',
        icon: '🔥',
        category: 'milestone',
        points: 100,
        tier: 'silver',
        criteria: { type: 'calories_burned', target: 10000 }
      },
      {
        name: 'Class Regular',
        description: 'Attend 20 fitness classes',
        icon: '📚',
        category: 'attendance',
        points: 80,
        tier: 'silver',
        criteria: { type: 'class_attendance', target: 20 }
      },
      {
        name: 'Marathon',
        description: 'Complete 1000 minutes of workouts',
        icon: '⏱️',
        category: 'milestone',
        points: 150,
        tier: 'gold',
        criteria: { type: 'duration', target: 1000 }
      }
    ];

    await Achievement.deleteMany({});
    await Achievement.insertMany(achievements);

    res.status(200).json({
      success: true,
      message: 'Achievements seeded successfully',
      count: achievements.length
    });
  } catch (error) {
    console.error('Seed achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding achievements',
      error: error.message
    });
  }
};
