const { GoogleGenerativeAI } = require('@google/generative-ai');

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// these get added to the prompt so Gemini adjusts its language complexity
const difficultyGuide = {
  easy: 'Use very simple vocabulary and short sentences suitable for beginners with no prior knowledge.',
  medium: 'Use clear, moderately detailed language suitable for intermediate learners with some background.',
  hard: 'Use precise technical terminology and in-depth analysis suitable for advanced learners.',
};

// each mode has its own instruction telling Gemini what format to return
const modeSystemPrompts = {
  summary:
    'You are a study assistant. Summarize the provided text into concise bullet points highlighting only the key ideas and important details.',
  quiz:
    'Generate exactly 5 multiple-choice questions based on the material below.\nReturn ONLY a valid JSON array — no explanation, no markdown, no code fences, no extra text before or after.\nFormat:\n[\n  {\n    "question": "question text here",\n    "options": { "A": "option text", "B": "option text", "C": "option text", "D": "option text" },\n    "answer": "A"\n  }\n]\nThe "answer" field must be exactly one uppercase letter: A, B, C, or D.',
  flashcards:
    'Generate 8-10 flashcard pairs based on the material below.\nUse EXACTLY this format for every card — no extra text, no numbering:\n\nQ: [question or term]\nA: [answer or definition]\n\nSeparate each card with a blank line.',
};

// builds the full prompt by combining the mode instructions, difficulty, any custom note, and the actual text
function buildPrompt(mode, difficulty, customInstruction, inputText) {
  const base = modeSystemPrompts[mode] || modeSystemPrompts.summary;
  const diffNote = `\n\nDifficulty level: ${difficulty}. ${difficultyGuide[difficulty] || difficultyGuide.medium}`;
  const custom = customInstruction ? `\n\nAdditional instructions from the user: ${customInstruction}` : '';
  return base + diffNote + custom + '\n\nText to process:\n' + inputText;
}

// Gemini sometimes adds extra text around the JSON for quiz mode
// this walks through the response and pulls out just the [...] part
function extractJsonArray(text) {
  const start = text.indexOf('[');
  if (start === -1) return null;
  let depth = 0, inString = false, escape = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '[') depth++;
    else if (ch === ']') { depth--; if (depth === 0) return text.slice(start, i + 1); }
  }
  return null;
}

async function generateStudyContent({ inputText, mode, difficultyLevel, customInstruction }) {
  const prompt = buildPrompt(
    mode,
    difficultyLevel || 'medium',
    customInstruction || '',
    inputText
  );

  const model = client.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  if (!text) throw new Error('No text content returned from AI.');

  // for quiz mode, try to return clean JSON so the frontend can parse it directly
  if (mode === 'quiz') {
    const candidate = extractJsonArray(text);
    if (candidate) {
      try {
        JSON.parse(candidate);
        return candidate;
      } catch (e) {
        // if it's not valid JSON just return the raw text, the frontend will handle it
      }
    }
  }

  return text;
}

module.exports = { generateStudyContent };
