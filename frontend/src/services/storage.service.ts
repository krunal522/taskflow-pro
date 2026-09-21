// ============================================
// STORAGE SERVICE — localStorage abstraction
// ============================================

import appConfig from '../config/appConfig';
import { User } from '../types/user.types';

export const storageService = {
  // Token
  getToken: (): string | null => localStorage.getItem(appConfig.tokenKey),
  setToken: (token: string): void => localStorage.setItem(appConfig.tokenKey, token),
  removeToken: (): void => localStorage.removeItem(appConfig.tokenKey),

  // User
  getUser: (): User | null => {
    try {
      const u = localStorage.getItem(appConfig.userKey);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  setUser: (user: User): void => localStorage.setItem(appConfig.userKey, JSON.stringify(user)),
  removeUser: (): void => localStorage.removeItem(appConfig.userKey),

  // Theme
  getTheme: (): string => localStorage.getItem(appConfig.themeKey) || appConfig.defaultTheme,
  setTheme: (theme: string): void => localStorage.setItem(appConfig.themeKey, theme),

  // Utility
  clearAuth: (): void => {
    localStorage.removeItem(appConfig.tokenKey);
    localStorage.removeItem(appConfig.userKey);
  },

  // Generic
  get: <T>(key: string): T | null => {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  },
  set: <T>(key: string, value: T): void => localStorage.setItem(key, JSON.stringify(value)),
  remove: (key: string): void => localStorage.removeItem(key),
};
