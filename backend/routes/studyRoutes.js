const express = require('express');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');
const { generate, getHistory, deleteSession } = require('../controllers/studyController');
const { ALLOWED_MIMETYPES } = require('../constants/mimeTypes');

const router = express.Router();

// store uploaded files in memory instead of writing them to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMETYPES.has(file.mimetype)) cb(null, true);
    else cb(new Error('Only .txt, .pdf, .docx, and .pptx files are allowed.'));
  },
});

// limit to 20 generate requests per user every 15 minutes
// this matches the Gemini free tier limit and stops abuse
const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.userId.toString(),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait before trying again.' },
});

router.post('/generate', auth, generateLimiter, upload.single('file'), generate);
router.get('/history', auth, getHistory);
router.delete('/:id', auth, deleteSession);

module.exports = router;
