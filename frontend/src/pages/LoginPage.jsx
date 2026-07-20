import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Zap, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../store';
import { loginThunk, selectAuth, clearError } from '../features/auth/store/authSlice';
import { ROUTES } from '../routes/routeConstants';
import { validators } from '../utils/validators';
import './AuthPages.css';

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector(selectAuth);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [localError, setLocalError] = useState('');
  const loading = status === 'loading';

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (localError) setLocalError('');
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailErr = validators.email(form.email);
    const passErr = validators.password(form.password);
    if (emailErr || passErr) { setLocalError(emailErr || passErr || ''); return; }

    const result = await dispatch(loginThunk(form));
    if (loginThunk.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.user.name}! 👋`);
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
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your account to continue</p>
        </div>

        {displayError && (
          <div className="auth-error" style={{ marginBottom: '16px' }}>
            <AlertCircle size={15} /> {displayError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
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
                name="password" placeholder="Enter your password" value={form.password}
                onChange={handleChange} style={{ paddingRight: '44px' }} />
              <button type="button" className="password-toggle" onClick={() => setShowPw(p => !p)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <><span className="spinner-sm" /> Signing in...</> : <><Zap size={16} /> Sign In</>}
          </button>
        </form>

        <div className="divider" style={{ margin: '20px 0' }}>or</div>
        <div className="auth-footer">
          Don't have an account? <Link to={ROUTES.REGISTER}>Create one free</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
