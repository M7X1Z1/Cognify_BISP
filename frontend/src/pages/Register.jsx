import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AuthCard from '../components/AuthCard';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.register({ email: form.email, password: form.password });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Create an account" subtitle="Start learning smarter with AI" icon="✨" error={error}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email" name="email" type="email" className="form-control"
            placeholder="you@example.com" value={form.email}
            onChange={handleChange} required autoComplete="email"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password" name="password" type="password" className="form-control"
            placeholder="Min. 8 characters" value={form.password}
            onChange={handleChange} required autoComplete="new-password"
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword" name="confirmPassword" type="password" className="form-control"
            placeholder="Repeat your password" value={form.confirmPassword}
            onChange={handleChange} required autoComplete="new-password"
          />
        </div>
        <button
          type="submit" className="btn btn-primary" disabled={loading}
          style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.95rem', fontWeight: 700, marginTop: '0.25rem' }}
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
      </p>
    </AuthCard>
  );
}
