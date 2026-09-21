import { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Tag,
  Calendar,
  AlertCircle,
  Sparkles,
  Check,
  Flag,
  CornerDownLeft,
  Clock,
} from 'lucide-react';
import { CATEGORY_OPTIONS } from '../utils/constants';
import { validators } from '../utils/validators';
import { formatDate } from '../utils/helpers';
import './TaskModal.css';

const QUICK_TAG_SUGGESTIONS = [
  '⚡ urgent',
  '💻 frontend',
  '⚙️ backend',
  '🎨 design',
  '🐛 bug',
  '🚀 feature',
  '📝 docs',
];

const TaskModal = ({ task, defaultStatus, onClose, onSaved }) => {
  const isEdit = !!task;
  const dateInputRef = useRef(null);
  const titleInputRef = useRef(null);

  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || defaultStatus || 'todo',
    priority: task?.priority || 'medium',
    category: task?.category || 'General',
    dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : '',
    subtasks: task?.subtasks || [],
    tags: task?.tags ? [...task.tags] : [],
  });

  const [tagInput, setTagInput] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [touchedTitle, setTouchedTitle] = useState(false);
  const [shakeTitle, setShakeTitle] = useState(false);
  const [subtaskShake, setSubtaskShake] = useState(false);

  const titleError = touchedTitle ? validators.taskTitle(form.title) : null;

  // Auto focus title on modal open
  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  // Keyboard Shortcuts: Esc to close, Ctrl+Enter / Cmd+Enter to save
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit(e);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [form, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // ── Date Picker Helpers ─────────────────────────────────────
  const openDatePicker = () => {
    try {
      if (dateInputRef.current) {
        dateInputRef.current.showPicker?.();
      }
    } catch {
      dateInputRef.current?.focus();
    }
  };

  const getPresetDate = (daysFromNow) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const calculateDueStatus = (dateStr) => {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-').map(Number);
    const target = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffMs = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `Overdue by ${Math.abs(diffDays)}d (${formatDate(dateStr)})`, type: 'overdue' };
    if (diffDays === 0) return { text: `Due Today (${formatDate(dateStr)})`, type: 'today' };
    if (diffDays === 1) return { text: `Due Tomorrow (${formatDate(dateStr)})`, type: 'today' };
    return { text: `Due in ${diffDays} days (${formatDate(dateStr)})`, type: 'upcoming' };
  };

  const dueStatus = calculateDueStatus(form.dueDate);

  // ── Tags Management ─────────────────────────────────────────
  const handleAddTag = (rawTag) => {
    const cleaned = rawTag.trim().toLowerCase().replace(/^#/, '');
    if (!cleaned) return;
    if (!form.tags.includes(cleaned)) {
      setForm((p) => ({ ...p, tags: [...p.tags, cleaned] }));
    }
    setTagInput('');
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && form.tags.length > 0) {
      setForm((p) => ({ ...p, tags: p.tags.slice(0, -1) }));
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    setForm((p) => ({
      ...p,
      tags: p.tags.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // ── Subtask Checklist ───────────────────────────────────────
  const handleAddSubtask = (e) => {
    if (e) e.preventDefault();
    if (!newSubtaskTitle.trim()) {
      setSubtaskShake(true);
      setTimeout(() => setSubtaskShake(false), 450);
      return;
    }
    setForm((p) => ({
      ...p,
      subtasks: [...p.subtasks, { title: newSubtaskTitle.trim(), completed: false }],
    }));
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (index) => {
    setForm((p) => ({
      ...p,
      subtasks: p.subtasks.map((st, i) => (i === index ? { ...st, completed: !st.completed } : st)),
    }));
  };

  const handleRemoveSubtask = (index) => {
    setForm((p) => ({
      ...p,
      subtasks: p.subtasks.filter((_, i) => i !== index),
    }));
  };

  // ── Form Submission ─────────────────────────────────────────
  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    setTouchedTitle(true);
    const titleErr = validators.taskTitle(form.title);
    if (titleErr) {
      setShakeTitle(true);
      setTimeout(() => setShakeTitle(false), 450);
      titleInputRef.current?.focus();
      return;
    }

    const formattedPayload = {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      category: form.category,
      dueDate: form.dueDate || null,
      subtasks: form.subtasks,
      tags: form.tags,
    };

    onSaved(formattedPayload, isEdit ? task._id : null);
  };

  const completedSubtasks = form.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = form.subtasks.length;
  const subtaskProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="task-modal-box">
        {/* Header */}
        <div className="task-modal-header">
          <div className="task-modal-header-left">
            <span className={`task-modal-badge ${isEdit ? 'edit' : ''}`}>
              {isEdit ? 'Edit Task' : 'New Task'}
            </span>
            <h2 className="task-modal-title">
              {isEdit ? 'Update Task Details' : 'Create New Task'}
            </h2>
          </div>
          <div className="task-modal-header-actions">
            <button
              type="button"
              className="task-modal-close-btn"
              onClick={onClose}
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="task-modal-body" noValidate>
          {/* Title Input — Professional Inline Validation */}
          <div className="pro-form-group">
            <div className="pro-form-label">
              <span>
                Task Title <span style={{ color: '#ef4444' }}>*</span>
              </span>
              {titleError ? (
                <span className="pro-inline-error-badge">
                  <AlertCircle size={12} /> {titleError}
                </span>
              ) : (
                <span className="pro-char-counter">{form.title.length}/100</span>
              )}
            </div>
            <div className="pro-input-wrapper">
              <input
                ref={titleInputRef}
                className={`form-input ${titleError ? 'has-error' : ''} ${shakeTitle ? 'pro-shake' : ''}`}
                name="title"
                placeholder="e.g. Implement OAuth2 login with GitHub"
                value={form.title}
                onChange={handleChange}
                onBlur={() => setTouchedTitle(true)}
                maxLength={100}
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  paddingRight: titleError ? '38px' : '14px',
                }}
              />
              {titleError && (
                <div className="pro-input-trailing-error">
                  <AlertCircle size={16} color="#ef4444" />
                </div>
              )}
            </div>
            {titleError && (
              <div className="pro-field-error-subtext">
                Please provide a descriptive title between 2 and 100 characters.
              </div>
            )}
          </div>

          {/* Description */}
          <div className="pro-form-group">
            <div className="pro-form-label">
              <span>Description</span>
              <span className="pro-char-counter">{form.description.length}/500</span>
            </div>
            <textarea
              className="form-input"
              name="description"
              placeholder="Add key context, acceptance criteria, or relevant links..."
              value={form.description}
              onChange={handleChange}
              rows={3}
              maxLength={500}
              style={{ resize: 'vertical', minHeight: '75px', lineHeight: 1.5 }}
            />
          </div>

          {/* Status & Priority Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Status Segmented Control */}
            <div className="pro-form-group">
              <label className="pro-form-label">Status</label>
              <div className="pro-segmented-row">
                <button
                  type="button"
                  className={`pro-segmented-btn ${form.status === 'todo' ? 'active-todo' : ''}`}
                  onClick={() => setForm((p) => ({ ...p, status: 'todo' }))}
                >
                  <span>📋</span> To Do
                </button>
                <button
                  type="button"
                  className={`pro-segmented-btn ${form.status === 'inprogress' ? 'active-inprogress' : ''}`}
                  onClick={() => setForm((p) => ({ ...p, status: 'inprogress' }))}
                >
                  <span>🔄</span> In Prog
                </button>
                <button
                  type="button"
                  className={`pro-segmented-btn ${form.status === 'done' ? 'active-done' : ''}`}
                  onClick={() => setForm((p) => ({ ...p, status: 'done' }))}
                >
                  <span>✅</span> Done
                </button>
              </div>
            </div>

            {/* Priority Matrix Cards */}
            <div className="pro-form-group">
              <label className="pro-form-label">Priority</label>
              <div className="pro-priority-grid">
                <button
                  type="button"
                  className={`pro-priority-card ${form.priority === 'low' ? 'active-low' : ''}`}
                  onClick={() => setForm((p) => ({ ...p, priority: 'low' }))}
                >
                  <span>🟢</span> Low
                </button>
                <button
                  type="button"
                  className={`pro-priority-card ${form.priority === 'medium' ? 'active-medium' : ''}`}
                  onClick={() => setForm((p) => ({ ...p, priority: 'medium' }))}
                >
                  <span>🟡</span> Med
                </button>
                <button
                  type="button"
                  className={`pro-priority-card ${form.priority === 'high' ? 'active-high' : ''}`}
                  onClick={() => setForm((p) => ({ ...p, priority: 'high' }))}
                >
                  <span>🔴</span> High
                </button>
              </div>
            </div>
          </div>

          {/* Category & Full-Area Clickable Due Date Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Category Dropdown */}
            <div className="pro-form-group">
              <label className="pro-form-label">Category</label>
              <select
                className="form-select"
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* DUE DATE — FULL AREA CLICKABLE PICKER */}
            <div className="pro-form-group">
              <div className="pro-form-label">
                <span>Due Date</span>
                {dueStatus && (
                  <span className={`pro-date-badge ${dueStatus.type}`}>
                    {dueStatus.text}
                  </span>
                )}
              </div>

              {/* Click anywhere on this box to open date picker */}
              <div
                className="pro-date-picker-box"
                onClick={openDatePicker}
                title="Click anywhere to open calendar"
              >
                <Calendar size={18} className="pro-date-icon" />
                <input
                  ref={dateInputRef}
                  className="pro-date-native-input"
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                  onClick={(e) => {
                    // Triggers native browser popup on any click inside
                    try {
                      e.currentTarget.showPicker?.();
                    } catch {}
                  }}
                />
                {form.dueDate && (
                  <button
                    type="button"
                    className="pro-date-clear-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setForm((p) => ({ ...p, dueDate: '' }));
                    }}
                    title="Clear Date"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Quick Presets: 1-click date assignment */}
              <div className="pro-date-presets-row">
                <button
                  type="button"
                  className={`pro-preset-pill ${form.dueDate === getPresetDate(0) ? 'active' : ''}`}
                  onClick={() => setForm((p) => ({ ...p, dueDate: getPresetDate(0) }))}
                >
                  Today
                </button>
                <button
                  type="button"
                  className={`pro-preset-pill ${form.dueDate === getPresetDate(1) ? 'active' : ''}`}
                  onClick={() => setForm((p) => ({ ...p, dueDate: getPresetDate(1) }))}
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  className={`pro-preset-pill ${form.dueDate === getPresetDate(3) ? 'active' : ''}`}
                  onClick={() => setForm((p) => ({ ...p, dueDate: getPresetDate(3) }))}
                >
                  +3 Days
                </button>
                <button
                  type="button"
                  className={`pro-preset-pill ${form.dueDate === getPresetDate(7) ? 'active' : ''}`}
                  onClick={() => setForm((p) => ({ ...p, dueDate: getPresetDate(7) }))}
                >
                  Next Week
                </button>
                {form.dueDate && (
                  <button
                    type="button"
                    className="pro-preset-pill"
                    style={{ color: '#f87171' }}
                    onClick={() => setForm((p) => ({ ...p, dueDate: '' }))}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tags Manager */}
          <div className="pro-form-group">
            <label className="pro-form-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Tag size={13} /> Tags & Labels
              </span>
              <span className="pro-char-counter">Press Enter or Comma to add</span>
            </label>
            <div className="pro-tag-container">
              <div className="pro-tag-chips-wrapper" onClick={() => document.getElementById('tag-input-field')?.focus()}>
                {form.tags.map((tag, idx) => (
                  <span key={idx} className="pro-tag-chip">
                    #{tag}
                    <button
                      type="button"
                      className="pro-tag-remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTag(idx);
                      }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <input
                  id="tag-input-field"
                  className="pro-tag-inline-input"
                  placeholder={form.tags.length === 0 ? 'Type tag and press Enter...' : 'Add another tag...'}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  onBlur={() => {
                    if (tagInput.trim()) handleAddTag(tagInput);
                  }}
                />
              </div>

              {/* Quick suggestions */}
              <div className="pro-tag-suggestions">
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Suggestions:</span>
                {QUICK_TAG_SUGGESTIONS.map((sug) => {
                  const tagClean = sug.replace(/^[^\w]+/, '').trim();
                  if (form.tags.includes(tagClean)) return null;
                  return (
                    <button
                      key={sug}
                      type="button"
                      className="pro-tag-suggest-btn"
                      onClick={() => handleAddTag(tagClean)}
                    >
                      {sug}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Subtasks / Checklist Builder with Live Progress */}
          <div className="pro-checklist-box">
            <div className="pro-checklist-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckSquare size={16} color="var(--accent-secondary)" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Subtasks & Acceptance Criteria
                </span>
              </div>
              {totalSubtasks > 0 && (
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-secondary)' }}>
                  {completedSubtasks} / {totalSubtasks} Done ({subtaskProgress}%)
                </span>
              )}
            </div>

            {/* Animated Progress Bar */}
            {totalSubtasks > 0 && (
              <div className="pro-checklist-progress-bar">
                <div
                  className="pro-checklist-progress-fill"
                  style={{ width: `${subtaskProgress}%` }}
                />
              </div>
            )}

            {/* Subtask Items */}
            {form.subtasks.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {form.subtasks.map((st, idx) => (
                  <div
                    key={idx}
                    className={`pro-subtask-item ${st.completed ? 'completed' : ''}`}
                  >
                    <div
                      className="pro-subtask-title"
                      onClick={() => handleToggleSubtask(idx)}
                    >
                      {st.completed ? (
                        <CheckSquare size={16} color="#10b981" />
                      ) : (
                        <Square size={16} color="var(--text-muted)" />
                      )}
                      <span>{st.title}</span>
                    </div>
                    <button
                      type="button"
                      className="pro-subtask-delete-btn"
                      onClick={() => handleRemoveSubtask(idx)}
                      title="Delete subtask"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Subtask Input */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                className={`form-input ${subtaskShake ? 'has-error pro-shake' : ''}`}
                placeholder="Type checklist item and press Enter..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                style={{ fontSize: '13px', padding: '8px 12px' }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAddSubtask}
                style={{ flexShrink: 0 }}
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>
        </form>

        {/* Footer with Shortcuts */}
        <div className="task-modal-footer">
          <div className="task-modal-shortcuts-hint">
            <span>
              <kbd className="pro-key-badge">Esc</kbd> Cancel
            </span>
            <span>•</span>
            <span>
              <kbd className="pro-key-badge">Ctrl</kbd> + <kbd className="pro-key-badge">↵</kbd> Save
            </span>
          </div>

          <div className="task-modal-footer-btns">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
            >
              {isEdit ? (
                <>
                  <span>Update Task</span>
                  <Sparkles size={15} />
                </>
              ) : (
                <>
                  <span>Create Task</span>
                  <Sparkles size={15} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
