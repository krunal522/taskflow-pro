// ============================================
// PROFILE SERVICE — Business logic for profile
// Decoupled from React — pure async functions
// ============================================

import { userAPI } from '../api/user.api';
import { storageService } from './storage.service';
import { UpdateProfilePayload, DeleteAccountPayload, User } from '../types/user.types';

export const profileService = {
  /**
   * Fetch fresh profile from API and persist to localStorage
   */
  getProfile: async (): Promise<User> => {
    const res = await userAPI.getProfile();
    const user: User = res.data.user;
    storageService.setUser(user);
    return user;
  },

  /**
   * Update profile fields — persists updated user to localStorage
   */
  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    const res = await userAPI.updateProfile(payload);
    const user: User = res.data.user;
    storageService.setUser(user);
    return user;
  },

  /**
   * Upload a new avatar image (multipart/form-data)
   */
  uploadAvatar: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await userAPI.uploadAvatar(formData);
    const user: User = res.data.user;
    storageService.setUser(user);
    return user;
  },

  /**
   * Delete account and cascade delete all tasks.
   * Clears all auth data from localStorage.
   */
  deleteAccount: async (payload: DeleteAccountPayload): Promise<void> => {
    await userAPI.deleteAccount(payload);
    storageService.clearAuth();
  },

  /**
   * Fetch task statistics for the current user
   */
  getStats: async () => {
    const res = await userAPI.getStats();
    return res.data.stats;
  },
};
