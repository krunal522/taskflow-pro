// ============================================
// PROFILE PAGE — Full Premium Implementation
// Sections: Hero, Stats, Priority, Edit Form, Danger Zone
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, FileText, Lock, ShieldAlert,
  Save, Trash2, Star, CheckCircle2, Clock,
  BarChart3, RefreshCw, Eye, EyeOff, AlertTriangle, Camera
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  selectUser,
  updateProfileThunk,
  deleteAccountThunk,
  updateUser,
  logout
} from '../../features/auth/store/authSlice';
import { profileService } from '../../services/profile.service';
import { ROUTES } from '../../routes/routeConstants';
import './ProfilePage.css';

// ── Helpers ───────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return 'Unknown';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
};

const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  return parts.length > 1
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : parts[0].substring(0, 2).toUpperCase();
};

// ── Sub-components ────────────────────────────────────────────
const StatCard = ({ icon, value, label, type }) => (
  <div className={`stat-card ${type}`}>
    <span className="stat-icon">{icon}</span>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

// ── Main Component ────────────────────────────────────────────
const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);

  // Stats state
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Edit form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    phone: '',
    currentPassword: '',
    password: '',
    confirmPassword: '',
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw]         = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', msg: string }

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword]   = useState('');
  const [showDeletePw, setShowDeletePw]       = useState(false);
  const [deleting, setDeleting]               = useState(false);

  // Avatar upload state
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);

  // Populate form from user on mount / when user changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await profileService.getStats();
      setStats(data);
    } catch {
      toast.error('Could not load stats');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // ── Avatar upload handler ────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Only JPEG, PNG, or WEBP allowed');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2 MB');
      return;
    }
    setAvatarUploading(true);
    try {
      const updatedUser = await profileService.uploadAvatar(file);
      dispatch(updateUser(updatedUser));
      toast.success('Profile picture updated! 📸');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  // Clear feedback after 4s
  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  // ── Handlers ────────────────────────────────────────────────
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFeedback(null);

    // Validation
    if (!formData.name.trim()) {
      setFeedback({ type: 'error', msg: 'Name cannot be empty.' });
      return;
    }
    if (formData.password || formData.confirmPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        setFeedback({ type: 'error', msg: 'Enter your current password to change it.' });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setFeedback({ type: 'error', msg: 'New passwords do not match.' });
        return;
      }
      if (formData.password.length > 0 && formData.password.length < 6) {
        setFeedback({ type: 'error', msg: 'New password must be at least 6 characters.' });
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        bio: formData.bio.trim(),
        phone: formData.phone.trim(),
      };
      if (formData.password) {
        payload.currentPassword = formData.currentPassword;
        payload.password = formData.password;
      }

      await dispatch(updateProfileThunk(payload)).unwrap();
      // Clear password fields
      setFormData(prev => ({ ...prev, currentPassword: '', password: '', confirmPassword: '' }));
      setFeedback({ type: 'success', msg: 'Profile updated successfully! 🎉' });
      toast.success('Profile saved!');
    } catch (err) {
      setFeedback({ type: 'error', msg: err || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      toast.error('Please enter your password to confirm deletion.');
      return;
    }
    setDeleting(true);
    try {
      await dispatch(deleteAccountThunk({ password: deletePassword })).unwrap();
      dispatch(logout());
      toast.success("Account deleted. We're sorry to see you go.");
      navigate(ROUTES.HOME);
    } catch (err) {
      toast.error(err || 'Failed to delete account. Check your password.');
      setDeleting(false);
    }
  };

  const handleReset = () => {
    setFormData(prev => ({
      ...prev,
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      phone: user?.phone || '',
      currentPassword: '',
      password: '',
      confirmPassword: '',
    }));
    setFeedback(null);
  };

  // Priority bar width calculation
  const maxPriority = stats
    ? Math.max(stats.byPriority.high, stats.byPriority.medium, stats.byPriority.low, 1)
    : 1;
  const priorityPct = (val) => `${Math.round((val / maxPriority) * 100)}%`;

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="profile-page">

      {/* ── HERO CARD ─────────────────────────────────────── */}
      <div className="profile-card profile-hero">
        <div className="profile-hero-inner">
          <div className="profile-avatar-wrap" onClick={() => avatarInputRef.current?.click()} title="Click to change photo" style={{ cursor: 'pointer' }}>
            {user?.avatarUrl ? (
              <img
                src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.avatarUrl}`}
                alt={user.name}
                className="profile-avatar profile-avatar-img"
              />
            ) : (
              <div className="profile-avatar">
                {avatarUploading ? <span className="spinner-sm" /> : getInitials(user?.name)}
              </div>
            )}
            <div className="avatar-ring" />
            <div className="avatar-status" title="Active" />
            <div className="avatar-upload-overlay">
              {avatarUploading ? <span className="spinner-sm" /> : <Camera size={18} />}
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
              id="avatar-file-input"
            />
          </div>


          <div className="profile-hero-info">
            <div className="profile-hero-name">{user?.name || 'Unknown User'}</div>
            <div className="profile-hero-email">{user?.email}</div>
            <div className="profile-hero-meta">
              <span className="profile-role-badge">
                <Star size={10} />
                {user?.role || 'user'}
              </span>
              <span className="profile-join-date">
                <Clock size={11} />
                Member since {formatDate(user?.createdAt)}
              </span>
            </div>
            {user?.bio && (
              <div className="profile-bio-display">"{user.bio}"</div>
            )}
          </div>
        </div>
      </div>

      {/* ── STATS CARD ────────────────────────────────────── */}
      <div className="profile-card">
        <div className="card-title">
          <BarChart3 size={16} />
          Task Overview
          <button
            onClick={fetchStats}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
            title="Refresh stats"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {statsLoading ? (
          <div className="stats-skeleton">
            {[0,1,2,3].map(i => <div key={i} className="skeleton-block" />)}
          </div>
        ) : (
          <>
            <div className="stats-grid">
              <StatCard icon="📋" value={stats?.total ?? 0}      label="Total Tasks"  type="total" />
              <StatCard icon="✅" value={stats?.done ?? 0}       label="Completed"    type="done" />
              <StatCard icon="⏳" value={stats?.inprogress ?? 0} label="In Progress"  type="progress" />
              <StatCard icon="📌" value={stats?.todo ?? 0}       label="To Do"        type="todo" />
            </div>

            <div className="completion-wrap">
              <div className="completion-header">
                <span className="completion-label">Completion Rate</span>
                <span className="completion-pct">{stats?.completionRate ?? 0}%</span>
              </div>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${stats?.completionRate ?? 0}%` }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── PRIORITY BREAKDOWN ────────────────────────────── */}
      {!statsLoading && stats && (
        <div className="profile-card">
          <div className="card-title">
            <AlertTriangle size={16} />
            Priority Breakdown
          </div>
          <div className="priority-rows">
            {[
              { key: 'high',   label: 'High',   val: stats.byPriority.high },
              { key: 'medium', label: 'Medium', val: stats.byPriority.medium },
              { key: 'low',    label: 'Low',    val: stats.byPriority.low },
            ].map(({ key, label, val }) => (
              <div key={key} className="priority-row">
                <div className="priority-label-wrap">
                  <div className={`priority-dot ${key}`} />
                  <span className="priority-name">{label}</span>
                </div>
                <div className="priority-bar-track">
                  <div
                    className={`priority-bar-fill ${key}`}
                    style={{ width: stats.total === 0 ? '0%' : priorityPct(val) }}
                  />
                </div>
                <span className="priority-count">{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── EDIT PROFILE FORM ─────────────────────────────── */}
      <div className="profile-card">
        <div className="card-title">
          <User size={16} />
          Edit Profile
        </div>

        <form className="profile-form" onSubmit={handleSave}>
          {/* Name & Email */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="profile-name">
                <User size={12} style={{ display: 'inline', marginRight: 4 }} />
                Full Name
              </label>
              <input
                id="profile-name"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                autoComplete="name"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-email">
                <Mail size={12} style={{ display: 'inline', marginRight: 4 }} />
                Email Address
              </label>
              <input
                id="profile-email"
                name="email"
                type="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Phone & Bio */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="profile-phone">
                <Phone size={12} style={{ display: 'inline', marginRight: 4 }} />
                Phone <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                id="profile-phone"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 234 567 8900"
                autoComplete="tel"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-bio">
                <FileText size={12} style={{ display: 'inline', marginRight: 4 }} />
                Bio <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(max 160 chars)</span>
              </label>
              <input
                id="profile-bio"
                name="bio"
                className="form-input"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us a bit about yourself..."
                maxLength={160}
              />
            </div>
          </div>

          <hr className="profile-section-divider" />
          <div className="form-section-label">Change Password</div>

          {/* Current Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="profile-current-pw">
              <Lock size={12} style={{ display: 'inline', marginRight: 4 }} />
              Current Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="profile-current-pw"
                name="currentPassword"
                type={showCurrentPw ? 'text' : 'password'}
                className="form-input"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Required to change password"
                autoComplete="current-password"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
              >
                {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New & Confirm Password */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="profile-new-pw">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="profile-new-pw"
                  name="password"
                  type={showNewPw ? 'text' : 'password'}
                  className="form-input"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  autoComplete="new-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                >
                  {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-confirm-pw">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="profile-confirm-pw"
                  name="confirmPassword"
                  type={showConfirmPw ? 'text' : 'password'}
                  className="form-input"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                >
                  {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`profile-feedback ${feedback.type}`}>
              {feedback.type === 'success' ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
              {feedback.msg}
            </div>
          )}

          {/* Actions */}
          <div className="profile-save-row">
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              Reset
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              id="profile-save-btn"
            >
              {saving ? (
                <><span className="spinner-sm" /> Saving…</>
              ) : (
                <><Save size={15} /> Save Changes</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── DANGER ZONE ───────────────────────────────────── */}
      <div className="profile-card danger-zone-card">
        <div className="card-title danger-title">
          <ShieldAlert size={16} />
          Danger Zone
        </div>
        <div className="danger-content">
          <div className="danger-desc">
            <h4>Delete Your Account</h4>
            <p>
              Permanently delete your account and <strong>all associated tasks</strong>.
              This action is irreversible — please be absolutely sure.
            </p>
          </div>
          <button
            className="btn btn-danger"
            id="profile-delete-account-btn"
            onClick={() => setDeleteModalOpen(true)}
          >
            <Trash2 size={15} /> Delete Account
          </button>
        </div>
      </div>

      {/* ── DELETE CONFIRMATION MODAL ─────────────────────── */}
      {deleteModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) { setDeleteModalOpen(false); setDeletePassword(''); } }}
        >
          <div className="modal-box" style={{ borderColor: 'rgba(239,68,68,0.3)', maxWidth: 440 }}>
            <div className="modal-header">
              <span className="modal-title" style={{ color: '#f87171' }}>
                <ShieldAlert size={18} style={{ display: 'inline', marginRight: 8 }} />
                Delete Account
              </span>
              <button
                className="modal-close"
                onClick={() => { setDeleteModalOpen(false); setDeletePassword(''); }}
              >
                ✕
              </button>
            </div>

            <div className="delete-modal-body">
              <div className="delete-warning-icon">⚠️</div>
              <p className="delete-warning-text">
                This will permanently delete your account and{' '}
                <strong>all your tasks</strong>. This cannot be undone.
                <br /><br />
                Please enter your password to confirm:
              </p>

              <div className="form-group">
                <label className="form-label" htmlFor="delete-confirm-pw">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="delete-confirm-pw"
                    type={showDeletePw ? 'text' : 'password'}
                    className="form-input"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                    autoFocus
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePw(v => !v)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                  >
                    {showDeletePw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="delete-modal-actions">
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => { setDeleteModalOpen(false); setDeletePassword(''); }}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={handleDeleteAccount}
                  disabled={deleting || !deletePassword.trim()}
                  id="profile-confirm-delete-btn"
                >
                  {deleting ? (
                    <><span className="spinner-sm" /> Deleting…</>
                  ) : (
                    <><Trash2 size={15} /> Yes, Delete</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
