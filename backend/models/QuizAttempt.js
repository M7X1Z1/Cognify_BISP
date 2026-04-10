const mongoose = require('mongoose');

/**
 * QuizAttempt — records a user's attempt at a quiz generated from a StudySession.
 * Each answer captures the question text, the chosen option, and whether it was correct,
 * so past attempts can be reviewed in full.
 */
const answerSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true, maxlength: 1000 },
    options: { type: [String], required: true },
    chosenOption: { type: String, required: true },
    correctOption: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudySession',
      required: true,
    },
    answers: {
      type: [answerSchema],
      default: [],
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },
    // Percentage 0-100, calculated at save time
    scorePercent: {
      type: Number,
      min: 0,
      max: 100,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Calculate scorePercent automatically before saving
quizAttemptSchema.pre('save', function (next) {
  if (this.totalQuestions > 0) {
    this.scorePercent = Math.round((this.score / this.totalQuestions) * 100);
  }
  next();
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
