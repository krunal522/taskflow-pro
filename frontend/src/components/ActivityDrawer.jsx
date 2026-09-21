import React, { useEffect } from 'react';
import { X, Activity, Trash2, Clock, CheckCircle2, Plus, Copy, AlertCircle } from 'lucide-react';
import './ActivityDrawer.css';

const ActivityDrawer = ({ isOpen, onClose, activities = [], onClearActivities }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getActivityIcon = (type) => {
    switch (type) {
      case 'create':
        return <Plus size={14} color="var(--green)" />;
      case 'status':
        return <CheckCircle2 size={14} color="var(--accent-secondary)" />;
      case 'duplicate':
        return <Copy size={14} color="var(--blue)" />;
      case 'delete':
        return <Trash2 size={14} color="var(--red)" />;
      case 'batch':
        return <Activity size={14} color="var(--yellow)" />;
      default:
        return <Clock size={14} color="var(--text-muted)" />;
    }
  };

  return (
    <div className="activity-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="activity-drawer">
        {/* Header */}
        <div className="activity-header">
          <div className="activity-title-wrap">
            <div className="activity-icon-box">
              <Activity size={18} />
            </div>
            <div>
              <h3 className="activity-title">Session Audit Log</h3>
              <p className="activity-subtitle">Real-time trace of your task modifications</p>
            </div>
          </div>
          <div className="activity-header-actions">
            {activities.length > 0 && (
              <button
                type="button"
                className="activity-clear-btn"
                onClick={onClearActivities}
                title="Clear Activity Log"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              className="activity-close-btn"
              onClick={onClose}
              title="Close (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="activity-body">
          {activities.length === 0 ? (
            <div className="activity-empty">
              <Clock size={32} className="empty-icon" />
              <h4>No actions recorded yet</h4>
              <p>Create, update, or move tasks to see your session trace here.</p>
            </div>
          ) : (
            <div className="activity-timeline">
              {activities.map((item) => (
                <div key={item.id} className="activity-item">
                  <div className={`activity-item-icon-wrap ${item.type}`}>
                    {getActivityIcon(item.type)}
                  </div>
                  <div className="activity-item-details">
                    <div className="activity-item-text">
                      <span className="activity-action-label">{item.action}</span>
                      {item.taskTitle && (
                        <span className="activity-task-name"> &quot;{item.taskTitle}&quot;</span>
                      )}
                    </div>
                    {item.details && <div className="activity-sub-text">{item.details}</div>}
                    <span className="activity-timestamp">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityDrawer;
