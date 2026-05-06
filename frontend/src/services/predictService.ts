import api, { API_ENDPOINTS } from '../api/api';
import { PredictResponse } from '../types';

export const predictService = {
  predict: async (formData: FormData) => {
    const response = await api.post<PredictResponse>(API_ENDPOINTS.PREDICT, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
