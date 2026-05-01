import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/api';
import toast from 'react-hot-toast';
import { Rocket, User, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'MEMBER' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters for security clearance.');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.signup(form);
      login(res.data);
      toast.success(`Account created! Welcome to the grid, ${res.data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
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
          <h1 className="auth-title">Create <span className="text-gradient">Account</span></h1>
          <p className="auth-subtitle">Join the professional workspace</p>
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
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '3rem' }}
                placeholder="Ex. John Doe"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          </div>

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
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Account Role</label>
            <div style={{ position: 'relative' }}>
              <ShieldCheck size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
              <select
                className="form-select"
                style={{ paddingLeft: '3rem' }}
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
              >
                <option value="MEMBER">Standard Member</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading} style={{ marginTop: '1.5rem' }}>
            {loading ? 'Creating account...' : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Sign Up <ArrowRight size={18} />
              </span>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}
