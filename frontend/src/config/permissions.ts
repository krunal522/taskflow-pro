// ============================================
// PERMISSIONS CONFIG
// Role-based access control definitions
// ============================================

import { UserRole } from '../types/user.types';

export type Permission =
  | 'task:create'
  | 'task:read'
  | 'task:update'
  | 'task:delete'
  | 'user:read'
  | 'user:update'
  | 'admin:access';

export const rolePermissions: Record<UserRole, Permission[]> = {
  user: ['task:create', 'task:read', 'task:update', 'task:delete', 'user:read', 'user:update'],
  admin: ['task:create', 'task:read', 'task:update', 'task:delete', 'user:read', 'user:update', 'admin:access'],
};

export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  return rolePermissions[role]?.includes(permission) ?? false;
};
