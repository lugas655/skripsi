import api, { API_ENDPOINTS } from '../api/api';
import { Citra } from '../types';

export interface Stats {
  totalDiagnoses: number;
  labelCounts: Record<string, number>;
  recentChecks: any[];
}

export interface PaginatedCitra {
  page: number;
  limit: number;
  data: Citra[];
}

export const historyService = {
  getStats: async () => {
    const response = await api.get<Stats>(API_ENDPOINTS.HISTORY_STATS);
    return response.data;
  },

  getAllHistory: async () => {
    const response = await api.get<PaginatedCitra>(API_ENDPOINTS.HISTORY);
    return response.data;
  },

  getHistoryById: async (id: string) => {
    const response = await api.get<Citra>(API_ENDPOINTS.HISTORY_BY_ID(id));
    return response.data;
  },

  deleteHistory: async (id: number) => {
    const response = await api.delete(API_ENDPOINTS.HISTORY_BY_ID(id.toString()));
    return response.data;
  },
};
