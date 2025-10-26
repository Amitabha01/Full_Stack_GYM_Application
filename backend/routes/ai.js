import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getWorkoutRecommendations,
  getExercises,
  createExercise,
  seedExercises
} from '../controllers/aiController.js';

const router = express.Router();

// AI recommendations
router.get('/recommendations', protect, getWorkoutRecommendations);

// Exercise library
router.get('/exercises', protect, getExercises);
router.post('/exercises', protect, authorize('trainer', 'admin'), createExercise);
router.post('/exercises/seed', protect, seedExercises); // Allow any user to seed if empty

export default router;
