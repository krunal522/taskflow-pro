import { useEffect, useState } from 'react';
import { Plus, Search, RefreshCw, Pencil, Trash2, Clock } from 'lucide-react';
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
import { TASK_STATUS_OPTIONS } from '../utils/constants';
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
  const debouncedSearch = useDebounce(searchInput, 400);

  // Fetch when filters change (debounced search)
  useEffect(() => {
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (filters.status !== 'all') params.status = filters.status;
    if (filters.priority !== 'all') params.priority = filters.priority;
    dispatch(fetchTasks(params));
  }, [dispatch, debouncedSearch, filters.status, filters.priority]);

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

          {/* Search */}
          <div className="toolbar">
            <div className="search-box">
              <Search size={15} className="search-icon" />
              <input className="search-input" placeholder="Search tasks..."
                value={searchInput} onChange={e => setSearchInput(e.target.value)} />
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
                return (
                  <div key={col.key} className={`kanban-column ${col.key}`}>
                    <div className="column-header">
                      <div className="column-title">
                        <span className="col-dot" /> {col.emoji} {col.label}
                      </div>
                      <span className="column-count">{colTasks.length}</span>
                    </div>

                    {colTasks.length === 0 ? (
                      <div className="empty-state" style={{ padding: '32px 16px' }}>
                        <div className="empty-icon">📭</div>
                        <p className="empty-text">No tasks here</p>
                      </div>
                    ) : colTasks.map(task => {
                      const due = getDueDateLabel(task.dueDate);
                      return (
                        <div key={task._id} className="task-card">
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
