import Stripe from 'stripe';
import Payment from '../models/Payment.js';
import Membership from '../models/Membership.js';
import User from '../models/User.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key');

// Create payment intent
export const createPaymentIntent = async (req, res) => {
  try {
    const { membershipId, paymentMethodId } = req.body;

    const membership = await Membership.findById(membershipId);
    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership plan not found'
      });
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId = req.user.stripeCustomerId;
    
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        metadata: {
          userId: req.user._id.toString()
        }
      });
      stripeCustomerId = customer.id;
      
      // Save Stripe customer ID to user
      await User.findByIdAndUpdate(req.user._id, {
        stripeCustomerId: customer.id
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(membership.price * 100), // Convert to cents
      currency: 'usd',
      customer: stripeCustomerId,
      payment_method: paymentMethodId,
      confirm: paymentMethodId ? true : false,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      metadata: {
        userId: req.user._id.toString(),
        membershipId: membershipId,
        membershipName: membership.name
      },
      description: `${membership.name} Membership - ${membership.duration} months`
    });

    // Create payment record in database
    const payment = await Payment.create({
      user: req.user._id,
      membership: membershipId,
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId: stripeCustomerId,
      amount: membership.price,
      status: paymentIntent.status === 'succeeded' ? 'succeeded' : 'pending',
      description: `${membership.name} Membership`,
      metadata: {
        duration: membership.duration,
        features: membership.features
      }
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        payment
      }
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment intent',
      error: error.message
    });
  }
};

// Confirm payment
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const payment = await Payment.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntentId },
        { status: 'succeeded' },
        { new: true }
      ).populate('membership');

      // Update user membership
      if (payment.membership) {
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + payment.membership.duration);

        await User.findByIdAndUpdate(payment.user, {
          membershipType: payment.membership.type,
          membershipStatus: 'active',
          membershipExpiry: expiryDate
        });
      }

      res.status(200).json({
        success: true,
        message: 'Payment confirmed successfully',
        data: { payment }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not successful',
        status: paymentIntent.status
      });
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming payment',
      error: error.message
    });
  }
};

// Get user payment history
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

// Stripe webhook handler
export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id },
        { status: 'succeeded' }
      );
      break;

    case 'payment_intent.payment_failed':
      const failedIntent = event.data.object;
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: failedIntent.id },
        { status: 'failed' }
      );
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// Create subscription (for recurring payments)
export const createSubscription = async (req, res) => {
  try {
    const { membershipId, paymentMethodId } = req.body;

    const membership = await Membership.findById(membershipId);
    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership plan not found'
      });
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId = req.user.stripeCustomerId;
    
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });
      stripeCustomerId = customer.id;
      
      await User.findByIdAndUpdate(req.user._id, {
        stripeCustomerId: customer.id
      });
    }

    // Create a price if not exists
    const price = await stripe.prices.create({
      unit_amount: Math.round(membership.price * 100),
      currency: 'usd',
      recurring: { interval: 'month', interval_count: membership.duration },
      product_data: {
        name: `${membership.name} Membership`,
        description: membership.description
      }
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: price.id }],
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription'
      },
      expand: ['latest_invoice.payment_intent']
    });

    res.status(200).json({
      success: true,
      data: {
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret
      }
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
