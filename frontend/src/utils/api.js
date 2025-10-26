import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('operator');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Operator API
export const operatorAPI = {
  register: (data) => api.post('/operator/register', data),
  login: (data) => api.post('/operator/login', data),
  getProfile: () => api.get('/operator/profile'),
  updateProfile: (data) => api.put('/operator/profile', data),
};

// Service API
export const serviceAPI = {
  register: (data) => api.post('/service/register', data),
  getList: () => api.get('/service/list'),
  getService: (id) => api.get(`/service/${id}`),
  update: (id, data) => api.put(`/service/${id}`, data),
  regenerateKey: (id) => api.post(`/service/${id}/regenerate-key`),
  getStats: (id) => api.get(`/service/${id}/stats`),
  delete: (id) => api.delete(`/service/${id}`),
};

// Auth API (for testing)
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verify: () => api.get('/auth/verify'),
  logout: () => api.post('/auth/logout'),
  getLogs: () => api.get('/auth/logs'),
};

export default api;
