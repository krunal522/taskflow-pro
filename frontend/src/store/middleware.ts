// ============================================
// REDUX MIDDLEWARE
// ============================================

import { Middleware } from '@reduxjs/toolkit';

// Dev-only logger middleware
export const loggerMiddleware: Middleware = (storeAPI) => (next) => (action: any) => {
  if (import.meta.env.DEV) {
    console.group(`%c Redux: ${action.type}`, 'color: #7c3aed; font-weight: bold;');
    console.log('Prev State:', storeAPI.getState());
    console.log('Action:', action);
    const result = next(action);
    console.log('Next State:', storeAPI.getState());
    console.groupEnd();
    return result;
  }
  return next(action);
};
