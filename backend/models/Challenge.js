import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['individual', 'team', 'community'],
    default: 'individual'
  },
  category: {
    type: String,
    enum: ['steps', 'calories', 'workouts', 'duration', 'distance', 'custom'],
    required: true
  },
  goal: {
    target: {
      type: Number,
      required: true
    },
    unit: String // 'calories', 'minutes', 'workouts', etc.
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    progress: {
      type: Number,
      default: 0
    },
    rank: Number,
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  rewards: {
    points: Number,
    badges: [String],
    prizes: [String]
  },
  rules: [String],
  maxParticipants: Number,
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

challengeSchema.index({ startDate: 1, endDate: 1, isActive: 1 });

export default mongoose.model('Challenge', challengeSchema);
