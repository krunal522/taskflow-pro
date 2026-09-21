import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  BarChart3,
  Download,
  Clock,
  Sparkles,
  ArrowRight,
  Tag,
  CheckCircle2,
  Calendar,
  Layers,
  Activity,
  X,
  Keyboard,
  RotateCcw,
  User,
  LogOut,
  AlertTriangle,
  Flame,
  CheckSquare,
  ArrowUpDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import './CommandPalette.css';

const CommandPalette = ({
  isOpen,
  onClose,
  tasks = [],
  onSelectTask,
  onNewTask,
  onSwitchView,
  onOpenAnalytics,
  onOpenFocusTimer,
  onOpenActivity,
  onOpenShortcuts,
  onExportCSV,
  onExportJSON,
  onFilterPriority,
  onFilterStatus,
  onFilterCategory,
  onFilterDueSoon,
  onClearAllFilters,
  onSortChange,
  onRefresh,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Auto focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Safe tasks array
  const safeTasks = useMemo(() => (Array.isArray(tasks) ? tasks : []), [tasks]);

  // Base Commands with rich keyword matching
  const baseActions = useMemo(
    () => [
      // Actions
      {
        id: 'action-new-task',
        title: 'Create New Task',
        subtitle: 'Open task creation modal with subtasks & tags',
        category: 'Quick Actions',
        icon: Plus,
        badge: 'N',
        keywords: ['new', 'create', 'add', 'task', 'todo', 'item', 'make', '+'],
        action: () => {
          onClose();
          onNewTask?.();
        },
      },
      {
        id: 'action-refresh',
        title: 'Refresh & Sync Tasks',
        subtitle: 'Fetch latest updates from the server database',
        category: 'Quick Actions',
        icon: RotateCcw,
        badge: 'R',
        keywords: ['refresh', 'reload', 'sync', 'update', 'fetch'],
        action: () => {
          onClose();
          onRefresh?.();
          toast.success('Tasks synced! 🔄');
        },
      },
      {
        id: 'action-clear-filters',
        title: 'Clear All Filters & Reset',
        subtitle: 'Show all tasks across every category & priority',
        category: 'Quick Actions',
        icon: X,
        keywords: ['clear', 'reset', 'remove', 'all', 'filters', 'clean'],
        action: () => {
          onClose();
          onClearAllFilters?.();
          toast.success('Filters cleared — showing all tasks! 📋');
        },
      },

      // Tools
      {
        id: 'action-focus-timer',
        title: 'Start Deep Work Focus Engine',
        subtitle: 'Launch Pomodoro timer (25m Deep Work / 5m Break)',
        category: 'Tools',
        icon: Clock,
        badge: 'F',
        keywords: ['focus', 'pomodoro', 'timer', 'clock', 'deep work', 'time', 'study'],
        action: () => {
          onClose();
          onOpenFocusTimer?.();
        },
      },
      {
        id: 'action-analytics',
        title: 'Productivity & Velocity Insights',
        subtitle: 'View completion rate, breakdown charts & velocity',
        category: 'Tools',
        icon: BarChart3,
        badge: 'A',
        keywords: ['analytics', 'insights', 'stats', 'velocity', 'chart', 'graphs', 'completion'],
        action: () => {
          onClose();
          onOpenAnalytics?.();
        },
      },
      {
        id: 'action-activity',
        title: 'Session Activity & Audit Log',
        subtitle: 'Review timeline of all task creations, moves & edits',
        category: 'Tools',
        icon: Activity,
        keywords: ['activity', 'log', 'audit', 'history', 'trace', 'recent'],
        action: () => {
          onClose();
          onOpenActivity?.();
        },
      },
      {
        id: 'action-shortcuts',
        title: 'Keyboard Shortcuts Reference',
        subtitle: 'View all keyboard navigation hotkeys',
        category: 'Tools',
        icon: Keyboard,
        badge: '?',
        keywords: ['shortcuts', 'hotkeys', 'keyboard', 'help', 'keys'],
        action: () => {
          onClose();
          onOpenShortcuts?.();
        },
      },

      // Views
      {
        id: 'action-switch-board',
        title: 'Switch to Kanban Board View',
        subtitle: 'Interactive drag-and-drop column workflow',
        category: 'Views & Display',
        icon: LayoutGrid,
        badge: '1',
        keywords: ['board', 'kanban', 'columns', 'drag', 'cards', 'view'],
        action: () => {
          onClose();
          onSwitchView?.('board');
          toast.success('Switched to Kanban Board View 📋');
        },
      },
      {
        id: 'action-switch-list',
        title: 'Switch to Dense List View',
        subtitle: 'Tabular overview with batch operations & status toggles',
        category: 'Views & Display',
        icon: List,
        badge: '2',
        keywords: ['list', 'table', 'rows', 'dense', 'compact', 'view'],
        action: () => {
          onClose();
          onSwitchView?.('list');
          toast.success('Switched to List View 📑');
        },
      },

      // Status Filters
      {
        id: 'filter-status-all',
        title: 'Status: Show All Tasks',
        subtitle: 'Remove status filter and show all columns',
        category: 'Status Filters',
        icon: CheckSquare,
        keywords: ['all', 'status', 'everything', 'both', 'columns'],
        action: () => {
          onClose();
          onFilterStatus?.('all');
          toast.success('Showing all statuses 📋');
        },
      },
      {
        id: 'filter-status-todo',
        title: 'Status: Filter To Do Only',
        subtitle: 'Isolate pending tasks waiting to be started',
        category: 'Status Filters',
        icon: CheckSquare,
        keywords: ['todo', 'to do', 'pending', 'open', 'backlog', 'unstarted'],
        action: () => {
          onClose();
          onFilterStatus?.('todo');
          toast.success('Filtered: To Do tasks 📋');
        },
      },
      {
        id: 'filter-status-inprogress',
        title: 'Status: Filter In Progress Only',
        subtitle: 'Show tasks currently being worked on',
        category: 'Status Filters',
        icon: Sparkles,
        keywords: ['in progress', 'progress', 'doing', 'working', 'active'],
        action: () => {
          onClose();
          onFilterStatus?.('inprogress');
          toast.success('Filtered: In Progress tasks 🔄');
        },
      },
      {
        id: 'filter-status-done',
        title: 'Status: Filter Done Only',
        subtitle: 'Show completed and archived tasks',
        category: 'Status Filters',
        icon: CheckCircle2,
        keywords: ['done', 'completed', 'finished', 'closed', 'resolved'],
        action: () => {
          onClose();
          onFilterStatus?.('done');
          toast.success('Filtered: Completed tasks ✅');
        },
      },

      // Priority Filters
      {
        id: 'filter-high-prio',
        title: 'Priority: High Priority (Critical)',
        subtitle: 'Isolate tasks requiring urgent attention',
        category: 'Priority Filters',
        icon: Flame,
        badge: 'HIGH',
        keywords: ['high', 'urgent', 'critical', 'priority', 'p1', 'p0', 'important'],
        action: () => {
          onClose();
          onFilterPriority?.('high');
          toast.success('Filtered by High Priority 🔴');
        },
      },
      {
        id: 'filter-med-prio',
        title: 'Priority: Medium Priority',
        subtitle: 'Show regular priority operational tasks',
        category: 'Priority Filters',
        icon: Layers,
        badge: 'MED',
        keywords: ['medium', 'med', 'normal', 'priority', 'p2'],
        action: () => {
          onClose();
          onFilterPriority?.('medium');
          toast.success('Filtered by Medium Priority 🟡');
        },
      },
      {
        id: 'filter-low-prio',
        title: 'Priority: Low Priority',
        subtitle: 'Show non-urgent backlog items',
        category: 'Priority Filters',
        icon: Layers,
        badge: 'LOW',
        keywords: ['low', 'minor', 'priority', 'p3'],
        action: () => {
          onClose();
          onFilterPriority?.('low');
          toast.success('Filtered by Low Priority 🟢');
        },
      },
      {
        id: 'filter-due-soon',
        title: 'Deadlines: Due Soon & Overdue',
        subtitle: 'Show tasks due today, tomorrow, or past due',
        category: 'Priority Filters',
        icon: Calendar,
        keywords: ['due', 'overdue', 'soon', 'deadline', 'today', 'tomorrow'],
        action: () => {
          onClose();
          onFilterDueSoon?.();
          toast.success('Filtered: Due Soon / Overdue ⏰');
        },
      },

      // Sorting
      {
        id: 'action-sort-newest',
        title: 'Sort: Newest First',
        subtitle: 'Order tasks by latest creation timestamp',
        category: 'Sorting',
        icon: ArrowUpDown,
        keywords: ['sort', 'newest', 'latest', 'recent', 'created'],
        action: () => {
          onClose();
          onSortChange?.('newest');
          toast.success('Sorted: Newest First ⬇️');
        },
      },
      {
        id: 'action-sort-oldest',
        title: 'Sort: Oldest First',
        subtitle: 'Order tasks chronologically from earliest',
        category: 'Sorting',
        icon: ArrowUpDown,
        keywords: ['sort', 'oldest', 'first', 'earliest'],
        action: () => {
          onClose();
          onSortChange?.('oldest');
          toast.success('Sorted: Oldest First ⬆️');
        },
      },
      {
        id: 'action-sort-due',
        title: 'Sort: Due Date',
        subtitle: 'Order tasks by closest upcoming deadline',
        category: 'Sorting',
        icon: Calendar,
        keywords: ['sort', 'due', 'deadline', 'date'],
        action: () => {
          onClose();
          onSortChange?.('dueSoon');
          toast.success('Sorted: Closest Deadline First 📅');
        },
      },

      // Export
      {
        id: 'action-export-csv',
        title: 'Export Tasks to CSV',
        subtitle: 'Download spreadsheet compatible CSV file',
        category: 'Data Export',
        icon: Download,
        keywords: ['export', 'csv', 'excel', 'spreadsheet', 'download', 'table'],
        action: () => {
          onClose();
          onExportCSV?.();
        },
      },
      {
        id: 'action-export-json',
        title: 'Export Full Backup to JSON',
        subtitle: 'Download complete structured JSON archive',
        category: 'Data Export',
        icon: Download,
        keywords: ['export', 'json', 'backup', 'archive', 'download', 'save'],
        action: () => {
          onClose();
          onExportJSON?.();
        },
      },
    ],
    [
      onClose,
      onNewTask,
      onRefresh,
      onClearAllFilters,
      onOpenFocusTimer,
      onOpenAnalytics,
      onOpenActivity,
      onOpenShortcuts,
      onSwitchView,
      onFilterStatus,
      onFilterPriority,
      onFilterDueSoon,
      onSortChange,
      onExportCSV,
      onExportJSON,
    ]
  );

  // Search Matching Tasks with bulletproof guards
  const matchingTasks = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();

    return safeTasks
      .filter((t) => {
        if (!t) return false;
        const titleMatch = t.title ? t.title.toLowerCase().includes(q) : false;
        const descMatch = t.description ? t.description.toLowerCase().includes(q) : false;
        const catMatch = t.category ? t.category.toLowerCase().includes(q) : false;
        const statusMatch = t.status ? t.status.toLowerCase().includes(q) : false;
        const prioMatch = t.priority ? t.priority.toLowerCase().includes(q) : false;
        const tagMatch =
          Array.isArray(t.tags) &&
          t.tags.some((tag) => typeof tag === 'string' && tag.toLowerCase().includes(q));

        return titleMatch || descMatch || catMatch || statusMatch || prioMatch || tagMatch;
      })
      .slice(0, 8)
      .map((t) => {
        const priorityStr = (t.priority || 'medium').toUpperCase();
        const statusStr = t.status || 'todo';
        const categoryStr = t.category || 'General';

        return {
          id: `task-${t._id || Math.random()}`,
          title: t.title || 'Untitled Task',
          subtitle: `${categoryStr} · ${priorityStr} · ${statusStr}`,
          category: 'Matching Tasks',
          icon: CheckCircle2,
          badge: statusStr,
          action: () => {
            onClose();
            onSelectTask?.(t);
          },
        };
      });
  }, [query, safeTasks, onClose, onSelectTask]);

  // Filtered Actions with fuzzy keyword matching
  const filteredActions = useMemo(() => {
    if (!query.trim()) return baseActions;
    const q = query.toLowerCase().trim();

    return baseActions.filter((a) => {
      const titleMatch = a.title.toLowerCase().includes(q);
      const subtitleMatch = a.subtitle.toLowerCase().includes(q);
      const categoryMatch = a.category.toLowerCase().includes(q);
      const keywordMatch = a.keywords?.some((k) => k.toLowerCase().includes(q));
      return titleMatch || subtitleMatch || categoryMatch || keywordMatch;
    });
  }, [query, baseActions]);

  const allItems = useMemo(
    () => [...matchingTasks, ...filteredActions],
    [matchingTasks, filteredActions]
  );

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (allItems.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % allItems.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (allItems.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + allItems.length) % allItems.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].action();
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current && allItems.length > 0) {
      const activeEl = listRef.current.children[selectedIndex];
      if (activeEl?.scrollIntoView) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, allItems.length]);

  if (!isOpen) return null;

  return (
    <div
      className="palette-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="palette-container">
        {/* Search Header */}
        <div className="palette-search-wrap">
          <Search size={18} className="palette-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="palette-search-input"
            placeholder="Search commands, tasks, filters... (↑↓ navigate, ↵ run)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button
              type="button"
              className="palette-clear-btn"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
          <kbd className="palette-esc-key" onClick={onClose} title="Press ESC to close">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="palette-results" ref={listRef}>
          {allItems.length === 0 ? (
            <div className="palette-empty">
              <Sparkles size={28} className="palette-empty-icon" />
              <div className="palette-empty-title">
                No commands or tasks found matching &quot;{query}&quot;
              </div>
              <p className="palette-empty-subtitle">Quick suggestion shortcuts:</p>
              <div className="palette-suggestions">
                <button
                  type="button"
                  className="palette-suggestion-chip"
                  onClick={() => setQuery('task')}
                >
                  Create Task
                </button>
                <button
                  type="button"
                  className="palette-suggestion-chip"
                  onClick={() => setQuery('board')}
                >
                  Kanban Board
                </button>
                <button
                  type="button"
                  className="palette-suggestion-chip"
                  onClick={() => setQuery('focus')}
                >
                  Focus Timer
                </button>
                <button
                  type="button"
                  className="palette-suggestion-chip"
                  onClick={() => setQuery('high')}
                >
                  High Priority
                </button>
                <button
                  type="button"
                  className="palette-suggestion-chip"
                  onClick={() => setQuery('export')}
                >
                  Export Data
                </button>
              </div>
            </div>
          ) : (
            allItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  className={`palette-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="palette-item-icon">
                    <Icon size={16} />
                  </div>
                  <div className="palette-item-content">
                    <div className="palette-item-title">{item.title}</div>
                    <div className="palette-item-subtitle">{item.subtitle}</div>
                  </div>
                  <div className="palette-item-meta">
                    <span className="palette-item-category">{item.category}</span>
                    {item.badge && <kbd className="palette-item-badge">{item.badge}</kbd>}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="palette-footer">
          <div className="palette-footer-hints">
            <span>
              <kbd>↑</kbd> <kbd>↓</kbd> Navigate
            </span>
            <span>
              <kbd>↵</kbd> Select
            </span>
            <span>
              <kbd>ESC</kbd> Close
            </span>
          </div>
          <span className="palette-footer-brand">TaskFlow Command Engine</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
