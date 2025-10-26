import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['workout', 'attendance', 'streak', 'milestone', 'social', 'special'],
    required: true
  },
  points: {
    type: Number,
    required: true,
    default: 10
  },
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  criteria: {
    type: {
      type: String,
      enum: ['workout_count', 'workout_streak', 'calories_burned', 'class_attendance', 'duration', 'specific_workout'],
      required: true
    },
    target: {
      type: Number,
      required: true
    },
    period: {
      type: String,
      enum: ['all_time', 'monthly', 'weekly', 'daily']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Achievement', achievementSchema);
