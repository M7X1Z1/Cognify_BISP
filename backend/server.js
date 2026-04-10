require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

// crash early if someone forgot to set a required env variable
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET', 'GEMINI_API_KEY', 'CLIENT_URL'];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const app = express();

connectDB();

// helmet adds basic security headers automatically
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
// only allow requests from our frontend URL
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/study', require('./routes/studyRoutes'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// on Railway we serve the React app from the same server
// any URL that isn't an API route just gets index.html and React Router takes over
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  const distPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

// catch errors from multer (bad file type, file too big) and anything else unexpected
app.use((err, req, res, next) => {
  if (err.message === 'Only .txt, .pdf, .docx, and .pptx files are allowed.') {
    return res.status(400).json({ error: err.message });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File size must not exceed 20 MB.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
