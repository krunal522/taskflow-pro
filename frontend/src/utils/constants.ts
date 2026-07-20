// ============================================
// UTILS — Constants
// ============================================

export const TASK_STATUS_OPTIONS = [
  { value: 'todo', label: '📋 To Do' },
  { value: 'inprogress', label: '🔄 In Progress' },
  { value: 'done', label: '✅ Done' },
] as const;

export const PRIORITY_OPTIONS = [
  { value: 'low', label: '🟢 Low' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'high', label: '🔴 High' },
] as const;

export const CATEGORY_OPTIONS = [
  'General', 'Development', 'Design', 'Backend',
  'DevOps', 'Testing', 'Security', 'Research', 'Marketing',
] as const;

export const STATUS_COLORS = {
  todo: { bg: 'rgba(239,68,68,0.1)', text: '#f87171', border: 'rgba(239,68,68,0.25)' },
  inprogress: { bg: 'rgba(245,158,11,0.1)', text: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
  done: { bg: 'rgba(16,185,129,0.1)', text: '#34d399', border: 'rgba(16,185,129,0.25)' },
} as const;

export const PRIORITY_COLORS = {
  high: { bg: 'rgba(239,68,68,0.15)', text: '#f87171' },
  medium: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24' },
  low: { bg: 'rgba(16,185,129,0.15)', text: '#34d399' },
} as const;
