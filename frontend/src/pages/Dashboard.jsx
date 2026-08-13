import { useEffect, useState } from 'react';
import { Plus, Search, RefreshCw, Pencil, Trash2, Clock, CheckSquare, Tag, ArrowUpDown } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import TaskModal from '../components/TaskModal';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchTasks, createTask, updateTask, updateTaskStatus, deleteTask,
  selectTasks, selectTaskStats, selectTaskStatus, setFilter, selectFilters,
} from '../features/dashboard/store/taskSlice';
import { selectUser } from '../features/auth/store/authSlice';
import useDebounce from '../hooks/useDebounce';
import { getGreeting, getDueDateLabel } from '../utils/helpers';
import './Dashboard.css';

const COLUMNS = [
  { key: 'todo',       label: 'To Do',       emoji: '📋' },
  { key: 'inprogress', label: 'In Progress',  emoji: '🔄' },
  { key: 'done',       label: 'Done',         emoji: '✅' },
];

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const tasks = useAppSelector(selectTasks);
  const stats = useAppSelector(selectTaskStats);
  const status = useAppSelector(selectTaskStatus);
  const filters = useAppSelector(selectFilters);
  const loading = status === 'loading';

  const [modal, setModal] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [draggedOverCol, setDraggedOverCol] = useState(null);
  const debouncedSearch = useDebounce(searchInput, 400);

  // Fetch when filters or sort change
  useEffect(() => {
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (filters.status !== 'all') params.status = filters.status;
    if (filters.priority !== 'all') params.priority = filters.priority;
    if (sortBy) params.sortBy = sortBy;
    dispatch(fetchTasks(params));
  }, [dispatch, debouncedSearch, filters.status, filters.priority, sortBy]);

  const handleTaskSaved = async (formData, taskId) => {
    if (taskId) {
      await dispatch(updateTask({ id: taskId, data: formData }));
      toast.success('Task updated! ✏️');
    } else {
      await dispatch(createTask(formData));
      toast.success('Task created! ✅');
    }
    setModal(null);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    await dispatch(updateTaskStatus({ id: taskId, status: newStatus }));
    toast.success(`Moved to ${newStatus}!`);
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    await dispatch(deleteTask(taskId));
    toast.success('Task deleted! 🗑️');
  };

  // Drag & Drop Handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, colKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedOverCol !== colKey) setDraggedOverCol(colKey);
  };

  const handleDragLeave = (colKey) => {
    if (draggedOverCol === colKey) setDraggedOverCol(null);
  };

  const handleDrop = async (e, colKey) => {
    e.preventDefault();
    setDraggedOverCol(null);
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    const task = tasks.find(t => t._id === taskId);
    if (task && task.status !== colKey) {
      await handleStatusChange(taskId, colKey);
    }
  };

  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  const getColumnTasks = (s) => tasks.filter(t => t.status === s);

  return (
    <div className="dashboard">
      <Navbar />
      <div className="dashboard-layout">

        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-section-title">Views</div>
          {[
            { key: 'all', label: 'All Tasks', emoji: '📋', count: stats.total },
            { key: 'todo', label: 'To Do', emoji: '🔴', count: stats.todo },
            { key: 'inprogress', label: 'In Progress', emoji: '🟡', count: stats.inprogress },
            { key: 'done', label: 'Done', emoji: '🟢', count: stats.done },
          ].map(item => (
            <button key={item.key}
              className={`sidebar-item ${filters.status === item.key ? 'active' : ''}`}
              onClick={() => dispatch(setFilter({ status: item.key }))}>
              <span>{item.emoji}</span> {item.label}
              <span className="sidebar-item-count">{item.count}</span>
            </button>
          ))}

          <div className="sidebar-section-title" style={{ marginTop: '16px' }}>Priority</div>
          {[
            { key: 'all', label: 'All Priorities', emoji: '⚡' },
            { key: 'high', label: 'High', emoji: '🔴' },
            { key: 'medium', label: 'Medium', emoji: '🟡' },
            { key: 'low', label: 'Low', emoji: '🟢' },
          ].map(item => (
            <button key={item.key}
              className={`sidebar-item ${filters.priority === item.key ? 'active' : ''}`}
              onClick={() => dispatch(setFilter({ priority: item.key }))}>
              <span>{item.emoji}</span> {item.label}
            </button>
          ))}
        </aside>

        {/* Main */}
        <main className="dashboard-main">
          <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">
                {getGreeting()}, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
              </h1>
              <p className="dashboard-subtitle">
                {stats.total === 0 ? 'No tasks yet — create your first one!'
                  : `${stats.todo + stats.inprogress} active · ${stats.done} completed`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => dispatch(fetchTasks())} title="Refresh">
                <RefreshCw size={14} />
              </button>
              <button className="btn btn-primary" onClick={() => setModal({ defaultStatus: 'todo' })}>
                <Plus size={16} /> New Task
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-row">
            {[
              { cls: 'total', label: 'Total Tasks', val: stats.total },
              { cls: 'todo', label: 'To Do', val: stats.todo },
              { cls: 'inprogress', label: 'In Progress', val: stats.inprogress },
              { cls: 'done', label: 'Completed', val: stats.done },
            ].map(s => (
              <div key={s.cls} className={`stat-card ${s.cls}`}>
                <div className="stat-number">{s.val}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Completion Bar */}
          <div className="completion-bar-wrap">
            <span className="completion-label">Overall Progress</span>
            <div className="completion-bar">
              <div className="completion-fill" style={{ width: `${completionRate}%` }} />
            </div>
            <span className="completion-pct">{completionRate}%</span>
          </div>

          {/* Search & Sort Toolbar */}
          <div className="toolbar" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-box" style={{ flex: 1, minWidth: '220px' }}>
              <Search size={15} className="search-icon" />
              <input className="search-input" placeholder="Search tasks, descriptions, tags..."
                value={searchInput} onChange={e => setSearchInput(e.target.value)} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowUpDown size={14} color="var(--text-muted)" />
              <select
                className="form-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{ width: 'auto', padding: '8px 30px 8px 12px', fontSize: '13px' }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="dueSoon">Due Soonest</option>
              </select>
            </div>
          </div>

          {/* Kanban Board */}
          {loading ? (
            <div className="loader-container" style={{ minHeight: '300px' }}>
              <div className="spinner" />
            </div>
          ) : (
            <div className="kanban-board">
              {COLUMNS.map(col => {
                const colTasks = getColumnTasks(col.key);
                const isDragOver = draggedOverCol === col.key;
                return (
                  <div
                    key={col.key}
                    className={`kanban-column ${col.key} ${isDragOver ? 'drag-over' : ''}`}
                    onDragOver={e => handleDragOver(e, col.key)}
                    onDragLeave={() => handleDragLeave(col.key)}
                    onDrop={e => handleDrop(e, col.key)}
                  >
                    <div className="column-header">
                      <div className="column-title">
                        <span className="col-dot" /> {col.emoji} {col.label}
                      </div>
                      <span className="column-count">{colTasks.length}</span>
                    </div>

                    {colTasks.length === 0 ? (
                      <div className="empty-state" style={{ padding: '32px 16px' }}>
                        <div className="empty-icon">📭</div>
                        <p className="empty-text">Drop or add tasks here</p>
                      </div>
                    ) : colTasks.map(task => {
                      const due = getDueDateLabel(task.dueDate);
                      const totalSubtasks = task.subtasks?.length || 0;
                      const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;

                      return (
                        <div
                          key={task._id}
                          className="task-card"
                          draggable
                          onDragStart={e => handleDragStart(e, task._id)}
                        >
                          <div className="task-card-header">
                            <span className="task-title">{task.title}</span>
                            <div className="task-actions">
                              <button className="task-action-btn" onClick={() => setModal({ task })} title="Edit">
                                <Pencil size={12} />
                              </button>
                              <button className="task-action-btn delete" onClick={() => handleDelete(task._id)} title="Delete">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>

                          {task.description && <p className="task-desc">{task.description}</p>}

                          {/* Subtasks Progress Pill */}
                          {totalSubtasks > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)', margin: '8px 0', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '6px' }}>
                              <CheckSquare size={12} color={completedSubtasks === totalSubtasks ? 'var(--green)' : 'var(--accent-secondary)'} />
                              <span>{completedSubtasks}/{totalSubtasks} subtasks</span>
                            </div>
                          )}

                          {/* Tags */}
                          {task.tags && task.tags.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '6px 0' }}>
                              {task.tags.map((tag, i) => (
                                <span key={i} style={{ fontSize: '10px', background: 'rgba(124, 58, 237, 0.12)', color: 'var(--accent-secondary)', padding: '2px 6px', borderRadius: '100px', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                  <Tag size={9} /> #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="task-footer">
                            <div className="task-meta">
                              <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                              {task.category && <span className="task-category">{task.category}</span>}
                            </div>
                            {due && (
                              <span className={`task-due ${due.overdue ? 'overdue' : ''}`}>
                                <Clock size={11} /> {due.label}
                              </span>
                            )}
                          </div>

                          <div className="status-pills">
                            {COLUMNS.map(c => (
                              <button key={c.key}
                                className={`status-pill ${c.key} ${task.status === c.key ? 'active' : ''}`}
                                onClick={() => task.status !== c.key && handleStatusChange(task._id, c.key)}
                                title={`Move to ${c.label}`}>{c.emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    <button className="add-task-btn" onClick={() => setModal({ defaultStatus: col.key })}>
                      <Plus size={14} /> Add Task
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {modal && (
        <TaskModal
          task={modal.task}
          defaultStatus={modal.defaultStatus}
          onClose={() => setModal(null)}
          onSaved={handleTaskSaved}
        />
      )}
    </div>
  );
};

export default Dashboard;
