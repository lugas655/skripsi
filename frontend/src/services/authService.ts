import api, { API_ENDPOINTS } from '../api/api';
import { AuthResponse, User } from '../types';

export const authService = {
  login: async (credentials: any) => {
    const response = await api.post<AuthResponse>(API_ENDPOINTS.LOGIN, credentials);
    return response.data;
  },

  register: async (userData: any) => {
    const response = await api.post(API_ENDPOINTS.REGISTER, userData);
    return response.data;
  },

  updateProfile: async (formData: FormData) => {
    const response = await api.put<{ message: string; user: User }>(API_ENDPOINTS.PROFILE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
