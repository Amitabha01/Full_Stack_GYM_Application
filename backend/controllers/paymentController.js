import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Membership from '../models/Membership.js';
import User from '../models/User.js';

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

if (!razorpayKeyId || razorpayKeyId === 'your_razorpay_key_id_here') {
  console.warn('⚠️  WARNING: Razorpay API keys not configured!');
  console.warn('📝 Please add your Razorpay API keys to .env file');
  console.warn('🔗 Get your keys from: https://dashboard.razorpay.com/app/keys');
}

const razorpay = razorpayKeyId && razorpayKeySecret 
  ? new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    })
  : null;

export const createPaymentIntent = async (req, res) => {
  try {
    if (!razorpay || !razorpayKeyId || razorpayKeyId === 'your_razorpay_key_id_here') {
      return res.status(503).json({
        success: false,
        message: 'Payment system not configured. Please contact administrator.',
        error: 'Razorpay API keys not set'
      });
    }

    const { membershipId } = req.body;
    const membership = await Membership.findById(membershipId);
    
    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership plan not found'
      });
    }

    const options = {
      amount: Math.round(membership.price * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        membershipId: membershipId,
        membershipName: membership.name,
        userName: req.user.name,
        userEmail: req.user.email
      }
    };

    const order = await razorpay.orders.create(options);

    const payment = await Payment.create({
      user: req.user._id,
      membership: membershipId,
      razorpayOrderId: order.id,
      amount: membership.price,
      currency: 'INR',
      status: 'pending',
      description: `${membership.name} Membership`,
      metadata: {
        duration: membership.duration,
        features: membership.features
      }
    });

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: razorpayKeyId,
        payment,
        user: {
          name: req.user.name,
          email: req.user.email
        }
      }
    });
  } catch (error) {
    console.error('Payment order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment order',
      error: error.message
    });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpaySignature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: 'succeeded'
      },
      { new: true }
    ).populate('membership');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    if (payment.membership) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + payment.membership.duration);

      await User.findByIdAndUpdate(payment.user, {
        membershipType: payment.membership.type,
        membershipStatus: 'active',
        membershipStartDate: startDate,
        membershipEndDate: endDate
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: { payment }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message
    });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('membership', 'name duration price')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: { payments }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment history',
      error: error.message
    });
  }
};

export const handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (webhookSecret) {
      const body = JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      if (signature !== expectedSignature) {
        return res.status(400).json({ error: 'Invalid signature' });
      }
    }

    const event = req.body.event;
    const payload = req.body.payload;

    switch (event) {
      case 'payment.captured':
        await Payment.findOneAndUpdate(
          { razorpayPaymentId: payload.payment.entity.id },
          { status: 'succeeded' }
        );
        break;

      case 'payment.failed':
        await Payment.findOneAndUpdate(
          { razorpayOrderId: payload.payment.entity.order_id },
          { status: 'failed' }
        );
        break;

      default:
        console.log(`Unhandled event type ${event}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

export const createSubscription = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      message: 'Subscriptions not yet implemented with Razorpay'
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating subscription',
      error: error.message
    });
  }
};
