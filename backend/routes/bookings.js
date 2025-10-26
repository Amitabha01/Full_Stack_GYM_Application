import express from 'express';
import {
  getBookings,
  createBooking,
  cancelBooking,
  getBookingStats
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/stats', getBookingStats);
router.route('/')
  .get(getBookings)
  .post(createBooking);

router.put('/:id/cancel', cancelBooking);

export default router;
