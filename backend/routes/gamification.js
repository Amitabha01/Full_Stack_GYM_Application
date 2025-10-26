import express from 'express';
import {
  getAchievements,
  getUserAchievements,
  getLeaderboard,
  seedAchievements
} from '../controllers/gamificationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/achievements', getAchievements);
router.get('/leaderboard', getLeaderboard);

// Protected routes
router.use(protect);

router.get('/my-achievements', getUserAchievements);

// Admin only
router.post('/seed-achievements', authorize('admin'), seedAchievements);

export default router;
