import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  sets: Number,
  reps: Number,
  weight: Number, // in kg
  duration: Number, // in minutes
  distance: Number, // in km
  calories: Number,
  notes: String
});

const workoutSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'sports', 'other'],
    required: true
  },
  duration: {
    type: Number, // total minutes
    required: true
  },
  exercises: [exerciseSchema],
  totalCalories: {
    type: Number,
    default: 0
  },
  feeling: {
    type: String,
    enum: ['excellent', 'good', 'average', 'tired', 'exhausted']
  },
  notes: String,
  isCompleted: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
workoutSchema.index({ member: 1, date: -1 });

const Workout = mongoose.model('Workout', workoutSchema);

export default Workout;
