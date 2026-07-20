// ============================================
// API — AUTH Endpoints
// ============================================

import axiosInstance from '../lib/axios';
import { LoginPayload, RegisterPayload } from '../types/user.types';

export const authAPI = {
  register: (data: RegisterPayload) =>
    axiosInstance.post('/auth/register', data),

  login: (data: LoginPayload) =>
    axiosInstance.post('/auth/login', data),

  getMe: () =>
    axiosInstance.get('/auth/me'),
};
