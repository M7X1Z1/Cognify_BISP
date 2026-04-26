import { useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { MODE_MAP } from '../constants/modes';
import { parseQuiz, parseFlashcards } from '../utils/outputParsers';

const FALLBACK = { icon: '📄', color: '#4f46e5' };
const truncate = (str, max) => str.length > max ? str.slice(0, max) + '…' : str;

const stripMarkdown = (s) =>
  s.replace(/```[\s\S]*?```/g, '')
   .replace(/[*_`#>]+/g, '')
   .replace(/\s+/g, ' ')
   .trim();

function getPreview(output, mode) {
  if (mode === 'quiz') {
    const qs = parseQuiz(output);
    if (qs.length) return `📝 ${qs.length} questions • Q1: ${truncate(qs[0].question, 110)}`;
  }
  if (mode === 'flashcards') {
    const cards = parseFlashcards(output);
    if (cards.length) return `🃏 ${cards.length} cards • Q1: ${truncate(cards[0].question, 110)}`;
  }
  return truncate(stripMarkdown(output), 160);
}

function ExpandedSummary({ output }) {
  return (
    <div
      className="summary-output"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(output)) }}
    />
  );
}

function ExpandedQuiz({ output }) {
  const questions = parseQuiz(output);
  if (!questions.length) {
    return <pre className="output-text">{output}</pre>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      {questions.map((q, i) => (
        <div key={i} style={{ borderLeft: '3px solid var(--border)', paddingLeft: '0.85rem' }}>
          <p style={{ fontWeight: 600, marginBottom: '0.4rem', lineHeight: 1.5 }}>
            Q{i + 1}. {q.question}
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 0.4rem 0', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {['A', 'B', 'C', 'D'].map((letter) => {
              const isCorrect = letter === q.answer;
              return (
                <li
                  key={letter}
                  style={{
                    fontSize: '0.875rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    background: isCorrect ? '#dcfce7' : 'transparent',
                    color: isCorrect ? '#166534' : 'var(--text)',
                    fontWeight: isCorrect ? 600 : 400,
                  }}
                >
                  <b>{letter})</b> {q.options[letter]}{isCorrect && ' ✓'}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ExpandedFlashcards({ output }) {
  const cards = parseFlashcards(output);
  if (!cards.length) {
    return <pre className="output-text">{output}</pre>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {cards.map((c, i) => (
        <div
          key={i}
          style={{
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius)',
            padding: '0.85rem 1rem',
            background: 'var(--surface)',
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
            Card {i + 1}
          </div>
          <p style={{ fontSize: '0.875rem', margin: '0 0 0.4rem 0', lineHeight: 1.55 }}>
            <b>Q:</b> {c.question}
          </p>
          <p style={{ fontSize: '0.875rem', margin: 0, lineHeight: 1.55, color: 'var(--text-muted)' }}>
            <b>A:</b> {c.answer}
          </p>
        </div>
      ))}
    </div>
  );
}

function ExpandedView({ output, mode }) {
  if (mode === 'summary') return <ExpandedSummary output={output} />;
  if (mode === 'quiz') return <ExpandedQuiz output={output} />;
  if (mode === 'flashcards') return <ExpandedFlashcards output={output} />;
  return <pre className="output-text">{output}</pre>;
}

export default function SessionCard({ session, onDelete }) {
  const [expanded, setExpanded]     = useState(false);
  const [deleteState, setDeleteState] = useState('idle');

  const handleConfirmDelete = async () => {
    setDeleteState('deleting');
    try { await onDelete(session._id); } finally { setDeleteState('idle'); }
  };

  const date = new Date(session.createdAt).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const meta = MODE_MAP[session.mode] || FALLBACK;
  const preview = getPreview(session.outputText, session.mode);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', borderLeft: `4px solid ${meta.color}`, padding: '1.25rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '1.1rem' }}>{meta.icon}</span>
          <span className={`badge badge-${session.mode}`}>{meta.label || session.mode}</span>
          <span className={`badge badge-${session.difficultyLevel}`}>{session.difficultyLevel}</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginLeft: '0.25rem' }}>{date}</span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
          {deleteState === 'confirming' ? (
            <>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>Delete this session?</span>
              <button className="btn btn-danger" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }} onClick={handleConfirmDelete}>
                Yes, delete
              </button>
              <button className="btn btn-ghost" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setDeleteState('idle')}>
                Cancel
              </button>
            </>
          ) : (
            <button
              className="btn btn-outline-danger"
              style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
              onClick={() => setDeleteState('confirming')}
              disabled={deleteState === 'deleting'}
            >
              {deleteState === 'deleting' ? 'Deleting…' : 'Delete'}
            </button>
          )}
        </div>
      </div>

      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', borderLeft: '3px solid var(--border)', paddingLeft: '0.75rem', lineHeight: 1.5 }}>
        {truncate(session.inputText, 90)}
      </p>

      {expanded ? (
        <div style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.7 }}>
          <ExpandedView output={session.outputText} mode={session.mode} />
        </div>
      ) : (
        <p style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.7 }}>
          {preview}
        </p>
      )}

      <button
        className="btn btn-ghost"
        style={{ alignSelf: 'flex-start', padding: '0.3rem 0.85rem', fontSize: '0.8rem' }}
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? '▲ Show less' : '▼ Show full output'}
      </button>
    </div>
  );
}
