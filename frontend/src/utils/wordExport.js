import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { parseQuiz, parseFlashcards } from './outputParsers';

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const MODE_TITLES = {
  summary: 'Summary',
  quiz: 'Quiz',
  flashcards: 'Flashcards',
};

function buildSummaryBody(output) {
  return DOMPurify.sanitize(marked.parse(output));
}

function buildQuizBody(output) {
  const questions = parseQuiz(output);
  if (!questions.length) {
    return `<pre>${escapeHtml(output)}</pre>`;
  }
  return questions
    .map((q, i) => {
      const opts = ['A', 'B', 'C', 'D']
        .map((letter) => `<li><b>${letter})</b> ${escapeHtml(q.options[letter])}</li>`)
        .join('');
      return `
        <h3>Q${i + 1}. ${escapeHtml(q.question)}</h3>
        <ul style="list-style:none;padding-left:1em;">${opts}</ul>
        <p><b>Correct answer:</b> ${escapeHtml(q.answer)}</p>
      `;
    })
    .join('');
}

function buildFlashcardsBody(output) {
  const cards = parseFlashcards(output);
  if (!cards.length) {
    return `<pre>${escapeHtml(output)}</pre>`;
  }
  return cards
    .map(
      (c, i) => `
        <h3>Card ${i + 1}</h3>
        <p><b>Q:</b> ${escapeHtml(c.question)}</p>
        <p><b>A:</b> ${escapeHtml(c.answer)}</p>
      `
    )
    .join('');
}

function buildBody(output, mode) {
  if (mode === 'summary') return buildSummaryBody(output);
  if (mode === 'quiz') return buildQuizBody(output);
  if (mode === 'flashcards') return buildFlashcardsBody(output);
  return `<pre>${escapeHtml(output)}</pre>`;
}

export function downloadAsWord(output, mode) {
  const title = MODE_TITLES[mode] || 'Output';
  const body = buildBody(output, mode);

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>Cognify — ${escapeHtml(title)}</title>
<style>
  body { font-family: Calibri, Arial, sans-serif; line-height: 1.5; color: #1a1523; }
  h1 { color: #7c3aed; }
  h2, h3 { color: #4f46e5; margin-top: 1.2em; }
  ul, ol { margin-left: 1.2em; }
  pre { white-space: pre-wrap; font-family: Consolas, monospace; }
</style>
</head>
<body>
  <h1>Cognify — ${escapeHtml(title)}</h1>
  ${body}
</body>
</html>`;

  const blob = new Blob([html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `cognify-${mode}-${Date.now()}.doc`;
  anchor.click();
  URL.revokeObjectURL(url);
}
