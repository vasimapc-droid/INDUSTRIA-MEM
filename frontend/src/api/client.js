import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
// AI service is accessed through the backend proxy: /api/ai/*
export const AI_BASE = API_BASE + '/ai';

export { API_BASE };

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'ngrok-skip-browser-warning': 'true' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('im_token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  config.headers['ngrok-skip-browser-warning'] = 'true';
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('im_token');
      localStorage.removeItem('im_user');
      if (!window.location.pathname.startsWith('/login')) window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;