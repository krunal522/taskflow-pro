import { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckSquare, Square, Tag } from 'lucide-react';
import { CATEGORY_OPTIONS } from '../utils/constants';
import { validators } from '../utils/validators';

const TaskModal = ({ task, defaultStatus, onClose, onSaved }) => {
  const isEdit = !!task;
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || defaultStatus || 'todo',
    priority: task?.priority || 'medium',
    category: task?.category || 'General',
    dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : '',
    subtasks: task?.subtasks || [],
    tags: task?.tags ? task.tags.join(', ') : '',
  });
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  // Subtask Handlers
  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    setForm(p => ({
      ...p,
      subtasks: [...p.subtasks, { title: newSubtaskTitle.trim(), completed: false }]
    }));
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (index) => {
    setForm(p => ({
      ...p,
      subtasks: p.subtasks.map((st, i) => i === index ? { ...st, completed: !st.completed } : st)
    }));
  };

  const handleRemoveSubtask = (index) => {
    setForm(p => ({
      ...p,
      subtasks: p.subtasks.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const titleErr = validators.taskTitle(form.title);
    if (titleErr) { setError(titleErr); return; }

    const formattedPayload = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    onSaved(formattedPayload, isEdit ? task._id : null);
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box animate-slide" style={{ maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? '✏️ Edit Task' : '✅ New Task'}</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#f87171', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" name="title" placeholder="e.g. Build React Dashboard"
              value={form.title} onChange={handleChange} autoFocus />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" name="description" placeholder="What needs to be done?"
              value={form.description} onChange={handleChange} rows={2}
              style={{ resize: 'vertical', minHeight: '65px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                <option value="todo">📋 Todo</option>
                <option value="inprogress">🔄 In Progress</option>
                <option value="done">✅ Done</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" name="priority" value={form.priority} onChange={handleChange}>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" name="category" value={form.category} onChange={handleChange}>
                {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input className="form-input" type="date" name="dueDate"
                value={form.dueDate} onChange={handleChange} style={{ colorScheme: 'dark' }} />
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Tag size={13} /> Tags <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(comma separated)</span>
            </label>
            <input className="form-input" name="tags" placeholder="e.g. design, urgent, frontend"
              value={form.tags} onChange={handleChange} />
          </div>

          {/* Subtasks Builder */}
          <div className="form-group" style={{ background: 'var(--bg-glass)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span>Subtasks / Checklist</span>
              {form.subtasks.length > 0 && (
                <span style={{ fontSize: '11px', color: 'var(--accent-secondary)' }}>
                  {form.subtasks.filter(s => s.completed).length}/{form.subtasks.length} Done
                </span>
              )}
            </label>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
              {form.subtasks.map((st, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-input)', padding: '6px 10px', borderRadius: '6px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, textDecoration: st.completed ? 'line-through' : 'none', opacity: st.completed ? 0.6 : 1 }} onClick={() => handleToggleSubtask(idx)}>
                    {st.completed ? <CheckSquare size={15} color="var(--green)" /> : <Square size={15} color="var(--text-muted)" />}
                    <span>{st.title}</span>
                  </div>
                  <button type="button" onClick={() => handleRemoveSubtask(idx)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Input */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                className="form-input"
                placeholder="Add subtask item..."
                value={newSubtaskTitle}
                onChange={e => setNewSubtaskTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(e); } }}
                style={{ fontSize: '13px', padding: '8px 12px' }}
              />
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddSubtask}>
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
              {isEdit ? '✏️ Update Task' : '✅ Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
