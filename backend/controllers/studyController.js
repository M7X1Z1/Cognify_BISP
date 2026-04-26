const StudySession = require('../models/StudySession');
const { generateStudyContent } = require('../services/aiService');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { parseOffice } = require('officeparser');
const { DOCX_MIMETYPES, PPTX_MIMETYPES } = require('../constants/mimeTypes');

const VALID_MODES = ['summary', 'quiz', 'flashcards'];
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];

// reads the uploaded file and returns its text content
async function extractTextFromFile(file) {
  if (file.mimetype === 'text/plain') return file.buffer.toString('utf-8');
  if (file.mimetype === 'application/pdf') {
    const data = await pdfParse(file.buffer);
    // pdf-parse resolves to a pdfData object — guard against unexpected shapes
    const text = typeof data === 'string' ? data : (data?.text ?? '');
    return String(text);
  }
  if (DOCX_MIMETYPES.has(file.mimetype)) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }
  if (PPTX_MIMETYPES.has(file.mimetype)) {
    try {
      return await parseOffice(file.buffer);
    } catch (e) {
      throw new Error('PPTX parsing failed. The file may be corrupted or password-protected.');
    }
  }
  throw new Error('Unsupported file type.');
}

const generate = async (req, res) => {
  let { inputText, mode, difficultyLevel, customInstruction } = req.body;

  // if a file was uploaded, get the text out of it first
  if (req.file) {
    try {
      inputText = await extractTextFromFile(req.file);
    } catch (err) {
      console.error('File extraction error:', err.message);
      return res.status(422).json({ error: 'Could not extract text from the uploaded file.' });
    }
  }

  // validate everything before sending to the AI
  const safeInput = typeof inputText === 'string' ? inputText : String(inputText ?? '');
  if (!safeInput.trim())
    return res.status(400).json({ error: 'Input text is required.' });
  inputText = safeInput;
  if (inputText.length > 500000)
    return res.status(400).json({ error: 'Input text must not exceed 500,000 characters.' });
  if (!VALID_MODES.includes(mode))
    return res.status(400).json({ error: `Mode must be one of: ${VALID_MODES.join(', ')}.` });
  if (difficultyLevel && !VALID_DIFFICULTIES.includes(difficultyLevel))
    return res.status(400).json({ error: `Difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}.` });

  const difficulty = difficultyLevel || 'medium';
  // strip newlines from custom instructions so they don't mess up the prompt
  const custom = (customInstruction || '').trim().replace(/[\r\n]/g, ' ').slice(0, 500);

  try {
    const outputText = await generateStudyContent({ inputText, mode, difficultyLevel: difficulty, customInstruction: custom });
    // save the session so the user can find it in their history later
    const session = await StudySession.create({
      userId: req.userId, inputText, outputText, mode, difficultyLevel: difficulty, customInstruction: custom,
    });
    res.json({ output: outputText, sessionId: session._id });
  } catch (err) {
    console.error('Generate error:', err.message);
    res.status(500).json({ error: 'Failed to generate content. Please try again.' });
  }
};

const getHistory = async (req, res) => {
  try {
    // get the user's sessions, newest first
    const sessions = await StudySession.find({ userId: req.userId }).sort({ createdAt: -1 }).select('-__v');
    res.json(sessions);
  } catch (err) {
    console.error('History error:', err.message);
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
};

const deleteSession = async (req, res) => {
  if (!req.params.id.match(/^[a-f\d]{24}$/i))
    return res.status(400).json({ error: 'Invalid session ID.' });
  try {
    // also check userId so users can't delete each other's sessions
    const session = await StudySession.findOne({ _id: req.params.id, userId: req.userId });
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    await session.deleteOne();
    res.json({ message: 'Session deleted.' });
  } catch (err) {
    console.error('Delete error:', err.message);
    res.status(500).json({ error: 'Failed to delete session.' });
  }
};

module.exports = { generate, getHistory, deleteSession };
