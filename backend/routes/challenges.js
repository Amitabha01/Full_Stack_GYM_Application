import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getChallenges,
  createChallenge,
  joinChallenge,
  getUserChallenges,
  getChallengeLeaderboard
} from '../controllers/challengeController.js';

const router = express.Router();

// Challenge routes
router.get('/', protect, getChallenges);
router.post('/', protect, createChallenge);
router.post('/:id/join', protect, joinChallenge);
router.get('/my-challenges', protect, getUserChallenges);
router.get('/:id/leaderboard', protect, getChallengeLeaderboard);

export default router;
