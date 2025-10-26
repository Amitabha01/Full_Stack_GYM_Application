import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  bookingDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    startTime: String,
    endTime: String
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'confirmed'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentAmount: {
    type: Number,
    required: true
  },
  notes: String,
  cancellationReason: String,
  cancelledAt: Date,
  attendedAt: Date
}, {
  timestamps: true
});

// Index for faster queries
bookingSchema.index({ member: 1, bookingDate: -1 });
bookingSchema.index({ class: 1, bookingDate: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
