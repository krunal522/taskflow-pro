// ============================================
// LIB/AXIOS — Configured axios instance
// Single source of truth for HTTP client
// ============================================

import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import appConfig from '../config/appConfig';
import { storageService } from '../services/storage.service';

const axiosInstance = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: appConfig.requestTimeout,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor ──────────────────────
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storageService.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ── Response Interceptor ─────────────────────
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      storageService.clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
