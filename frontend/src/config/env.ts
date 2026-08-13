// ============================================
// ENVIRONMENT CONFIG
// All env vars accessed through this module
// ============================================

const env = {
  API_URL: import.meta.env.VITE_API_URL || 'https://taskflow-pro-jdhe.onrender.com/api',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'TaskFlow Pro',
  NODE_ENV: import.meta.env.MODE || 'development',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;

export default env;
