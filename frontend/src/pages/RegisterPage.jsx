import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Zap, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../store';
import { registerThunk, selectAuth, clearError } from '../features/auth/store/authSlice';
import { ROUTES } from '../routes/routeConstants';
import { validators, getPasswordStrength } from '../utils/validators';
import './AuthPages.css';

const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector(selectAuth);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [localError, setLocalError] = useState('');
  const loading = status === 'loading';
  const pwStrength = getPasswordStrength(form.password);
  const strengthColors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (localError) setLocalError('');
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nameErr = validators.name(form.name);
    const emailErr = validators.email(form.email);
    const passErr = validators.password(form.password);
    if (nameErr || emailErr || passErr) { setLocalError(nameErr || emailErr || passErr || ''); return; }

    const result = await dispatch(registerThunk(form));
    if (registerThunk.fulfilled.match(result)) {
      toast.success(`Welcome to TaskFlow Pro, ${result.payload.user.name}! 🚀`);
      navigate(ROUTES.DASHBOARD);
    }
  };

  const displayError = localError || error;

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">⚡</div>
          <span className="auth-logo-text gradient-text">TaskFlow Pro</span>
        </div>

        <div className="auth-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join TaskFlow Pro — it's free!</p>
        </div>

        {displayError && (
          <div className="auth-error" style={{ marginBottom: '16px' }}>
            <AlertCircle size={15} /> {displayError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-wrapper">
              <User size={16} className="input-icon" />
              <input className="form-input input-with-icon" type="text" name="name"
                placeholder="Krunal Patel" value={form.name} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input className="form-input input-with-icon" type="email" name="email"
                placeholder="krunal@example.com" value={form.email} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input className="form-input input-with-icon" type={showPw ? 'text' : 'password'}
                name="password" placeholder="Min 6 characters" value={form.password}
                onChange={handleChange} style={{ paddingRight: '44px' }} />
              <button type="button" className="password-toggle" onClick={() => setShowPw(p => !p)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.password && (
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{
                    height: '3px', flex: 1, borderRadius: '2px',
                    background: pwStrength >= i ? strengthColors[pwStrength] : 'var(--border)',
                    transition: 'background 0.3s',
                  }} />
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <><span className="spinner-sm" /> Creating...</> : <><Zap size={16} /> Create Account</>}
          </button>
        </form>

        <div className="divider" style={{ margin: '20px 0' }}>or</div>
        <div className="auth-footer">
          Already have an account? <Link to={ROUTES.LOGIN}>Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
