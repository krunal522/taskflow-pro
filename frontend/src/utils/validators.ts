// ============================================
// UTILS — Validators
// ============================================

export const validators = {
  email: (email: string): string | null => {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email address';
    return null;
  },

  password: (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  },

  name: (name: string): string | null => {
    if (!name || !name.trim()) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    return null;
  },

  taskTitle: (title: string): string | null => {
    if (!title || !title.trim()) return 'Task title is required';
    if (title.trim().length < 2) return 'Title must be at least 2 characters';
    if (title.trim().length > 100) return 'Title must be under 100 characters';
    return null;
  },

  required: (value: string, field: string = 'This field'): string | null => {
    if (!value || !value.trim()) return `${field} is required`;
    return null;
  },
};

export const getPasswordStrength = (password: string): 0 | 1 | 2 | 3 | 4 => {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score as 0 | 1 | 2 | 3 | 4;
};
