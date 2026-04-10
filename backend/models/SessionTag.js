const mongoose = require('mongoose');

/**
 * SessionTag — junction table linking StudySessions to Tags (many-to-many).
 * A session can have multiple tags; a tag can be applied to multiple sessions.
 */
const sessionTagSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudySession',
      required: true,
    },
    tagId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tag',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent the same tag being applied to the same session twice
sessionTagSchema.index({ sessionId: 1, tagId: 1 }, { unique: true });
sessionTagSchema.index({ userId: 1 });

module.exports = mongoose.model('SessionTag', sessionTagSchema);
