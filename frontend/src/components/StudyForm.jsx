import { useState, useRef } from 'react';
import { MODES } from '../constants/modes';

const DIFFICULTIES = [
  { value: 'easy',   label: 'Easy',   color: '#16a34a' },
  { value: 'medium', label: 'Medium', color: '#d97706' },
  { value: 'hard',   label: 'Hard',   color: '#dc2626' },
];

const ACCEPTED_TYPES = {
  'text/plain': true,
  'application/pdf': true,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
  'application/msword': true,
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': true,
  'application/vnd.ms-powerpoint': true,
};

const FILE_ACCEPT = '.txt,.pdf,.docx,.doc,.pptx,.ppt';
const MAX_FILE_SIZE = 20 * 1024 * 1024;

const formatFileSize = (bytes) =>
  bytes >= 1024 * 1024
    ? (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    : (bytes / 1024).toFixed(1) + ' KB';

const getFileIcon = (f) => {
  if (f.type === 'application/pdf') return '📄';
  if (f.type.includes('word') || f.type.includes('msword')) return '📝';
  if (f.type.includes('presentation') || f.type.includes('powerpoint')) return '📊';
  return '📃';
};

export default function StudyForm({ onSubmit, loading }) {
  const [inputText, setInputText]         = useState('');
  const [mode, setMode]                   = useState(MODES[0].value);
  const [difficulty, setDifficulty]       = useState(DIFFICULTIES[1].value);
  const [customInstruction, setCustomInstruction] = useState('');
  const [file, setFile]                   = useState(null);
  const [fileError, setFileError]         = useState('');
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!ACCEPTED_TYPES[f.type]) {
      setFileError('Unsupported file type. Please upload a .txt, .pdf, .docx, or .pptx file.');
      setFile(null);
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setFileError('File must be under 20 MB.');
      setFile(null);
      return;
    }
    setFileError('');
    setFile(f);
    setInputText('');
  };

  const clearFile = () => {
    setFile(null);
    setFileError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!file && trimmed.length === 0) return;

    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    } else {
      formData.append('inputText', trimmed);
    }
    formData.append('mode', mode);
    formData.append('difficultyLevel', difficulty);
    formData.append('customInstruction', customInstruction.trim());
    onSubmit(formData);
  };

  const trimmedLength = inputText.trim().length;
  const charCount = inputText.length;
  const overLimit = charCount > 500000;
  const isDisabled = loading || overLimit || (!file && trimmedLength === 0);
  const uploadDisabled = trimmedLength > 0;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      <div className="form-group">
        <label htmlFor="inputText">Study Material</label>
        <textarea
          id="inputText"
          className="form-control"
          rows={7}
          placeholder="Paste your notes, textbook excerpt, or any study content here…"
          value={inputText}
          onChange={(e) => { setInputText(e.target.value); clearFile(); }}
          disabled={!!file}
          style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.7 }}
        />
        <span style={{ fontSize: '0.78rem', marginTop: '0.2rem', color: overLimit ? '#dc2626' : 'var(--text-light)', display: 'block' }}>
          {charCount.toLocaleString()} / 500,000 characters{overLimit && ' — too long'}
        </span>
      </div>

      <div className="form-group">
        <label>Or upload a file</label>
        <div
          className={`upload-zone${file ? ' upload-zone--active' : ''}${uploadDisabled ? ' upload-zone--disabled' : ''}`}
          onClick={() => !uploadDisabled && fileRef.current?.click()}
        >
          {file ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.5rem' }}>{getFileIcon(file)}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary)' }}>{file.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatFileSize(file.size)}</div>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                style={{
                  background: 'none', border: '1px solid #fca5a5', color: '#dc2626',
                  borderRadius: '6px', padding: '0.25rem 0.6rem', fontSize: '0.78rem',
                  cursor: 'pointer', marginLeft: '0.5rem',
                }}
              >
                Remove
              </button>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>📂</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>Click to upload a file</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Supports .txt, .pdf, .docx, .pptx — up to 20 MB
              </div>
            </>
          )}
          <input
            type="file"
            accept={FILE_ACCEPT}
            ref={fileRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            disabled={uploadDisabled}
          />
        </div>
        {fileError && <p className="error-msg">{fileError}</p>}
      </div>

      <div className="form-group">
        <label>Output Mode</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '0.65rem' }}>
          {MODES.map((m) => {
            const active = mode === m.value;
            return (
              <label
                key={m.value}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.6rem',
                  padding: '0.85rem 1rem',
                  border: `2px solid ${active ? 'var(--primary)' : 'var(--border-light)'}`,
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  background: active ? 'linear-gradient(135deg, #f5f3ff 0%, #eef2ff 100%)' : 'var(--surface)',
                  transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
                  boxShadow: active ? '0 0 0 3px var(--primary-glow)' : 'none',
                }}
              >
                <input type="radio" name="mode" value={m.value} checked={active} onChange={() => setMode(m.value)} style={{ display: 'none' }} />
                <span style={{ fontSize: '1.3rem', lineHeight: 1, marginTop: '0.05rem' }}>{m.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: active ? 'var(--primary)' : 'var(--text)' }}>{m.label}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.15rem', lineHeight: 1.4 }}>{m.desc}</div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div className="form-group">
        <label>Difficulty Level</label>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {DIFFICULTIES.map((d) => {
            const active = difficulty === d.value;
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => setDifficulty(d.value)}
                style={{
                  padding: '0.45rem 1.1rem',
                  borderRadius: '999px',
                  border: `2px solid ${active ? d.color : 'var(--border)'}`,
                  background: active ? d.color : 'transparent',
                  color: active ? '#fff' : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="customInstruction">
          Custom Instructions{' '}
          <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(optional)</span>
        </label>
        <input
          id="customInstruction"
          type="text"
          className="form-control"
          placeholder="e.g. Focus on dates and events, use examples, max 5 bullet points…"
          value={customInstruction}
          onChange={(e) => setCustomInstruction(e.target.value)}
          maxLength={500}
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={isDisabled}
        style={{ alignSelf: 'flex-start', padding: '0.7rem 2rem', fontSize: '0.95rem', fontWeight: 700 }}
      >
        {loading ? 'Generating…' : '✨ Generate'}
      </button>
    </form>
  );
}
