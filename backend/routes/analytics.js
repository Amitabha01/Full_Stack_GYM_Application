import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getWorkoutAnalytics,
  getClassAnalytics,
  getPersonalRecords
} from '../controllers/analyticsController.js';

const router = express.Router();

// Analytics routes
router.get('/workouts', protect, getWorkoutAnalytics);
router.get('/classes', protect, getClassAnalytics);
router.get('/records', protect, getPersonalRecords);

export default router;
