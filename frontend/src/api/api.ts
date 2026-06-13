import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const IMAGE_BASE_URL = API_URL.replace('/api', '/uploads');

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_URL}/auth/login`,
  REGISTER: `${API_URL}/auth/register`,
  PROFILE: `${API_URL}/auth/profile`,

  // Prediction
  PREDICT: `${API_URL}/predict`,

  // History
  HISTORY: `${API_URL}/history`,
  HISTORY_STATS: `${API_URL}/history/stats`,
  HISTORY_BY_ID: (id: string | number) => `${API_URL}/history/${id}`,

  // Testimonials
  TESTIMONIALS: `${API_URL}/testimonials`,

  // Admin
  ADMIN_STATS: `${API_URL}/admin/stats`,
  ADMIN_USERS: `${API_URL}/admin/users`,
  ADMIN_USER_PASSWORD: (id: string | number) => `${API_URL}/admin/users/${id}/password`,
  ADMIN_USER_DELETE: (id: string | number) => `${API_URL}/admin/users/${id}`,
  ADMIN_UPLOADS: `${API_URL}/admin/uploads`,
  ADMIN_DOWNLOAD: (id: string | number) => `${API_URL}/admin/uploads/download/${id}`,
  ADMIN_DOWNLOAD_ALL: `${API_URL}/admin/uploads/download-all`,
  ADMIN_HEALTH: `${API_URL}/admin/health`,
  ADMIN_TESTIMONIALS: `${API_URL}/admin/testimonials`,
  ADMIN_TESTIMONIAL_DELETE: (id: string | number) => `${API_URL}/admin/testimonials/${id}`,
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
