import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AuthCard from '../components/AuthCard';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to continue learning" icon="🎓" error={error}>
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
            placeholder="••••••••" value={form.password}
            onChange={handleChange} required autoComplete="current-password"
          />
        </div>
        <button
          type="submit" className="btn btn-primary" disabled={loading}
          style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.95rem', fontWeight: 700, marginTop: '0.25rem' }}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ fontWeight: 600 }}>Create one</Link>
      </p>
    </AuthCard>
  );
}
