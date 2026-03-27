import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', adminCode: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault(); setError(''); 
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.adminCode);
      toast.success(`Welcome, ${user.name}! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-logo">
          <div className="auth-logo-title display-title">✦ ACCIO</div>
          <div className="auth-logo-sub">Campus Lost & Found Portal</div>
        </div>
        <h2 style={{fontSize:'20px',fontWeight:700,marginBottom:'24px',color:'var(--text-primary)'}}>Create your account</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input name="name" className="form-control" placeholder="Your full name" value={form.name} onChange={handle} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input name="email" type="email" className="form-control" placeholder="you@campus.edu" value={form.email} onChange={handle} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input name="password" type="password" className="form-control" placeholder="Min. 6 characters" value={form.password} onChange={handle} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input name="confirm" type="password" className="form-control" placeholder="Repeat password" value={form.confirm} onChange={handle} required />
            </div>
          </div>
          <div style={{marginBottom:'16px'}}>
            <button type="button" onClick={() => setShowAdmin(!showAdmin)} className="btn btn-outline btn-sm" style={{fontSize:'12px'}}>
              {showAdmin ? '▲ Hide' : '▼ Admin Code (optional)'}
            </button>
          </div>
          {showAdmin && (
            <div className="form-group">
              <label className="form-label">Admin Access Code</label>
              <input name="adminCode" className="form-control" placeholder="Enter admin code to get admin access" value={form.adminCode} onChange={handle} />
            </div>
          )}
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? '⏳ Creating account...' : '✓ Create Account'}
          </button>
        </form>
        <div className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
