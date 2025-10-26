import mongoose from 'mongoose';

const memberProgressSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  bodyFat: {
    type: Number
  },
  muscleMass: {
    type: Number
  },
  bmi: {
    type: Number
  },
  measurements: {
    chest: Number,
    waist: Number,
    hips: Number,
    arms: Number,
    thighs: Number
  },
  notes: String,
  recordedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

memberProgressSchema.index({ member: 1, recordedAt: -1 });

export default mongoose.model('MemberProgress', memberProgressSchema);
