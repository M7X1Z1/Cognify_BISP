import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studyAPI } from '../api/client';
import SessionCard from '../components/SessionCard';

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await studyAPI.getHistory();
      setSessions(res.data);
    } catch {
      setError('Failed to load history.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await studyAPI.deleteSession(id);
      setSessions((prev) => prev.filter((s) => s._id !== id));
    } catch {
      setError('Failed to delete session. Please try again.');
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div className="page-header">
        <h1>Session History</h1>
        <p>All your past study sessions, most recent first.</p>
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', padding: '2rem 0' }}>
          <span className="spinner" />
          Loading history…
        </div>
      )}

      {error && (
        <div className="alert-error" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {!loading && !error && sessions.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📚</div>
          <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.4rem' }}>
            No sessions yet
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Head to the Dashboard to generate your first study output.
          </p>
          <Link to="/dashboard" className="btn btn-primary" style={{ display: 'inline-flex' }}>
            ✨ Go to Dashboard
          </Link>
        </div>
      )}

      {sessions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sessions.map((session) => (
            <SessionCard key={session._id} session={session} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
