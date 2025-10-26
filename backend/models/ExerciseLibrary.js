import mongoose from 'mongoose';

const exerciseLibrarySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['cardio', 'strength', 'flexibility', 'balance', 'sports'],
    required: true
  },
  muscleGroups: [{
    type: String,
    enum: ['chest', 'back', 'shoulders', 'arms', 'core', 'legs', 'glutes', 'full-body']
  }],
  equipment: [{
    type: String,
    enum: ['none', 'dumbbells', 'barbell', 'kettlebell', 'resistance-bands', 'machine', 'bodyweight', 'other']
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  instructions: [String],
  videoUrl: String,
  thumbnailUrl: String,
  duration: Number, // in seconds
  calories: Number, // estimated calories per rep/set
  tips: [String],
  variations: [String],
  safety: [String],
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

exerciseLibrarySchema.index({ category: 1, difficulty: 1 });
exerciseLibrarySchema.index({ muscleGroups: 1 });

export default mongoose.model('ExerciseLibrary', exerciseLibrarySchema);
