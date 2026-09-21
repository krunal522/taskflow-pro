import React from 'react';
import {
  CheckCircle2,
  Clock,
  Trash2,
  X,
  AlertTriangle,
  ChevronDown,
  Layers,
} from 'lucide-react';
import './BulkActionBar.css';

const BulkActionBar = ({
  selectedCount = 0,
  onBatchStatusChange,
  onBatchPriorityChange,
  onBatchDelete,
  onClearSelection,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bulk-action-bar-container">
      <div className="bulk-action-bar">
        {/* Selected Counter */}
        <div className="bulk-count-badge">
          <span className="count-number">{selectedCount}</span>
          <span className="count-label">selected</span>
        </div>

        <div className="bulk-divider" />

        {/* Status Actions */}
        <div className="bulk-btn-group">
          <button
            type="button"
            className="bulk-action-btn done"
            onClick={() => onBatchStatusChange('done')}
            title="Mark selected tasks as Done"
          >
            <CheckCircle2 size={14} />
            <span>Mark Done</span>
          </button>
          <button
            type="button"
            className="bulk-action-btn inprogress"
            onClick={() => onBatchStatusChange('inprogress')}
            title="Move selected to In Progress"
          >
            <Clock size={14} />
            <span>In Progress</span>
          </button>
        </div>

        <div className="bulk-divider" />

        {/* Priority Batch Selector */}
        <div className="bulk-select-wrap">
          <select
            className="bulk-priority-select"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                onBatchPriorityChange(e.target.value);
                e.target.value = '';
              }
            }}
          >
            <option value="" disabled>
              Set Priority...
            </option>
            <option value="high">🔴 High Priority</option>
            <option value="medium">🟡 Medium Priority</option>
            <option value="low">🟢 Low Priority</option>
          </select>
        </div>

        <div className="bulk-divider" />

        {/* Batch Delete */}
        <button
          type="button"
          className="bulk-action-btn delete"
          onClick={onBatchDelete}
          title="Delete selected tasks"
        >
          <Trash2 size={14} />
          <span>Delete</span>
        </button>

        {/* Clear Selection */}
        <button
          type="button"
          className="bulk-close-btn"
          onClick={onClearSelection}
          title="Clear Selection (Esc)"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};

export default BulkActionBar;
