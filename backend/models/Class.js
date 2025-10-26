import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a class name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['cardio', 'strength', 'yoga', 'pilates', 'dance', 'martial-arts', 'cycling', 'swimming', 'crossfit', 'other'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  maxCapacity: {
    type: Number,
    required: true,
    default: 20
  },
  currentEnrollment: {
    type: Number,
    default: 0
  },
  schedule: [{
    dayOfWeek: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    startTime: String, // "09:00"
    endTime: String
  }],
  price: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/400x300'
  },
  equipment: [String],
  benefits: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Class = mongoose.model('Class', classSchema);

export default Class;
