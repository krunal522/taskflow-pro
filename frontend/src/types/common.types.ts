// ============================================
// COMMON TYPES — Shared across the app
// ============================================

export type TaskStatus = 'todo' | 'inprogress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type Theme = 'dark' | 'light';

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  dueDate: string | null;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  total: number;
  todo: number;
  inprogress: number;
  done: number;
  highPriority: number;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  dueDate?: string | null;
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {}

export interface SelectOption {
  value: string;
  label: string;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  badge?: number;
}

export interface ToastConfig {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';
