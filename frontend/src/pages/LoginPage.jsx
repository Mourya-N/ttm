import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/api';
import toast from 'react-hot-toast';
import { Rocket, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(form);
      login(res.data);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Rocket size={32} color="#fff" />
          </div>
          <h1 className="auth-title">Team <span className="text-gradient">Task Manager</span></h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '1rem',
              fontSize: '0.85rem',
              color: '#ef4444',
              fontWeight: 600,
              textAlign: 'center',
              marginBottom: '1.5rem'
            }}>{error}</div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '3rem' }}
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '3rem' }}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading} style={{ marginTop: '1.5rem' }}>
            {loading ? 'Signing in...' : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Sign In <ArrowRight size={18} />
              </span>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          New to the platform?{' '}
          <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>Create Account</Link>
        </div>
      </div>
    </div>
  );
}
