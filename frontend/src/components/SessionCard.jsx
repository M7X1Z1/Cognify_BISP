import { useState } from 'react';
import { MODE_MAP } from '../constants/modes';

const FALLBACK = { icon: '📄', color: '#4f46e5' };
const truncate = (str, max) => str.length > max ? str.slice(0, max) + '…' : str;

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
  const preview = truncate(session.outputText, 140);

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

      <p style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
        {expanded ? session.outputText : preview}
      </p>

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
