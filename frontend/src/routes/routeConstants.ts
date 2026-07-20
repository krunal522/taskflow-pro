// ============================================
// ROUTE CONSTANTS — no magic strings
// ============================================

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  NOT_FOUND: '*',
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];
