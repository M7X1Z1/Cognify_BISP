import { useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import QuizOutput from './QuizOutput';
import FlashcardsOutput from './FlashcardsOutput';
import { MODE_MAP } from '../constants/modes';

const FALLBACK = { label: 'Output', icon: '📄', color: '#4f46e5', bg: '#eef2ff' };

export default function OutputPanel({ output, mode }) {
  const [copied, setCopied] = useState(false);
  const meta = MODE_MAP[mode] || FALLBACK;

  const handleCopy = () => {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-${mode}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!output) return null;

  return (
    <div style={{
      marginTop: '2rem',
      background: 'var(--surface)',
      border: '1px solid var(--border-light)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-md)',
      overflow: 'hidden',
    }}>
      <div style={{
        background: 'var(--gradient)',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '0.3rem 0.6rem', fontSize: '1rem' }}>
            {meta.icon}
          </span>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Generated Output
            </div>
            <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em' }}>
              {meta.label}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleCopy}
            style={{
              background: copied ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              padding: '0.4rem 0.9rem',
              borderRadius: '6px',
              fontSize: '0.83rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {copied ? '✓ Copied' : '📋 Copy'}
          </button>
          <button
            onClick={handleDownload}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: 'rgba(255,255,255,0.85)',
              padding: '0.4rem 0.9rem',
              borderRadius: '6px',
              fontSize: '0.83rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            ⬇ Download
          </button>
        </div>
      </div>
      <div style={{
        padding: '1.5rem',
        fontFamily: "'Inter', monospace",
        fontSize: '0.9rem',
        lineHeight: '1.8',
        color: 'var(--text)',
        maxHeight: '520px',
        overflowY: 'auto',
      }}>
        {mode === 'summary' ? (
          <div
            className="summary-output"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(output)) }}
          />
        ) : mode === 'quiz' ? (
          <QuizOutput output={output} />
        ) : mode === 'flashcards' ? (
          <FlashcardsOutput output={output} />
        ) : (
          <pre className="output-text">{output}</pre>
        )}
      </div>
    </div>
  );
}
