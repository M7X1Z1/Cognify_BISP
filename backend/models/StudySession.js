const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    inputText: {
      type: String,
      required: true,
      maxlength: 500000,
    },
    outputText: {
      type: String,
      required: true,
      maxlength: 200000,
    },
    mode: {
      type: String,
      enum: ['summary', 'quiz', 'flashcards'],
      required: true,
    },
    difficultyLevel: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    customInstruction: {
      type: String,
      default: '',
      maxlength: 500,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudySession', studySessionSchema);
