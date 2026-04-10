const mongoose = require('mongoose');

/**
 * AuditLog — immutable record of significant user and admin actions.
 * Used for security review, debugging, and future admin dashboard.
 * Documents are never updated after creation.
 */
const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null for unauthenticated actions (e.g. failed login)
    },
    action: {
      type: String,
      required: true,
      enum: [
        'register',
        'login',
        'login_failed',
        'logout',
        'generate_content',
        'delete_session',
        'share_session',
        'delete_account',
        'change_password',
        'admin_view_users',
      ],
    },
    resourceType: {
      type: String,
      enum: ['user', 'study_session', 'shared_session', 'report', 'flashcard_deck', null],
      default: null,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
      maxlength: 500,
    },
    // Any extra context (e.g. error message for failed actions)
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    // Prevent accidental updates to audit records
    strict: true,
  }
);

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });

// Auto-expire logs after 90 days
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
