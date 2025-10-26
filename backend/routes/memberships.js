import express from 'express';
import {
  getMemberships,
  getMembership,
  createMembership,
  updateMembership,
  deleteMembership
} from '../controllers/membershipController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getMemberships);
router.get('/:id', getMembership);

// Admin only routes
router.post('/', protect, authorize('admin'), createMembership);
router.put('/:id', protect, authorize('admin'), updateMembership);
router.delete('/:id', protect, authorize('admin'), deleteMembership);

export default router;
