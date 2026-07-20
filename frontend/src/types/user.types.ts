// ============================================
// USER TYPES
// ============================================

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthUser extends User {
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  name?: string;
  password?: string;
}

export interface UserStats {
  total: number;
  todo: number;
  inprogress: number;
  done: number;
  completionRate: number;
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
}
