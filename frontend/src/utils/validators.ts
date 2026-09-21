// ============================================
// UTILS — Validators
// ============================================

export const validators = {
  email: (email: string): string | null => {
    if (!email || !email.trim()) return 'Email address is required';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) return 'Please enter a valid email address (e.g. name@domain.com)';
    return null;
  },

  password: (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  },

  confirmPassword: (password: string, confirm: string): string | null => {
    if (!confirm) return 'Please confirm your password';
    if (password !== confirm) return 'Passwords do not match';
    return null;
  },

  name: (name: string): string | null => {
    if (!name || !name.trim()) return 'Full name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (name.trim().length > 50) return 'Name cannot exceed 50 characters';
    if (!/^[a-zA-Z\s.'-]+$/.test(name.trim())) return 'Name should only contain letters and spaces';
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

export interface PasswordCriterion {
  id: string;
  label: string;
  met: boolean;
}

export interface PasswordEvaluation {
  score: 0 | 1 | 2 | 3 | 4;
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
  criteria: PasswordCriterion[];
}

export const getPasswordEvaluation = (password: string): PasswordEvaluation => {
  const criteria: PasswordCriterion[] = [
    { id: 'length', label: 'At least 8 characters', met: password.length >= 8 },
    { id: 'letter', label: 'Contains letters', met: /[a-zA-Z]/.test(password) },
    { id: 'number', label: 'Contains at least one number', met: /[0-9]/.test(password) },
    { id: 'special', label: 'Uppercase or special symbol', met: /[A-Z]/.test(password) || /[^A-Za-z0-9]/.test(password) },
  ];

  const metCount = criteria.filter((c) => c.met).length;
  let score: 0 | 1 | 2 | 3 | 4 = 0;
  if (password.length >= 6) {
    score = Math.min(4, Math.max(1, metCount)) as 0 | 1 | 2 | 3 | 4;
  }

  const levels: Record<number, { label: PasswordEvaluation['label']; color: string }> = {
    0: { label: 'Very Weak', color: '#94a3b8' },
    1: { label: 'Weak', color: '#ef4444' },
    2: { label: 'Fair', color: '#f59e0b' },
    3: { label: 'Good', color: '#3b82f6' },
    4: { label: 'Strong', color: '#10b981' },
  };

  return {
    score,
    label: levels[score].label,
    color: levels[score].color,
    criteria,
  };
};

export const getPasswordStrength = (password: string): 0 | 1 | 2 | 3 | 4 => {
  return getPasswordEvaluation(password).score;
};
