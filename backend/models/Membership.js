import mongoose from 'mongoose';

const membershipSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['basic', 'premium', 'vip'],
    required: true
  },
  duration: {
    type: Number, // in months
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  features: [{
    type: String
  }],
  benefits: [{
    name: String,
    description: String,
    included: {
      type: Boolean,
      default: true
    }
  }],
  classesPerWeek: {
    type: Number,
    default: 0 // 0 means unlimited
  },
  personalTrainingSessions: {
    type: Number,
    default: 0
  },
  guestPasses: {
    type: Number,
    default: 0
  },
  accessHours: {
    type: String,
    default: '24/7'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  popular: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Membership = mongoose.model('Membership', membershipSchema);

export default Membership;
