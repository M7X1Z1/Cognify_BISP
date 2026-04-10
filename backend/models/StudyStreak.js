const mongoose = require('mongoose');

/**
 * StudyStreak — one document per user per calendar day.
 * Used by the Dashboard to calculate current streak, longest streak,
 * and total active study days via MongoDB aggregation.
 */
const studyStreakSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Stored as YYYY-MM-DD string for simple date-range queries
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    sessionsCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    totalInputChars: {
      type: Number,
      default: 0,
      min: 0,
    },
    modesUsed: {
      type: [String],
      enum: ['summary', 'quiz', 'flashcards'],
      default: [],
    },
  },
  { timestamps: true }
);

// One document per user per day
studyStreakSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('StudyStreak', studyStreakSchema);
