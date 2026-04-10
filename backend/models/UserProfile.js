const mongoose = require('mongoose');

/**
 * UserProfile — extended user information and preferences.
 * One-to-one with User. Created lazily on first settings save.
 */
const userProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: 80,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    preferences: {
      defaultMode: {
        type: String,
        enum: ['summary', 'quiz', 'flashcards'],
        default: 'summary',
      },
      defaultDifficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium',
      },
      darkMode: {
        type: Boolean,
        default: false,
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserProfile', userProfileSchema);
