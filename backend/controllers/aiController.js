import ExerciseLibrary from '../models/ExerciseLibrary.js';
import Workout from '../models/Workout.js';
import User from '../models/User.js';

// AI-powered workout recommendations
export const getWorkoutRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Get user's workout history
    const workoutHistory = await Workout.find({ member: req.user._id })
      .sort({ date: -1 })
      .limit(20);

    // Analyze user's fitness level and preferences
    const userLevel = user.fitnessLevel || 'beginner';
    const userGoals = user.fitnessGoals || [];
    
    // Get frequently done workout types
    const workoutTypes = {};
    workoutHistory.forEach(w => {
      workoutTypes[w.type] = (workoutTypes[w.type] || 0) + 1;
    });

    const preferredType = Object.keys(workoutTypes).reduce((a, b) => 
      workoutTypes[a] > workoutTypes[b] ? a : b, 'strength'
    );

    // Build recommendation query
    const query = {
      difficulty: userLevel,
      isApproved: true
    };

    // Match category based on goals
    if (userGoals.includes('weight-loss')) {
      query.category = 'cardio';
    } else if (userGoals.includes('muscle-gain')) {
      query.category = 'strength';
    } else if (userGoals.includes('flexibility')) {
      query.category = 'flexibility';
    }

    // Get exercises
    let recommendations = await ExerciseLibrary.find(query).limit(10);

    // If not enough, get more based on preferred type
    if (recommendations.length < 5) {
      const additional = await ExerciseLibrary.find({
        difficulty: userLevel,
        isApproved: true
      }).limit(10);
      
      recommendations = [...recommendations, ...additional].slice(0, 10);
    }

    // Calculate recommendation scores
    const scoredRecommendations = recommendations.map(exercise => {
      let score = 0;
      
      // Match with user goals
      if (userGoals.includes('weight-loss') && exercise.category === 'cardio') score += 30;
      if (userGoals.includes('muscle-gain') && exercise.category === 'strength') score += 30;
      if (userGoals.includes('flexibility') && exercise.category === 'flexibility') score += 30;
      
      // Match difficulty level
      if (exercise.difficulty === userLevel) score += 20;
      
      // Variety bonus (exercise not done recently)
      const recentlyDone = workoutHistory.some(w => 
        w.exercises?.some(e => e.name === exercise.name)
      );
      if (!recentlyDone) score += 20;
      
      // Random factor for variety
      score += Math.random() * 10;
      
      return {
        exercise: exercise.toObject(),
        score,
        reason: getRecommendationReason(exercise, userGoals, userLevel)
      };
    });

    // Sort by score
    scoredRecommendations.sort((a, b) => b.score - a.score);

    res.status(200).json({
      success: true,
      data: {
        recommendations: scoredRecommendations.slice(0, 5),
        userProfile: {
          level: userLevel,
          goals: userGoals,
          preferredType
        }
      }
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating recommendations',
      error: error.message
    });
  }
};

// Helper function to generate recommendation reasons
const getRecommendationReason = (exercise, goals, level) => {
  const reasons = [];
  
  if (exercise.difficulty === level) {
    reasons.push('Matches your fitness level');
  }
  
  if (goals.includes('weight-loss') && exercise.category === 'cardio') {
    reasons.push('Great for burning calories');
  }
  
  if (goals.includes('muscle-gain') && exercise.category === 'strength') {
    reasons.push('Perfect for building muscle');
  }
  
  if (exercise.equipment.includes('none')) {
    reasons.push('No equipment needed');
  }
  
  return reasons.length > 0 ? reasons.join(', ') : 'Recommended for variety';
};

// Get exercise library
export const getExercises = async (req, res) => {
  try {
    const { category, difficulty, muscleGroup, equipment } = req.query;
    
    const query = { isApproved: true };
    
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (muscleGroup) query.muscleGroups = muscleGroup;
    if (equipment) query.equipment = equipment;

    const exercises = await ExerciseLibrary.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: exercises.length,
      data: { exercises }
    });
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching exercises',
      error: error.message
    });
  }
};

// Create exercise (admin/trainer)
export const createExercise = async (req, res) => {
  try {
    const exercise = await ExerciseLibrary.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Exercise created successfully',
      data: { exercise }
    });
  } catch (error) {
    console.error('Create exercise error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating exercise',
      error: error.message
    });
  }
};

// Seed exercise library
export const seedExercises = async (req, res) => {
  try {
    // Check if library already has exercises
    const existingCount = await ExerciseLibrary.countDocuments();
    
    // Only allow non-admins to seed if library is empty
    if (existingCount > 0 && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Exercise library already seeded. Admin access required to re-seed.'
      });
    }

    const exercises = [
      {
        name: 'Push-ups',
        description: 'Classic upper body exercise',
        category: 'strength',
        muscleGroups: ['chest', 'arms', 'core'],
        equipment: ['none'],
        difficulty: 'beginner',
        instructions: ['Start in plank position', 'Lower body until chest nearly touches floor', 'Push back up'],
        calories: 8,
        tips: ['Keep core engaged', 'Maintain straight line from head to heels'],
        isApproved: true
      },
      {
        name: 'Squats',
        description: 'Fundamental lower body exercise',
        category: 'strength',
        muscleGroups: ['legs', 'glutes', 'core'],
        equipment: ['none'],
        difficulty: 'beginner',
        instructions: ['Stand with feet shoulder-width apart', 'Lower hips back and down', 'Return to standing'],
        calories: 10,
        tips: ['Keep knees aligned with toes', 'Chest up, core tight'],
        isApproved: true
      },
      {
        name: 'Burpees',
        description: 'Full body cardio exercise',
        category: 'cardio',
        muscleGroups: ['full-body'],
        equipment: ['none'],
        difficulty: 'intermediate',
        instructions: ['Start standing', 'Drop to plank', 'Do a push-up', 'Jump feet to hands', 'Jump up with arms overhead'],
        calories: 12,
        tips: ['Move explosively', 'Land softly'],
        isApproved: true
      },
      {
        name: 'Plank',
        description: 'Core strengthening hold',
        category: 'strength',
        muscleGroups: ['core', 'shoulders'],
        equipment: ['none'],
        difficulty: 'beginner',
        instructions: ['Hold push-up position on forearms', 'Keep body in straight line', 'Hold for time'],
        calories: 5,
        tips: ['Don\'t let hips sag', 'Breathe steadily'],
        isApproved: true
      },
      {
        name: 'Jumping Jacks',
        description: 'Classic cardio warm-up',
        category: 'cardio',
        muscleGroups: ['full-body'],
        equipment: ['none'],
        difficulty: 'beginner',
        instructions: ['Start with feet together', 'Jump feet out while raising arms', 'Return to start'],
        calories: 8,
        tips: ['Land softly', 'Keep pace steady'],
        isApproved: true
      }
    ];

    await ExerciseLibrary.deleteMany({});
    await ExerciseLibrary.insertMany(exercises);

    res.status(200).json({
      success: true,
      message: 'Exercise library seeded successfully',
      count: exercises.length
    });
  } catch (error) {
    console.error('Seed exercises error:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding exercises',
      error: error.message
    });
  }
};
