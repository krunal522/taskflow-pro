import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Zap,
  AlertCircle,
  CheckCircle,
  Check,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../store';
import { registerThunk, selectAuth, clearError } from '../features/auth/store/authSlice';
import { ROUTES } from '../routes/routeConstants';
import { validators, getPasswordEvaluation } from '../utils/validators';
import './AuthPages.css';

const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const { status, error: reduxError } = useAppSelector(selectAuth);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: true,
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    agreeTerms: false,
  });

  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
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

  // Compute live validation errors
  const errors = {
    name: validators.name(form.name),
    email: validators.email(form.email),
    password: validators.password(form.password),
    confirmPassword: validators.confirmPassword(form.password, form.confirmPassword),
    agreeTerms: form.agreeTerms ? null : 'You must accept terms & privacy policy to continue',
  };

  const pwEval = getPasswordEvaluation(form.password);

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

    // Mark all fields as touched to reveal any errors
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      agreeTerms: true,
    });

    // Check if any validation errors exist
    if (errors.name || errors.email || errors.password || errors.confirmPassword || errors.agreeTerms) {
      toast.error('Please fix the errors in the form before submitting.');
      return;
    }

    setServerError('');
    const result = await dispatch(
      registerThunk({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })
    );

    if (registerThunk.fulfilled.match(result)) {
      toast.success(`Account created! Welcome, ${result.payload.user.name} 🚀`);
      navigate(ROUTES.DASHBOARD);
    } else if (registerThunk.rejected.match(result)) {
      const errMsg = result.payload || 'Registration failed. Please try again.';
      setServerError(errMsg);
    }
  };

  const displayError = serverError || reduxError;
  const isDuplicateEmail = displayError && displayError.toLowerCase().includes('already registered');

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      <div className="auth-card" style={{ maxWidth: '480px' }}>
        <div className="auth-logo">
          <div className="auth-logo-icon">⚡</div>
          <span className="auth-logo-text gradient-text">TaskFlow Pro</span>
        </div>

        <div className="auth-header">
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Professional task management for developers and teams</p>
        </div>

        {/* Global Server Error Alert */}
        {displayError && (
          <div className="auth-error" style={{ marginBottom: '20px' }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Registration Failed: </strong>
              <span>{displayError}</span>
              {isDuplicateEmail && (
                <div style={{ marginTop: '6px' }}>
                  <Link to={ROUTES.LOGIN} style={{ color: '#fff', textDecoration: 'underline', fontWeight: 600 }}>
                    Click here to Sign In instead →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Free tier server wake-up notice */}
        {isWakingServer && (
          <div className="auth-notice" style={{ marginBottom: '18px' }}>
            <Clock size={16} className="spin-slow" style={{ flexShrink: 0 }} />
            <span>Connecting to live server (waking up free-tier backend instance, thanks for your patience)...</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">
              <span>Full Name</span>
              {touched.name && !errors.name && (
                <span style={{ color: '#34d399', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Check size={12} /> Valid
                </span>
              )}
            </label>
            <div className="input-wrapper">
              <User size={16} className="input-icon" />
              <input
                id="register-name"
                className={`form-input input-with-icon ${touched.name && errors.name ? 'is-invalid' : ''} ${touched.name && !errors.name ? 'is-valid' : ''}`}
                type="text"
                name="name"
                placeholder="e.g. Krunal Patel"
                value={form.name}
                onChange={handleChange}
                onBlur={() => handleBlur('name')}
                autoComplete="name"
              />
              <div className="input-trailing">
                {touched.name && errors.name && <AlertCircle size={16} color="#ef4444" />}
                {touched.name && !errors.name && form.name && <CheckCircle size={16} color="#10b981" />}
              </div>
            </div>
            {touched.name && errors.name && (
              <div className="field-error">
                <AlertCircle size={13} /> {errors.name}
              </div>
            )}
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-email">
              <span>Work / Personal Email</span>
              {touched.email && !errors.email && (
                <span style={{ color: '#34d399', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Check size={12} /> Valid
                </span>
              )}
            </label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                id="register-email"
                className={`form-input input-with-icon ${touched.email && (errors.email || isDuplicateEmail) ? 'is-invalid' : ''} ${touched.email && !errors.email && !isDuplicateEmail ? 'is-valid' : ''}`}
                type="email"
                name="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                autoComplete="email"
              />
              <div className="input-trailing">
                {touched.email && (errors.email || isDuplicateEmail) && <AlertCircle size={16} color="#ef4444" />}
                {touched.email && !errors.email && !isDuplicateEmail && form.email && <CheckCircle size={16} color="#10b981" />}
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
              {form.password && (
                <span style={{ fontSize: '11px', fontWeight: 600, color: pwEval.color }}>
                  {pwEval.label}
                </span>
              )}
            </div>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                className={`form-input input-with-icon ${touched.password && errors.password ? 'is-invalid' : ''} ${touched.password && !errors.password ? 'is-valid' : ''}`}
                type={showPw ? 'text' : 'password'}
                name="password"
                placeholder="Enter a secure password (min 6-8 chars)"
                value={form.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                style={{ paddingRight: '48px' }}
                autoComplete="new-password"
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

            {/* Password Strength Indicator */}
            {form.password && (
              <div className="password-strength-container">
                <div className="password-strength-bars">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className="password-strength-bar"
                      style={{
                        background: pwEval.score >= level ? pwEval.color : 'var(--border)',
                      }}
                    />
                  ))}
                </div>

                {/* Requirements Checklist */}
                <div className="password-checklist">
                  {pwEval.criteria.map((item) => (
                    <div
                      key={item.id}
                      className={`password-criterion ${item.met ? 'met' : ''}`}
                    >
                      {item.met ? <Check size={12} /> : <span style={{ width: 12, textAlign: 'center', opacity: 0.5 }}>•</span>}
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {touched.password && errors.password && (
              <div className="field-error">
                <AlertCircle size={13} /> {errors.password}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-confirm-password">
              <span>Confirm Password</span>
              {touched.confirmPassword && !errors.confirmPassword && form.confirmPassword && (
                <span style={{ color: '#34d399', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Check size={12} /> Matched
                </span>
              )}
            </label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                id="register-confirm-password"
                className={`form-input input-with-icon ${touched.confirmPassword && errors.confirmPassword ? 'is-invalid' : ''} ${touched.confirmPassword && !errors.confirmPassword && form.confirmPassword ? 'is-valid' : ''}`}
                type={showConfirmPw ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Re-type your password"
                value={form.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur('confirmPassword')}
                style={{ paddingRight: '48px' }}
                autoComplete="new-password"
              />
              <div className="input-trailing">
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPw((p) => !p)}
                  title={showConfirmPw ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <div className="field-error">
                <AlertCircle size={13} /> {errors.confirmPassword}
              </div>
            )}
          </div>

          {/* Terms & Privacy Checkbox */}
          <div className="form-group" style={{ marginTop: '4px' }}>
            <label className="auth-checkbox-label">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={form.agreeTerms}
                onChange={handleChange}
              />
              <span>
                I agree to the <span style={{ color: 'var(--accent-secondary)' }}>Terms of Service</span> and <span style={{ color: 'var(--accent-secondary)' }}>Privacy Policy</span>.
              </span>
            </label>
            {touched.agreeTerms && errors.agreeTerms && (
              <div className="field-error">
                <AlertCircle size={13} /> {errors.agreeTerms}
              </div>
            )}
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
                <span>{isWakingServer ? 'Connecting to live server...' : 'Creating your account...'}</span>
              </>
            ) : (
              <>
                <Zap size={16} />
                <span>Create Free Account</span>
              </>
            )}
          </button>
        </form>

        <div className="divider" style={{ margin: '24px 0' }}>or</div>

        <div className="auth-footer" style={{ marginTop: '0' }}>
          Already have an account? <Link to={ROUTES.LOGIN} style={{ fontWeight: 700 }}>Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
