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

export default api;
