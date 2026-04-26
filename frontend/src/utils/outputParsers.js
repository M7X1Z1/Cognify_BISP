// Shared parsers for AI output. Used by both the rendering components
// (QuizOutput, FlashcardsOutput) and the Word export utility.

// Finds and returns the first valid JSON array in a string.
// Skips brackets inside quoted strings so question text like
// "Which of [A, B, C] is correct?" doesn't break the extraction.
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

export function parseQuiz(text) {
  // Try JSON first — the backend requests this format from the AI
  try {
    const jsonStr = extractJsonArray(text);
    if (jsonStr) {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].question) {
        const questions = parsed.map(q => ({
          question: String(q.question || '').trim(),
          options: {
            A: String(q.options?.A || '').trim(),
            B: String(q.options?.B || '').trim(),
            C: String(q.options?.C || '').trim(),
            D: String(q.options?.D || '').trim(),
          },
          // Pull just the letter — handles "A", "A) text", "Answer is B", etc.
          answer: (String(q.answer || '').match(/[ABCD]/i)?.[0] || '').toUpperCase(),
        })).filter(q =>
          q.question &&
          q.options.A && q.options.B && q.options.C && q.options.D &&
          /^[ABCD]$/.test(q.answer)
        );
        if (questions.length > 0) return questions;
      }
    }
  } catch (e) {
    console.warn('[parseQuiz] JSON parse failed, trying text parser', e);
  }

  // Fallback: parse plain text if the AI didn't return JSON
  const cleaned = text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/^#+\s*/gm, '')
    .trim();

  let blocks = cleaned.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);

  const hasQuestionAndAnswer = b =>
    /Q[\s\d]*:/i.test(b) && /answer\s*:/i.test(b);

  if (!blocks.some(hasQuestionAndAnswer)) {
    blocks = cleaned
      .split(/\n(?=Q\s*\d*\s*:|Question\s*\d+\s*:|\d+[.)]\s)/i)
      .map(b => b.trim())
      .filter(Boolean);
  }

  return blocks.map(block => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    const qLine = lines.find(l =>
      /^Q\s*\d*\s*:/i.test(l) ||
      /^Question\s*\d+\s*:/i.test(l) ||
      /^\d+[.)]\s+\S/.test(l)
    );
    const optionALine = lines.find(l => /^[Aa][.)]\s*\S/.test(l));
    const optionBLine = lines.find(l => /^[Bb][.)]\s*\S/.test(l));
    const optionCLine = lines.find(l => /^[Cc][.)]\s*\S/.test(l));
    const optionDLine = lines.find(l => /^[Dd][.)]\s*\S/.test(l));
    const answerLine = lines.find(l => /answer\s*:/i.test(l));
    if (!qLine || !answerLine) return null;
    const options = {
      A: optionALine ? optionALine.replace(/^[Aa][.)]\s*/, '') : '',
      B: optionBLine ? optionBLine.replace(/^[Bb][.)]\s*/, '') : '',
      C: optionCLine ? optionCLine.replace(/^[Cc][.)]\s*/, '') : '',
      D: optionDLine ? optionDLine.replace(/^[Dd][.)]\s*/, '') : '',
    };
    if (Object.values(options).some(v => !v)) return null;
    return {
      question: qLine.replace(/^(Q\s*\d*\s*:|Question\s*\d+\s*:|\d+[.)]\s*)/i, '').trim(),
      options,
      answer: answerLine.replace(/^.*answer\s*:\s*/i, '').trim().charAt(0).toUpperCase(),
    };
  }).filter(Boolean);
}

export function parseFlashcards(text) {
  const blocks = text.trim().split(/\n\s*\n/);
  return blocks
    .map(block => {
      const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean);
      const qIdx = lines.findIndex(l => l.startsWith('Q:'));
      const aIdx = lines.findIndex(l => l.startsWith('A:'));
      if (qIdx === -1 || aIdx === -1) return null;
      const question = lines.slice(qIdx, aIdx).join(' ').replace(/^Q:\s*/, '');
      const answer = lines.slice(aIdx).join(' ').replace(/^A:\s*/, '');
      return { question, answer };
    })
    .filter(Boolean);
}
