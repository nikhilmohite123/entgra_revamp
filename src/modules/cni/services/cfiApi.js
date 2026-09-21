import { apiClient } from '../../../services/api';

export const cfiApi = {
  cfiProjectById: async (payload) => {
    const response = await apiClient.post('/db/cfiProjectById', payload);
    return response.data;
  },
  approvedCFIProjectById: async (payload) => {
    const response = await apiClient.post('/db/ApprovedCFIProjectById', payload);
    return response.data;
  }
};
