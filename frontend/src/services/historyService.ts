import api, { API_ENDPOINTS } from '../api/api';
import { Citra } from '../types';

export interface Stats {
  totalDiagnoses: number;
  labelCounts: Record<string, number>;
  recentChecks: any[];
}

export const historyService = {
  getStats: async () => {
    const response = await api.get<Stats>(API_ENDPOINTS.HISTORY_STATS);
    return response.data;
  },

  getAllHistory: async () => {
    const response = await api.get<Citra[]>(API_ENDPOINTS.HISTORY);
    return response.data;
  },

  getHistoryById: async (id: string) => {
    const response = await api.get<Citra>(API_ENDPOINTS.HISTORY_BY_ID(id));
    return response.data;
  },
};
