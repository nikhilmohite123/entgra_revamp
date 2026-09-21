import { apiClient } from '../../../services/api';

export const stage4Api = {
  getCNIStageFileInTable: async (payload) => {
    const response = await apiClient.post('/db/getCNIStageFileInTable', payload);
    return response.data;
  },
  deleteStageFileInStage: async (payload) => {
    const response = await apiClient.post('/db/deleteStageFileInStage', payload);
    return response.data;
  },
  updateProStage4: async (payload) => {
    const response = await apiClient.post('/db/updateProStage4', payload);
    return response.data;
  }
};
