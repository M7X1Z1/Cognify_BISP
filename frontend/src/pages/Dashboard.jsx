import { useState } from 'react';
import StudyForm from '../components/StudyForm';
import OutputPanel from '../components/OutputPanel';
import { studyAPI } from '../api/client';

export default function Dashboard() {
  const [output, setOutput] = useState('');
  const [mode, setMode]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async (formData) => {
    setError('');
    setOutput('');
    setLoading(true);
    setMode(formData.get('mode'));
    try {
      const res = await studyAPI.generate(formData);
      setOutput(res.data.output);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div className="page-header">
        <h1>Cognify_BISP</h1>
        <p>Paste your material or upload a file and choose how you want it transformed.</p>
      </div>

      <div className="card">
        <StudyForm onSubmit={handleSubmit} loading={loading} />
      </div>

      {loading && (
        <div className="generating-bar">
          <span className="spinner" />
          Generating your content…
        </div>
      )}

      {error && (
        <div className="alert-error" style={{ marginTop: '1.5rem' }}>
          {error}
        </div>
      )}

      {output && <OutputPanel output={output} mode={mode} />}
    </div>
  );
}
