import mongoose from 'mongoose';

const socialPostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['workout', 'achievement', 'milestone', 'status', 'media'],
    required: true
  },
  content: {
    text: String,
    workout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workout'
    },
    achievement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Achievement'
    },
    media: [{
      type: String, // URL to image/video
      mediaType: {
        type: String,
        enum: ['image', 'video']
      }
    }]
  },
  visibility: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'public'
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

socialPostSchema.index({ user: 1, createdAt: -1 });
socialPostSchema.index({ visibility: 1, createdAt: -1 });

export default mongoose.model('SocialPost', socialPostSchema);
