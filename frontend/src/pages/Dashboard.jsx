import { useEffect, useState, useRef } from 'react';
import {
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  Clock,
  CheckSquare,
  Square,
  Tag,
  ArrowUpDown,
  LayoutGrid,
  List,
  Copy,
  BarChart3,
  Download,
  Keyboard,
  ChevronDown,
  ChevronRight,
  Filter,
  X,
  Sparkles,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import TaskModal from '../components/TaskModal';
import TaskListView from '../components/TaskListView';
import AnalyticsModal from '../components/AnalyticsModal';
import ShortcutsModal from '../components/ShortcutsModal';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  selectTasks,
  selectTaskStats,
  selectTaskStatus,
  setFilter,
  clearFilters,
  selectFilters,
} from '../features/dashboard/store/taskSlice';
import { selectUser } from '../features/auth/store/authSlice';
import useDebounce from '../hooks/useDebounce';
import { getGreeting, getDueDateLabel } from '../utils/helpers';
import { CATEGORY_OPTIONS } from '../utils/constants';
import './Dashboard.css';

const COLUMNS = [
  { key: 'todo', label: 'To Do', emoji: '📋' },
  { key: 'inprogress', label: 'In Progress', emoji: '🔄' },
  { key: 'done', label: 'Done', emoji: '✅' },
];

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const tasks = useAppSelector(selectTasks);
  const stats = useAppSelector(selectTaskStats);
  const status = useAppSelector(selectTaskStatus);
  const filters = useAppSelector(selectFilters);
  const loading = status === 'loading';

  // Modal & View States
  const [modal, setModal] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('taskflow_view_mode') || 'board';
  });

  // Filter & Search States
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dueSoonFilter, setDueSoonFilter] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // In-Card Subtasks Accordion State
  const [expandedCards, setExpandedCards] = useState({});
  const [inlineNewSubtask, setInlineNewSubtask] = useState({});

  // Drag and Drop
  const [draggedOverCol, setDraggedOverCol] = useState(null);

  const searchInputRef = useRef(null);
  const exportMenuRef = useRef(null);
  const debouncedSearch = useDebounce(searchInput, 350);

  // Close export dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Keyboard Shortcuts (Linear-style)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') {
        return;
      }
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setModal({ defaultStatus: 'todo' });
      } else if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '1') {
        e.preventDefault();
        handleSetViewMode('board');
      } else if (e.key === '2') {
        e.preventDefault();
        handleSetViewMode('list');
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setShowAnalytics(true);
      } else if (e.key === '?') {
        e.preventDefault();
        setShowShortcuts(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('taskflow_view_mode', mode);
  };

  // Fetch tasks with parameters
  useEffect(() => {
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (filters.status !== 'all') params.status = filters.status;
    if (filters.priority !== 'all') params.priority = filters.priority;
    if (categoryFilter !== 'all') params.category = categoryFilter;
    if (sortBy) params.sortBy = sortBy;
    dispatch(fetchTasks(params));
  }, [dispatch, debouncedSearch, filters.status, filters.priority, categoryFilter, sortBy]);

  // Task Operations
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
    if (newStatus === 'done') {
      toast.success('Task completed! 🎉');
    } else {
      toast.success(`Moved to ${newStatus}!`);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    await dispatch(deleteTask(taskId));
    toast.success('Task deleted! 🗑️');
  };

  // 1-Click Quick Duplicate / Clone
  const handleDuplicate = async (task) => {
    const payload = {
      title: `${task.title} (Copy)`,
      description: task.description || '',
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      category: task.category || 'General',
      dueDate: task.dueDate || null,
      tags: task.tags ? [...task.tags] : [],
      subtasks: task.subtasks
        ? task.subtasks.map((s) => ({ title: s.title, completed: s.completed }))
        : [],
    };
    await dispatch(createTask(payload));
    toast.success('Task duplicated! 📋');
  };

  // In-Card Subtasks handlers
  const toggleCardExpand = (taskId) => {
    setExpandedCards((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleToggleSubtask = async (taskId, subtaskIndex) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task || !task.subtasks) return;
    const updatedSubtasks = task.subtasks.map((st, i) =>
      i === subtaskIndex ? { ...st, completed: !st.completed } : st
    );
    await dispatch(updateTask({ id: taskId, data: { subtasks: updatedSubtasks } }));
    const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every((s) => s.completed);
    if (allDone) {
      toast.success('All subtasks completed! 🎉');
    }
  };

  const handleAddSubtaskInline = async (taskId, title) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;
    const updatedSubtasks = [...(task.subtasks || []), { title: title.trim(), completed: false }];
    await dispatch(updateTask({ id: taskId, data: { subtasks: updatedSubtasks } }));
    toast.success('Subtask added! 📝');
  };

  // Export handlers
  const handleExportCSV = () => {
    if (tasks.length === 0) {
      toast.error('No tasks to export');
      return;
    }
    const headers = [
      'Title',
      'Status',
      'Priority',
      'Category',
      'Due Date',
      'Tags',
      'Subtasks Total',
      'Subtasks Done',
      'Created At',
    ];
    const rows = tasks.map((t) => [
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.status || '',
      t.priority || '',
      `"${(t.category || '').replace(/"/g, '""')}"`,
      t.dueDate ? t.dueDate.slice(0, 10) : '',
      `"${(t.tags || []).join(';')}"`,
      t.subtasks?.length || 0,
      t.subtasks?.filter((s) => s.completed).length || 0,
      t.createdAt ? t.createdAt.slice(0, 10) : '',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `taskflow-tasks-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Tasks exported to CSV! 📊');
    setExportMenuOpen(false);
  };

  const handleExportJSON = () => {
    if (tasks.length === 0) {
      toast.error('No tasks to export');
      return;
    }
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute(
      'download',
      `taskflow-backup-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Backup exported to JSON! 💾');
    setExportMenuOpen(false);
  };

  const handleClearAllFilters = () => {
    setSearchInput('');
    dispatch(clearFilters());
    setCategoryFilter('all');
    setDueSoonFilter(false);
    toast.success('Filters cleared! 🔄');
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

    const task = tasks.find((t) => t._id === taskId);
    if (task && task.status !== colKey) {
      await handleStatusChange(taskId, colKey);
    }
  };

  // Client-side filtering for Due Soon / Overdue
  const displayedTasks = tasks.filter((t) => {
    if (!dueSoonFilter) return true;
    if (!t.dueDate || t.status === 'done') return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(t.dueDate);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 2; // Due today, tomorrow, or overdue
  });

  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    categoryFilter !== 'all' ||
    dueSoonFilter ||
    searchInput.trim() !== '';

  const activeFiltersCount =
    (filters.status !== 'all' ? 1 : 0) +
    (filters.priority !== 'all' ? 1 : 0) +
    (categoryFilter !== 'all' ? 1 : 0) +
    (dueSoonFilter ? 1 : 0) +
    (searchInput.trim() !== '' ? 1 : 0);

  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  const getColumnTasks = (s) => displayedTasks.filter((t) => t.status === s);

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
          ].map((item) => (
            <button
              key={item.key}
              className={`sidebar-item ${filters.status === item.key ? 'active' : ''}`}
              onClick={() => dispatch(setFilter({ status: item.key }))}
            >
              <span>{item.emoji}</span> {item.label}
              <span className="sidebar-item-count">{item.count}</span>
            </button>
          ))}

          <div className="sidebar-section-title" style={{ marginTop: '16px' }}>
            Priority
          </div>
          {[
            { key: 'all', label: 'All Priorities', emoji: '⚡' },
            { key: 'high', label: 'High', emoji: '🔴' },
            { key: 'medium', label: 'Medium', emoji: '🟡' },
            { key: 'low', label: 'Low', emoji: '🟢' },
          ].map((item) => (
            <button
              key={item.key}
              className={`sidebar-item ${filters.priority === item.key ? 'active' : ''}`}
              onClick={() => dispatch(setFilter({ priority: item.key }))}
            >
              <span>{item.emoji}</span> {item.label}
            </button>
          ))}

          <div className="sidebar-section-title" style={{ marginTop: '16px' }}>
            Quick Tools
          </div>
          <button className="sidebar-item" onClick={() => setShowAnalytics(true)}>
            <BarChart3 size={15} color="var(--accent-secondary)" />
            <span>Productivity Insights</span>
          </button>
          <button className="sidebar-item" onClick={() => setShowShortcuts(true)}>
            <Keyboard size={15} color="var(--text-muted)" />
            <span>Shortcuts (?)</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          {/* Header */}
          <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">
                {getGreeting()},{' '}
                <span className="gradient-text">{user?.name?.split(' ')[0] || 'Member'}</span> 👋
              </h1>
              <p className="dashboard-subtitle">
                {stats.total === 0
                  ? 'No tasks yet — create your first one!'
                  : `${stats.todo + stats.inprogress} active · ${stats.done} completed`}
              </p>
            </div>

            <div className="dashboard-header-actions">
              {/* Analytics Button */}
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowAnalytics(true)}
                title="View Productivity Analytics (A)"
              >
                <BarChart3 size={15} />
                <span className="hide-mobile">Insights</span>
              </button>

              {/* Export Dropdown */}
              <div className="export-dropdown-wrap" ref={exportMenuRef}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setExportMenuOpen(!exportMenuOpen)}
                  title="Export Tasks"
                >
                  <Download size={14} />
                  <span className="hide-mobile">Export</span>
                  <ChevronDown size={12} />
                </button>
                {exportMenuOpen && (
                  <div className="export-menu">
                    <button className="export-menu-item" onClick={handleExportCSV}>
                      Export as CSV (Excel)
                    </button>
                    <button className="export-menu-item" onClick={handleExportJSON}>
                      Export as JSON (Backup)
                    </button>
                  </div>
                )}
              </div>

              {/* Refresh Button */}
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => dispatch(fetchTasks())}
                title="Refresh Tasks"
              >
                <RefreshCw size={14} />
              </button>

              {/* New Task Button */}
              <button
                className="btn btn-primary"
                onClick={() => setModal({ defaultStatus: 'todo' })}
                title="Create New Task (N)"
              >
                <Plus size={16} /> New Task
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-row">
            {[
              { cls: 'total', label: 'Total Tasks', val: stats.total },
              { cls: 'todo', label: 'To Do', val: stats.todo },
              { cls: 'inprogress', label: 'In Progress', val: stats.inprogress },
              { cls: 'done', label: 'Completed', val: stats.done },
            ].map((s) => (
              <div key={s.cls} className={`stat-card ${s.cls}`}>
                <div className="stat-number">{s.val}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Overall Progress Bar */}
          <div className="completion-bar-wrap">
            <span className="completion-label">Overall Progress</span>
            <div className="completion-bar">
              <div className="completion-fill" style={{ width: `${completionRate}%` }} />
            </div>
            <span className="completion-pct">{completionRate}%</span>
          </div>

          {/* Search, Filters & View Toggle Toolbar */}
          <div className="toolbar">
            {/* Search Input */}
            <div className="search-box">
              <Search size={15} className="search-icon" />
              <input
                ref={searchInputRef}
                className="search-input"
                placeholder="Search tasks, descriptions, tags... (Press /)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchInput('')}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="toolbar-select-wrap">
              <Layers size={14} className="toolbar-select-icon" />
              <select
                className="form-select toolbar-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Soon Toggle Chip */}
            <button
              type="button"
              className={`filter-chip-btn ${dueSoonFilter ? 'active' : ''}`}
              onClick={() => setDueSoonFilter(!dueSoonFilter)}
              title="Filter tasks due soon or overdue"
            >
              <Clock size={13} />
              <span>Due Soon / Overdue</span>
            </button>

            {/* Sort Dropdown */}
            <div className="toolbar-select-wrap">
              <ArrowUpDown size={14} className="toolbar-select-icon" />
              <select
                className="form-select toolbar-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="dueSoon">Due Soonest</option>
              </select>
            </div>

            {/* Clear All Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                className="clear-filters-btn"
                onClick={handleClearAllFilters}
                title="Reset all search and filters"
              >
                <X size={13} />
                <span>Reset ({activeFiltersCount})</span>
              </button>
            )}

            {/* View Mode Switcher (Board vs List) */}
            <div className="view-mode-toggle">
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'board' ? 'active' : ''}`}
                onClick={() => handleSetViewMode('board')}
                title="Kanban Board View (1)"
              >
                <LayoutGrid size={15} />
                <span className="hide-mobile">Board</span>
              </button>
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => handleSetViewMode('list')}
                title="List / Table View (2)"
              >
                <List size={15} />
                <span className="hide-mobile">List</span>
              </button>
            </div>
          </div>

          {/* Main View Area (Kanban or List) */}
          {loading ? (
            <div className="loader-container" style={{ minHeight: '300px' }}>
              <div className="spinner" />
            </div>
          ) : viewMode === 'list' ? (
            <TaskListView
              tasks={displayedTasks}
              onStatusChange={handleStatusChange}
              onEdit={(task) => setModal({ task })}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onToggleSubtask={handleToggleSubtask}
              onAddSubtaskInline={handleAddSubtaskInline}
            />
          ) : (
            <div className="kanban-board">
              {COLUMNS.map((col) => {
                const colTasks = getColumnTasks(col.key);
                const isDragOver = draggedOverCol === col.key;
                return (
                  <div
                    key={col.key}
                    className={`kanban-column ${col.key} ${isDragOver ? 'drag-over' : ''}`}
                    onDragOver={(e) => handleDragOver(e, col.key)}
                    onDragLeave={() => handleDragLeave(col.key)}
                    onDrop={(e) => handleDrop(e, col.key)}
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
                    ) : (
                      colTasks.map((task) => {
                        const due = getDueDateLabel(task.dueDate);
                        const totalSubtasks = task.subtasks?.length || 0;
                        const completedSubtasks =
                          task.subtasks?.filter((s) => s.completed).length || 0;
                        const isExpanded = !!expandedCards[task._id];

                        return (
                          <div
                            key={task._id}
                            className={`task-card priority-${task.priority}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task._id)}
                          >
                            <div className="task-card-header">
                              <span className="task-title" onClick={() => setModal({ task })}>
                                {task.title}
                              </span>
                              <div className="task-actions">
                                <button
                                  className="task-action-btn"
                                  onClick={() => handleDuplicate(task)}
                                  title="Duplicate task"
                                >
                                  <Copy size={12} />
                                </button>
                                <button
                                  className="task-action-btn"
                                  onClick={() => setModal({ task })}
                                  title="Edit"
                                >
                                  <Pencil size={12} />
                                </button>
                                <button
                                  className="task-action-btn delete"
                                  onClick={() => handleDelete(task._id)}
                                  title="Delete"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>

                            {task.description && (
                              <p className="task-desc" onClick={() => setModal({ task })}>
                                {task.description}
                              </p>
                            )}

                            {/* Subtasks Progress Pill with interactive expand */}
                            {totalSubtasks > 0 ? (
                              <div
                                className={`card-subtasks-pill ${isExpanded ? 'active' : ''}`}
                                onClick={() => toggleCardExpand(task._id)}
                                title="Click to view checklist"
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
                                  {completedSubtasks}/{totalSubtasks} subtasks
                                </span>
                                {isExpanded ? (
                                  <ChevronDown size={12} />
                                ) : (
                                  <ChevronRight size={12} />
                                )}
                              </div>
                            ) : null}

                            {/* In-Card Subtasks Accordion */}
                            {isExpanded && (
                              <div className="card-subtasks-accordion">
                                <div className="card-subtasks-list">
                                  {task.subtasks &&
                                    task.subtasks.map((st, idx) => (
                                      <div
                                        key={idx}
                                        className={`card-subtask-item ${
                                          st.completed ? 'completed' : ''
                                        }`}
                                        onClick={() => handleToggleSubtask(task._id, idx)}
                                      >
                                        {st.completed ? (
                                          <CheckSquare size={13} color="var(--green)" />
                                        ) : (
                                          <Square size={13} color="var(--text-muted)" />
                                        )}
                                        <span className="card-subtask-text">{st.title}</span>
                                      </div>
                                    ))}
                                </div>
                                <form
                                  className="card-inline-add-subtask"
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    const val = inlineNewSubtask[task._id]?.trim();
                                    if (val) {
                                      handleAddSubtaskInline(task._id, val);
                                      setInlineNewSubtask((p) => ({ ...p, [task._id]: '' }));
                                    }
                                  }}
                                >
                                  <input
                                    type="text"
                                    placeholder="+ Add subtask..."
                                    className="card-inline-input"
                                    value={inlineNewSubtask[task._id] || ''}
                                    onChange={(e) =>
                                      setInlineNewSubtask((p) => ({
                                        ...p,
                                        [task._id]: e.target.value,
                                      }))
                                    }
                                  />
                                </form>
                              </div>
                            )}

                            {/* Tags */}
                            {task.tags && task.tags.length > 0 && (
                              <div
                                style={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: '4px',
                                  margin: '6px 0',
                                }}
                              >
                                {task.tags.map((tag, i) => (
                                  <span
                                    key={i}
                                    style={{
                                      fontSize: '10px',
                                      background: 'rgba(124, 58, 237, 0.12)',
                                      color: 'var(--accent-secondary)',
                                      padding: '2px 6px',
                                      borderRadius: '100px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 3,
                                    }}
                                  >
                                    <Tag size={9} /> #{tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="task-footer">
                              <div className="task-meta">
                                <span className={`badge badge-${task.priority}`}>
                                  {task.priority}
                                </span>
                                {task.category && (
                                  <span className="task-category">{task.category}</span>
                                )}
                              </div>
                              {due && (
                                <span className={`task-due ${due.overdue ? 'overdue' : ''}`}>
                                  <Clock size={11} /> {due.label}
                                </span>
                              )}
                            </div>

                            {/* Column Move Pills */}
                            <div className="status-pills">
                              {COLUMNS.map((c) => (
                                <button
                                  key={c.key}
                                  className={`status-pill ${c.key} ${
                                    task.status === c.key ? 'active' : ''
                                  }`}
                                  onClick={() =>
                                    task.status !== c.key && handleStatusChange(task._id, c.key)
                                  }
                                  title={`Move to ${c.label}`}
                                >
                                  {c.emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    )}

                    <button
                      className="add-task-btn"
                      onClick={() => setModal({ defaultStatus: col.key })}
                    >
                      <Plus size={14} /> Add Task
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Task Modal (Create / Edit) */}
      {modal && (
        <TaskModal
          task={modal.task}
          defaultStatus={modal.defaultStatus}
          onClose={() => setModal(null)}
          onSaved={handleTaskSaved}
        />
      )}

      {/* Productivity Analytics Modal */}
      {showAnalytics && (
        <AnalyticsModal
          tasks={tasks}
          stats={stats}
          onClose={() => setShowAnalytics(false)}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
    </div>
  );
};

export default Dashboard;
