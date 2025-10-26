import express from 'express';
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  createSubscription,
  handleWebhook
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Webhook route (must be before express.json() middleware)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.use(protect);

router.post('/create-intent', createPaymentIntent);
router.post('/confirm', confirmPayment);
router.post('/create-subscription', createSubscription);
router.get('/history', getPaymentHistory);

export default router;
