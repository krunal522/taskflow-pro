import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Zap,
  AlertCircle,
  CheckCircle,
  Check,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../store';
import { loginThunk, selectAuth, clearError } from '../features/auth/store/authSlice';
import { ROUTES } from '../routes/routeConstants';
import { validators } from '../utils/validators';
import './AuthPages.css';

const REMEMBER_EMAIL_KEY = 'taskflow_saved_email';

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const { status, error: reduxError } = useAppSelector(selectAuth);
  const navigate = useNavigate();

  const [form, setForm] = useState(() => ({
    email: localStorage.getItem(REMEMBER_EMAIL_KEY) || '',
    password: '',
    rememberMe: !!localStorage.getItem(REMEMBER_EMAIL_KEY),
  }));

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isWakingServer, setIsWakingServer] = useState(false);

  const loading = status === 'loading';
  const slowTimerRef = useRef(null);

  // Monitor loading to show "Waking up server" if free tier takes > 2.5s
  useEffect(() => {
    if (loading) {
      slowTimerRef.current = setTimeout(() => {
        setIsWakingServer(true);
      }, 2500);
    } else {
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
      setIsWakingServer(false);
    }
    return () => {
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    };
  }, [loading]);

  const errors = {
    email: validators.email(form.email),
    password: form.password ? null : 'Password is required',
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setForm((prev) => ({ ...prev, [name]: val }));
    if (!touched[name]) {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }

    if (serverError) setServerError('');
    if (reduxError) dispatch(clearError());
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      email: true,
      password: true,
    });

    if (errors.email || errors.password) {
      toast.error('Please enter a valid email and password.');
      return;
    }

    // Handle remember me
    if (form.rememberMe) {
      localStorage.setItem(REMEMBER_EMAIL_KEY, form.email.trim());
    } else {
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
    }

    setServerError('');
    const result = await dispatch(
      loginThunk({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })
    );

    if (loginThunk.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.user.name}! 👋`);
      navigate(ROUTES.DASHBOARD);
    } else if (loginThunk.rejected.match(result)) {
      const errMsg = result.payload || 'Invalid credentials or server unavailable.';
      setServerError(errMsg);
    }
  };

  const displayError = serverError || reduxError;

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      <div className="auth-card" style={{ maxWidth: '440px' }}>
        <div className="auth-logo">
          <div className="auth-logo-icon">⚡</div>
          <span className="auth-logo-text gradient-text">TaskFlow Pro</span>
        </div>

        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your account to manage your tasks</p>
        </div>

        {/* Global Server Error Alert */}
        {displayError && (
          <div className="auth-error" style={{ marginBottom: '20px' }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Sign In Failed: </strong>
              <span>{displayError}</span>
            </div>
          </div>
        )}

        {/* Free tier server wake-up notice */}
        {isWakingServer && (
          <div className="auth-notice" style={{ marginBottom: '18px' }}>
            <Clock size={16} className="spin-slow" style={{ flexShrink: 0 }} />
            <span>Connecting to live server (waking up free-tier backend instance, please wait)...</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Email Address */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              <span>Email Address</span>
              {touched.email && !errors.email && (
                <span style={{ color: '#34d399', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Check size={12} /> Valid
                </span>
              )}
            </label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                id="login-email"
                className={`form-input input-with-icon ${touched.email && errors.email ? 'is-invalid' : ''} ${touched.email && !errors.email ? 'is-valid' : ''}`}
                type="email"
                name="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                autoComplete="email"
              />
              <div className="input-trailing">
                {touched.email && errors.email && <AlertCircle size={16} color="#ef4444" />}
                {touched.email && !errors.email && form.email && <CheckCircle size={16} color="#10b981" />}
              </div>
            </div>
            {touched.email && errors.email && (
              <div className="field-error">
                <AlertCircle size={13} /> {errors.email}
              </div>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <div className="form-label">
              <span>Password</span>
            </div>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                className={`form-input input-with-icon ${touched.password && errors.password ? 'is-invalid' : ''}`}
                type={showPw ? 'text' : 'password'}
                name="password"
                placeholder="Enter your account password"
                value={form.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                style={{ paddingRight: '48px' }}
                autoComplete="current-password"
              />
              <div className="input-trailing">
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPw((p) => !p)}
                  title={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {touched.password && errors.password && (
              <div className="field-error">
                <AlertCircle size={13} /> {errors.password}
              </div>
            )}
          </div>

          {/* Remember Me */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
            <label className="auth-checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={form.rememberMe}
                onChange={handleChange}
              />
              <span>Remember email</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg auth-submit"
            disabled={loading}
            style={{ marginTop: '12px' }}
          >
            {loading ? (
              <>
                <span className="spinner-sm" />
                <span>{isWakingServer ? 'Connecting to live server...' : 'Signing in...'}</span>
              </>
            ) : (
              <>
                <Zap size={16} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="divider" style={{ margin: '24px 0' }}>or</div>

        <div className="auth-footer" style={{ marginTop: '0' }}>
          Don't have an account? <Link to={ROUTES.REGISTER} style={{ fontWeight: 700 }}>Create an account free</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
