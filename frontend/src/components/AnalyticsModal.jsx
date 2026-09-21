import React, { useEffect } from 'react';
import { X, BarChart3, CheckCircle2, Clock, AlertTriangle, ListTodo, TrendingUp, Award, Layers } from 'lucide-react';
import './AnalyticsModal.css';

const AnalyticsModal = ({ tasks = [], stats = {}, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const total = tasks.length || stats.total || 0;
  const done = tasks.filter((t) => t.status === 'done').length;
  const inprogress = tasks.filter((t) => t.status === 'inprogress').length;
  const todo = tasks.filter((t) => t.status === 'todo').length;

  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  // Due Date metrics
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let overdueCount = 0;
  let dueTodayCount = 0;
  let totalSubtasks = 0;
  let completedSubtasks = 0;

  // Category distribution
  const categoryCounts = {};

  tasks.forEach((t) => {
    // Categories
    const cat = t.category || 'General';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

    // Subtasks
    if (t.subtasks && t.subtasks.length > 0) {
      totalSubtasks += t.subtasks.length;
      completedSubtasks += t.subtasks.filter((s) => s.completed).length;
    }

    // Due dates (only for incomplete tasks)
    if (t.dueDate && t.status !== 'done') {
      const due = new Date(t.dueDate);
      due.setHours(0, 0, 0, 0);
      const diff = due.getTime() - now.getTime();
      const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
      if (diffDays < 0) overdueCount++;
      else if (diffDays === 0) dueTodayCount++;
    }
  });

  const highPriority = tasks.filter((t) => t.priority === 'high' && t.status !== 'done').length;
  const subtaskRate = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Sorted categories
  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="analytics-modal-box">
        {/* Header */}
        <div className="analytics-header">
          <div className="analytics-title-group">
            <div className="analytics-icon-wrap">
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="analytics-title">Productivity & Insights</h3>
              <p className="analytics-subtitle">Real-time velocity and task health analytics</p>
            </div>
          </div>
          <button className="analytics-close-btn" onClick={onClose} title="Close (Esc)">
            <X size={18} />
          </button>
        </div>

        <div className="analytics-body">
          {/* Main Progress Ring & Velocity Summary */}
          <div className="analytics-hero-card">
            <div className="analytics-ring-wrap">
              <svg className="analytics-ring-svg" viewBox="0 0 100 100">
                <circle className="ring-bg" cx="50" cy="50" r="40" />
                <circle
                  className="ring-progress"
                  cx="50"
                  cy="50"
                  r="40"
                  style={{
                    strokeDasharray: 251.2,
                    strokeDashoffset: 251.2 - (251.2 * completionRate) / 100,
                  }}
                />
              </svg>
              <div className="ring-content">
                <span className="ring-pct">{completionRate}%</span>
                <span className="ring-label">Done</span>
              </div>
            </div>

            <div className="analytics-hero-text">
              <div className="analytics-badge-status">
                <Award size={14} />
                <span>
                  {completionRate >= 80
                    ? 'Super Productive 🚀'
                    : completionRate >= 50
                    ? 'Great Momentum ⚡'
                    : 'Getting Started 🌱'}
                </span>
              </div>
              <h4 className="analytics-hero-headline">
                {done} of {total} tasks completed
              </h4>
              <p className="analytics-hero-desc">
                {todo + inprogress} tasks remain active. Maintain focus to achieve inbox zero!
              </p>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="analytics-grid">
            <div className="analytics-metric-card">
              <div className="metric-header">
                <span className="metric-label">In Progress</span>
                <Clock size={16} className="metric-icon yellow" />
              </div>
              <div className="metric-value">{inprogress}</div>
              <div className="metric-sub">Active workflow</div>
            </div>

            <div className="analytics-metric-card">
              <div className="metric-header">
                <span className="metric-label">High Priority</span>
                <AlertTriangle size={16} className="metric-icon red" />
              </div>
              <div className="metric-value red">{highPriority}</div>
              <div className="metric-sub">Needs immediate attention</div>
            </div>

            <div className="analytics-metric-card">
              <div className="metric-header">
                <span className="metric-label">Overdue</span>
                <Clock size={16} className="metric-icon red" />
              </div>
              <div className="metric-value red">{overdueCount}</div>
              <div className="metric-sub">{dueTodayCount} due today</div>
            </div>

            <div className="analytics-metric-card">
              <div className="metric-header">
                <span className="metric-label">Subtasks Rate</span>
                <CheckCircle2 size={16} className="metric-icon green" />
              </div>
              <div className="metric-value green">{subtaskRate}%</div>
              <div className="metric-sub">
                {completedSubtasks}/{totalSubtasks} completed
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          {sortedCategories.length > 0 && (
            <div className="analytics-section">
              <div className="section-title-wrap">
                <Layers size={14} />
                <span>Workload by Category</span>
              </div>
              <div className="category-bars-list">
                {sortedCategories.map(([cat, count]) => {
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={cat} className="category-bar-row">
                      <div className="category-bar-info">
                        <span className="cat-name">{cat}</span>
                        <span className="cat-count">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="cat-progress-track">
                        <div className="cat-progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsModal;
