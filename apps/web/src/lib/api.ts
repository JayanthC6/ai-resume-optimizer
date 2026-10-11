import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const defaultBaseUrl = import.meta.env.DEV
  ? 'http://localhost:8000'
  : 'http://localhost:8000';

const resolvedBaseUrl = (import.meta.env.VITE_API_URL || defaultBaseUrl).replace(/\/$/, '');

const api = axios.create({
  baseURL: resolvedBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const url = error.config?.url || '';
      const isAuthEndpoint = [
        '/auth/login',
        '/auth/google-login',
        '/auth/register',
        '/auth/forgot-password',
        '/auth/reset-password',
      ].some((endpoint) => url.includes(endpoint));

      if (!isAuthEndpoint) {
        useAuthStore.getState().logout();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
