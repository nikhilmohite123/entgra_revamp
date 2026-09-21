import { apiClient } from '../../../services/api';

export const stage2Api = {
  getProS2AttchById: async (payload) => {
    const response = await apiClient.post('/db/getProS2AttchById', payload);
    return response.data;
  },

  getCNIStageFileInTable: async (payload) => {
    const response = await apiClient.post('/db/getCNIStageFileInTable', payload);
    return response.data;
  },

  deleteStageFileInStage: async (payload) => {
    const response = await apiClient.post('/db/deleteStageFileInStage', payload);
    return response.data;
  },

  updateProStage2: async (payload) => {
    const response = await apiClient.post('/db/updateProStage2', payload);
    return response.data;
  },

  addProjectDetail: async (payload) => {
    const response = await apiClient.post('/db/addProjectDetail', payload);
    return response.data;
  },

  addBusiRow: async (payload) => {
    const response = await apiClient.post('/db/addBusiRow', payload);
    return response.data;
  }
};
