import React, { useState } from 'react';
import {
  Pencil,
  Trash2,
  Copy,
  Clock,
  CheckSquare,
  Square,
  Tag,
  ChevronDown,
  ChevronRight,
  Plus,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { getDueDateLabel } from '../utils/helpers';
import './TaskListView.css';

const STATUS_GROUPS = [
  { key: 'todo', label: 'To Do', emoji: '📋' },
  { key: 'inprogress', label: 'In Progress', emoji: '🔄' },
  { key: 'done', label: 'Done', emoji: '✅' },
];

const TaskListView = ({
  tasks = [],
  onStatusChange,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleSubtask,
  onAddSubtaskInline,
}) => {
  const [expandedSubtasks, setExpandedSubtasks] = useState({});
  const [inlineNewSubtask, setInlineNewSubtask] = useState({});

  const toggleExpand = (taskId) => {
    setExpandedSubtasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleInlineAdd = (e, taskId) => {
    e.preventDefault();
    const title = inlineNewSubtask[taskId]?.trim();
    if (!title) return;
    onAddSubtaskInline(taskId, title);
    setInlineNewSubtask((prev) => ({ ...prev, [taskId]: '' }));
  };

  if (tasks.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '60px 16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)' }}>
        <div className="empty-icon">📭</div>
        <p className="empty-text">No tasks found matching your filters</p>
      </div>
    );
  }

  return (
    <div className="task-list-container">
      {STATUS_GROUPS.map((group) => {
        const groupTasks = tasks.filter((t) => t.status === group.key);
        if (groupTasks.length === 0) return null;

        return (
          <div key={group.key} className={`list-group-section ${group.key}`}>
            <div className="list-group-header">
              <div className="list-group-title">
                <span className="group-emoji">{group.emoji}</span>
                <span className="group-name">{group.label}</span>
                <span className="group-count">{groupTasks.length}</span>
              </div>
            </div>

            <div className="list-items-table">
              {groupTasks.map((task) => {
                const due = getDueDateLabel(task.dueDate);
                const totalSubtasks = task.subtasks?.length || 0;
                const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
                const isExpanded = !!expandedSubtasks[task._id];
                const isDone = task.status === 'done';

                return (
                  <div key={task._id} className={`list-row-wrapper ${task.priority}`}>
                    <div className="list-row">
                      {/* Quick Status Toggle Checkbox */}
                      <button
                        type="button"
                        className={`list-status-toggle ${isDone ? 'checked' : ''}`}
                        onClick={() => onStatusChange(task._id, isDone ? 'todo' : 'done')}
                        title={isDone ? 'Mark as To Do' : 'Mark as Done'}
                      >
                        {isDone ? (
                          <CheckCircle2 size={18} className="icon-checked" />
                        ) : (
                          <Circle size={18} className="icon-unchecked" />
                        )}
                      </button>

                      {/* Main Info */}
                      <div className="list-main-info" onClick={() => onEdit(task)}>
                        <div className="list-title-wrap">
                          <span className={`list-task-title ${isDone ? 'completed-text' : ''}`}>
                            {task.title}
                          </span>
                          {task.category && (
                            <span className="task-category">{task.category}</span>
                          )}
                        </div>
                        {task.description && (
                          <p className="list-task-desc">{task.description}</p>
                        )}
                      </div>

                      {/* Subtasks Accordion Button */}
                      <div className="list-subtasks-cell">
                        {totalSubtasks > 0 ? (
                          <button
                            type="button"
                            className={`subtasks-pill-btn ${isExpanded ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(task._id);
                            }}
                            title="Expand subtasks checklist"
                          >
                            <CheckSquare
                              size={12}
                              color={
                                completedSubtasks === totalSubtasks
                                  ? 'var(--green)'
                                  : 'var(--accent-secondary)'
                              }
                            />
                            <span>
                              {completedSubtasks}/{totalSubtasks}
                            </span>
                            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="subtasks-pill-btn add-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(task._id);
                            }}
                            title="Add subtasks"
                          >
                            <Plus size={11} />
                            <span>Subtask</span>
                          </button>
                        )}
                      </div>

                      {/* Tags */}
                      <div className="list-tags-cell">
                        {task.tags && task.tags.length > 0 ? (
                          <div className="list-tags-row">
                            {task.tags.slice(0, 2).map((tag, i) => (
                              <span key={i} className="list-tag-chip">
                                #{tag}
                              </span>
                            ))}
                            {task.tags.length > 2 && (
                              <span className="list-tag-chip more">
                                +{task.tags.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="dash-placeholder">—</span>
                        )}
                      </div>

                      {/* Priority */}
                      <div className="list-priority-cell">
                        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                      </div>

                      {/* Due Date */}
                      <div className="list-due-cell">
                        {due ? (
                          <span className={`task-due ${due.overdue ? 'overdue' : ''}`}>
                            <Clock size={11} /> {due.label}
                          </span>
                        ) : (
                          <span className="dash-placeholder">—</span>
                        )}
                      </div>

                      {/* Status Selector */}
                      <div className="list-status-select-cell">
                        <select
                          className="form-select mini-select"
                          value={task.status}
                          onChange={(e) => onStatusChange(task._id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="todo">📋 To Do</option>
                          <option value="inprogress">🔄 In Progress</option>
                          <option value="done">✅ Done</option>
                        </select>
                      </div>

                      {/* Actions */}
                      <div className="list-actions-cell" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="task-action-btn"
                          onClick={() => onDuplicate(task)}
                          title="Duplicate task"
                        >
                          <Copy size={12} />
                        </button>
                        <button
                          className="task-action-btn"
                          onClick={() => onEdit(task)}
                          title="Edit task"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          className="task-action-btn delete"
                          onClick={() => onDelete(task._id)}
                          title="Delete task"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Inline Expandable Subtask Checklist */}
                    {isExpanded && (
                      <div className="list-subtasks-expanded">
                        <div className="subtasks-expanded-header">
                          <span className="subtasks-label">
                            Checklist ({completedSubtasks}/{totalSubtasks})
                          </span>
                          {totalSubtasks > 0 && (
                            <div className="subtasks-mini-bar">
                              <div
                                className="subtasks-mini-fill"
                                style={{
                                  width: `${Math.round((completedSubtasks / totalSubtasks) * 100)}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>

                        {task.subtasks && task.subtasks.length > 0 && (
                          <div className="subtasks-checklist">
                            {task.subtasks.map((st, idx) => (
                              <div
                                key={idx}
                                className={`subtask-check-row ${st.completed ? 'completed' : ''}`}
                                onClick={() => onToggleSubtask(task._id, idx)}
                              >
                                <button type="button" className="subtask-checkbox-btn">
                                  {st.completed ? (
                                    <CheckSquare size={14} color="var(--green)" />
                                  ) : (
                                    <Square size={14} color="var(--text-muted)" />
                                  )}
                                </button>
                                <span className="subtask-check-text">{st.title}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <form
                          className="inline-add-subtask-form"
                          onSubmit={(e) => handleInlineAdd(e, task._id)}
                        >
                          <input
                            type="text"
                            placeholder="Add subtask and press Enter..."
                            className="inline-subtask-input"
                            value={inlineNewSubtask[task._id] || ''}
                            onChange={(e) =>
                              setInlineNewSubtask((prev) => ({
                                ...prev,
                                [task._id]: e.target.value,
                              }))
                            }
                          />
                          <button type="submit" className="inline-subtask-submit-btn">
                            <Plus size={13} /> Add
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskListView;
