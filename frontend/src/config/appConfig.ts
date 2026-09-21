// ============================================
// APP CONFIG — Global app configuration
// ============================================

import env from './env';

const appConfig = {
  appName: env.APP_NAME,
  version: '1.0.0',
  apiBaseUrl: env.API_URL,
  tokenKey: 'taskflow_token',
  userKey: 'taskflow_user',
  themeKey: 'taskflow_theme',
  defaultTheme: 'dark' as const,
  requestTimeout: 35_000, // 35 seconds (allows for Render free tier cold starts)
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },
  taskCategories: [
    'General', 'Development', 'Design', 'Backend',
    'DevOps', 'Testing', 'Security', 'Research', 'Marketing',
  ],
  toast: {
    duration: 4000,
    position: 'top-right' as const,
  },
} as const;

export default appConfig;
