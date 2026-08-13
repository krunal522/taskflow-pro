// ============================================
// API — USER & TASK Endpoints
// ============================================

import axiosInstance from '../lib/axios';
import { UpdateProfilePayload, DeleteAccountPayload } from '../types/user.types';
import { CreateTaskPayload, UpdateTaskPayload, TaskStatus } from '../types/common.types';

// USER API
export const userAPI = {
  getProfile:    ()                              => axiosInstance.get('/users/me'),
  updateProfile: (data: UpdateProfilePayload)    => axiosInstance.put('/users/me', data),
  deleteAccount: (data: DeleteAccountPayload)    => axiosInstance.delete('/users/me', { data }),
  uploadAvatar:  (formData: FormData)            => axiosInstance.post('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getStats:      ()                              => axiosInstance.get('/users/stats'),
};

// TASK API
export const taskAPI = {
  getAll:       (params?: Record<string, string>) => axiosInstance.get('/tasks', { params }),
  getById:      (id: string)                      => axiosInstance.get(`/tasks/${id}`),
  create:       (data: CreateTaskPayload)         => axiosInstance.post('/tasks', data),
  update:       (id: string, data: UpdateTaskPayload) => axiosInstance.put(`/tasks/${id}`, data),
  updateStatus: (id: string, status: TaskStatus)  => axiosInstance.patch(`/tasks/${id}/status`, { status }),
  delete:       (id: string)                      => axiosInstance.delete(`/tasks/${id}`),
};
