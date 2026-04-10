const mongoose = require('mongoose');

/**
 * Tag — user-defined label that can be applied to StudySessions.
 * Each user owns their own tag namespace (same name can exist for different users).
 */
const tagSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },
    // Hex colour for UI badge display, e.g. '#6B46C1'
    color: {
      type: String,
      default: '#6B46C1',
      match: /^#[0-9A-Fa-f]{6}$/,
    },
  },
  { timestamps: true }
);

// A user cannot have two tags with the same name
tagSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Tag', tagSchema);
