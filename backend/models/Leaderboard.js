import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  totalWorkouts: {
    type: Number,
    default: 0
  },
  totalCalories: {
    type: Number,
    default: 0
  },
  totalDuration: {
    type: Number,
    default: 0
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastWorkoutDate: Date,
  level: {
    type: Number,
    default: 1
  },
  rank: {
    type: Number
  },
  period: {
    type: String,
    enum: ['all_time', 'monthly', 'weekly'],
    default: 'all_time'
  },
  periodStart: Date,
  periodEnd: Date
}, {
  timestamps: true
});

// Indexes for leaderboard queries
leaderboardSchema.index({ period: 1, totalPoints: -1 });
leaderboardSchema.index({ user: 1, period: 1 }, { unique: true });

export default mongoose.model('Leaderboard', leaderboardSchema);
