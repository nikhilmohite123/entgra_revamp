import { apiClient } from '../../../services/api';

export const gateBApi = {
  getdetailsStage2: async (payload) => {
    const response = await apiClient.post('/db/getdetailsStage2', payload);
    return response.data;
  },

  getdetailsStage2_: async (payload) => {
    const response = await apiClient.post('/db/getdetailsStage2_', payload);
    return response.data;
  },

  getGateBDetailById: async (payload) => {
    const response = await apiClient.post('/db/getGateBDetailById', payload);
    return response.data;
  },

  updateProStagelevel: async (payload) => {
    const response = await apiClient.post('/db/updateProStagelevel', payload);
    return response.data;
  },

  addGateB: async (payload) => {
    const response = await apiClient.post('/db/addGateB', payload);
    return response.data;
  },

  scrapProject: async (payload) => {
    const response = await apiClient.post('/db/scrapProject', payload);
    return response.data;
  },

  shelveProject: async (payload) => {
    const response = await apiClient.post('/db/shelveProject', payload);
    return response.data;
  },

  returnProject: async (payload) => {
    const response = await apiClient.post('/db/returnProject', payload);
    return response.data;
  },

  updateTblProject: async (payload) => {
    const response = await apiClient.post('/db/updateTblProject', payload);
    return response.data;
  }
};
