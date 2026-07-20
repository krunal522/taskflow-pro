// ============================================
// AUTH SERVICE — Business logic for auth
// Decoupled from React — pure functions
// ============================================

import { authAPI } from '../api/auth.api';
import { storageService } from './storage.service';

export const authService = {
  login: async (payload: { email: string; password: string }) => {
    const res = await authAPI.login(payload);
    const { token, user } = res.data;
    if (token) storageService.setToken(token);
    if (user) storageService.setUser(user);
    return { token, user };
  },

  register: async (payload: { name: string; email: string; password: string }) => {
    const res = await authAPI.register(payload);
    const { token, user } = res.data;
    if (token) storageService.setToken(token);
    if (user) storageService.setUser(user);
    return { token, user };
  },

  logout: (): void => {
    storageService.clearAuth();
  },

  getMe: async () => {
    const res = await authAPI.getMe();
    return res.data.user;
  },

  isAuthenticated: (): boolean => !!storageService.getToken(),
};
