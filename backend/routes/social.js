import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getFeed,
  createPost,
  likePost,
  addComment,
  followUser,
  getConnections,
  deletePost
} from '../controllers/socialController.js';

const router = express.Router();

// Social feed routes
router.get('/feed', protect, getFeed);
router.post('/posts', protect, createPost);
router.delete('/posts/:id', protect, deletePost);
router.post('/posts/:id/like', protect, likePost);
router.post('/posts/:id/comment', protect, addComment);

// Follow system routes
router.post('/follow/:userId', protect, followUser);
router.get('/connections/:userId', protect, getConnections);

export default router;
