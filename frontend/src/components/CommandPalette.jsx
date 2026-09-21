import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
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
  onExportCSV,
  onExportJSON,
  onFilterPriority,
  onFilterCategory,
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
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Base Commands
  const baseActions = [
    {
      id: 'action-new-task',
      title: 'Create New Task',
      subtitle: 'Open task creation dialog',
      category: 'Actions',
      icon: Plus,
      badge: 'N',
      action: () => {
        onClose();
        onNewTask();
      },
    },
    {
      id: 'action-focus-timer',
      title: 'Start Focus Timer',
      subtitle: 'Launch Pomodoro deep work session',
      category: 'Tools',
      icon: Clock,
      action: () => {
        onClose();
        onOpenFocusTimer();
      },
    },
    {
      id: 'action-analytics',
      title: 'Productivity & Velocity Insights',
      subtitle: 'View completion rate and metrics',
      category: 'Tools',
      icon: BarChart3,
      badge: 'A',
      action: () => {
        onClose();
        onOpenAnalytics();
      },
    },
    {
      id: 'action-activity',
      title: 'Session Activity & Audit Log',
      subtitle: 'Review recent task operations',
      category: 'Tools',
      icon: Activity,
      action: () => {
        onClose();
        onOpenActivity();
      },
    },
    {
      id: 'action-switch-board',
      title: 'Switch to Kanban Board View',
      subtitle: 'Interactive visual workflow columns',
      category: 'Navigation',
      icon: LayoutGrid,
      badge: '1',
      action: () => {
        onClose();
        onSwitchView('board');
      },
    },
    {
      id: 'action-switch-list',
      title: 'Switch to List View',
      subtitle: 'High-density tabular table view',
      category: 'Navigation',
      icon: List,
      badge: '2',
      action: () => {
        onClose();
        onSwitchView('list');
      },
    },
    {
      id: 'action-export-csv',
      title: 'Export Tasks to CSV',
      subtitle: 'Download spreadsheet compatible file',
      category: 'Export',
      icon: Download,
      action: () => {
        onClose();
        onExportCSV();
      },
    },
    {
      id: 'action-export-json',
      title: 'Export Backup to JSON',
      subtitle: 'Download full tasks data archive',
      category: 'Export',
      icon: Download,
      action: () => {
        onClose();
        onExportJSON();
      },
    },
    {
      id: 'filter-high-prio',
      title: 'Filter by High Priority',
      subtitle: 'Isolate critical tasks needing immediate attention',
      category: 'Filters',
      icon: Layers,
      action: () => {
        onClose();
        onFilterPriority('high');
      },
    },
  ];

  // Matching Tasks
  const matchingTasks = tasks
    .filter((t) => {
      if (!query.trim()) return false;
      const q = query.toLowerCase();
      return (
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(q))
      );
    })
    .slice(0, 6)
    .map((t) => ({
      id: `task-${t._id}`,
      title: t.title,
      subtitle: `${t.category || 'General'} · ${t.priority.toUpperCase()} · ${t.status}`,
      category: 'Matching Tasks',
      icon: CheckCircle2,
      badge: t.status,
      action: () => {
        onClose();
        onSelectTask(t);
      },
    }));

  // Filtered Actions
  const filteredActions = baseActions.filter((a) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.subtitle.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
    );
  });

  const allItems = [...matchingTasks, ...filteredActions];

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (allItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allItems.length) % (allItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].action();
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex];
      activeEl?.scrollIntoView?.({ block: 'nearest' });
    }
  }, [selectedIndex]);

  return (
    <div className="palette-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="palette-container">
        {/* Search Header */}
        <div className="palette-search-wrap">
          <Search size={18} className="palette-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="palette-search-input"
            placeholder="Type a command or search tasks... (↑↓ to navigate, ↵ to run)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <kbd className="palette-esc-key" onClick={onClose}>
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="palette-results" ref={listRef}>
          {allItems.length === 0 ? (
            <div className="palette-empty">
              <span>No commands or tasks found matching &quot;{query}&quot;</span>
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
