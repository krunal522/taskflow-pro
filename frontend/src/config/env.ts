// ============================================
// ENVIRONMENT CONFIG
// All env vars accessed through this module
// ============================================

const env = {
  API_URL: import.meta.env.VITE_API_URL || 'https://taskflow-pro-azkc.onrender.com/api',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'TaskFlow Pro',
} as const;

export default env;
