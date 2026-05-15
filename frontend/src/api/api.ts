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
