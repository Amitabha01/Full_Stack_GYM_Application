import Workout from '../models/Workout.js';
import SocialPost from '../models/SocialPost.js';
import Challenge from '../models/Challenge.js';
import { updateWorkoutStats } from './gamificationController.js';
import { createNotification } from './notificationController.js';
import { updateProgress } from './challengeController.js';

// @desc    Get all workouts for logged in member
// @route   GET /api/workouts
// @access  Private
export const getWorkouts = async (req, res) => {
  try {
    const { type, startDate, endDate, page = 1, limit = 20 } = req.query;

    const query = { member: req.user._id };

    if (type) query.type = type;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const workouts = await Workout.find(query)
      .sort('-date')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Workout.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        workouts,
        pagination: {
          total: count,
          page: Number(page),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching workouts',
      error: error.message
    });
  }
};

// @desc    Get single workout
// @route   GET /api/workouts/:id
// @access  Private
export const getWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        status: 'error',
        message: 'Workout not found'
      });
    }

    if (workout.member.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access this workout'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { workout }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching workout',
      error: error.message
    });
  }
};

// @desc    Create new workout
// @route   POST /api/workouts
// @access  Private
export const createWorkout = async (req, res) => {
  try {
    const workoutData = {
      ...req.body,
      member: req.user._id
    };

    const workout = await Workout.create(workoutData);

    // Update gamification stats and check achievements
    try {
      await updateWorkoutStats(req.user._id, workout);
    } catch (gamificationError) {
      console.error('Gamification update error:', gamificationError);
    }

    // Update challenge progress
    try {
      const userChallenges = await Challenge.find({
        'participants.user': req.user._id,
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      });

      for (const challenge of userChallenges) {
        let progress = 0;
        
        if (challenge.category === 'calories') {
          // Get total calories for this challenge period
          const challengeWorkouts = await Workout.find({
            member: req.user._id,
            date: { $gte: challenge.startDate, $lte: new Date() }
          });
          progress = challengeWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
        } else if (challenge.category === 'workouts') {
          // Count workouts in challenge period
          progress = await Workout.countDocuments({
            member: req.user._id,
            date: { $gte: challenge.startDate, $lte: new Date() }
          });
        } else if (challenge.category === 'duration') {
          // Sum workout duration in challenge period
          const challengeWorkouts = await Workout.find({
            member: req.user._id,
            date: { $gte: challenge.startDate, $lte: new Date() }
          });
          progress = challengeWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
        }

        await updateProgress(challenge._id, req.user._id, progress);
      }
    } catch (challengeError) {
      console.error('Challenge update error:', challengeError);
    }

    // Auto-create social post if workout is significant
    try {
      const isSignificant = 
        (workout.caloriesBurned && workout.caloriesBurned >= 500) ||
        (workout.duration && workout.duration >= 60);

      if (isSignificant && req.body.shareWorkout) {
        await SocialPost.create({
          user: req.user._id,
          type: 'workout',
          content: {
            text: `Just completed an amazing workout! 💪`,
            workout: workout._id
          },
          visibility: 'public'
        });
      }
    } catch (socialError) {
      console.error('Social post error:', socialError);
    }

    // Send notification
    try {
      await createNotification(
        req.user._id,
        'workout_milestone',
        '💪 Workout Completed!',
        `Great job! You completed "${workout.title}" and burned ${workout.caloriesBurned} calories.`
      );
    } catch (notificationError) {
      console.error('Notification error:', notificationError);
    }

    res.status(201).json({
      status: 'success',
      message: 'Workout logged successfully',
      data: { workout }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating workout',
      error: error.message
    });
  }
};

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private
export const updateWorkout = async (req, res) => {
  try {
    let workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        status: 'error',
        message: 'Workout not found'
      });
    }

    if (workout.member.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this workout'
      });
    }

    workout = await Workout.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Workout updated successfully',
      data: { workout }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating workout',
      error: error.message
    });
  }
};

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
export const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        status: 'error',
        message: 'Workout not found'
      });
    }

    if (workout.member.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this workout'
      });
    }

    await workout.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Workout deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting workout',
      error: error.message
    });
  }
};

// @desc    Get workout statistics
// @route   GET /api/workouts/stats
// @access  Private
export const getWorkoutStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchQuery = { member: req.user._id };
    
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    const stats = await Workout.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          totalCalories: { $sum: '$totalCalories' }
        }
      }
    ]);

    const totalWorkouts = await Workout.countDocuments(matchQuery);
    
    const allStats = await Workout.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalDuration: { $sum: '$duration' },
          totalCalories: { $sum: '$totalCalories' },
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalWorkouts,
        byType: stats,
        overall: allStats[0] || { totalDuration: 0, totalCalories: 0, avgDuration: 0 }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching workout statistics',
      error: error.message
    });
  }
};
