import { useState } from 'react';

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

function parseQuiz(text) {
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
    console.warn('[QuizOutput] JSON parse failed, trying text parser', e);
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
    const aLine = lines.find(l => /^[Aa][.)]\s*\S/.test(l));
    const bLine = lines.find(l => /^[Bb][.)]\s*\S/.test(l));
    const cLine = lines.find(l => /^[Cc][.)]\s*\S/.test(l));
    const dLine = lines.find(l => /^[Dd][.)]\s*\S/.test(l));
    const answerLine = lines.find(l => /answer\s*:/i.test(l));
    if (!qLine || !answerLine) return null;
    const options = {
      A: aLine ? aLine.replace(/^[Aa][.)]\s*/, '') : '',
      B: bLine ? bLine.replace(/^[Bb][.)]\s*/, '') : '',
      C: cLine ? cLine.replace(/^[Cc][.)]\s*/, '') : '',
      D: dLine ? dLine.replace(/^[Dd][.)]\s*/, '') : '',
    };
    if (Object.values(options).some(v => !v)) return null;
    return {
      question: qLine.replace(/^(Q\s*\d*\s*:|Question\s*\d+\s*:|\d+[.)]\s*)/i, '').trim(),
      options,
      answer: answerLine.replace(/^.*answer\s*:\s*/i, '').trim().charAt(0).toUpperCase(),
    };
  }).filter(Boolean);
}

export default function QuizOutput({ output }) {
  const questions = parseQuiz(output);
  const [selected, setSelected] = useState({});
  const [checked, setChecked] = useState({});

  if (!questions.length) {
    return (
      <div>
        <p style={{ color: '#dc2626', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
          Could not parse quiz format. Showing raw output:
        </p>
        <pre className="output-text">{output}</pre>
      </div>
    );
  }

  return (
    <div className="quiz-output">
      {questions.map((q, idx) => {
        const userAnswer = selected[idx];
        const isChecked = checked[idx];
        const isCorrect = userAnswer === q.answer;

        return (
          <div key={idx} className={`quiz-question ${isChecked ? (isCorrect ? 'correct' : 'incorrect') : ''}`}>
            <p className="quiz-q-text">
              <span className="quiz-q-num">Q{idx + 1}.</span> {q.question}
            </p>
            <div className="quiz-options">
              {Object.entries(q.options).map(([letter, text]) => {
                const isSelected = userAnswer === letter;
                const showResult = isChecked;
                const isRightAnswer = letter === q.answer;
                let optionClass = 'quiz-option';
                if (showResult && isRightAnswer) optionClass += ' option-correct';
                else if (showResult && isSelected && !isRightAnswer) optionClass += ' option-wrong';
                else if (isSelected) optionClass += ' option-selected';

                return (
                  <button
                    key={letter}
                    className={optionClass}
                    onClick={() => !isChecked && setSelected(s => ({ ...s, [idx]: letter }))}
                    disabled={isChecked}
                  >
                    <span className="option-letter">{letter}</span>
                    <span>{text}</span>
                  </button>
                );
              })}
            </div>
            {!isChecked ? (
              <button
                className="btn-check"
                onClick={() => setChecked(c => ({ ...c, [idx]: true }))}
                disabled={!userAnswer}
              >
                Check Answer
              </button>
            ) : (
              <p className={`quiz-feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
                {isCorrect ? '✓ Correct!' : `✗ Wrong — correct answer: ${q.answer}`}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
