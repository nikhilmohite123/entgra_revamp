import { apiClient } from '../../../services/api';

export const gateDApi = {
  getGateDDetailById: async (payload) => {
    const response = await apiClient.post('/db/getGateDDetailById', payload);
    return response.data;
  },
  getProS4AttchById: async (payload) => {
    const response = await apiClient.post('/db/getProS4AttchById', payload);
    return response.data;
  },
  addGateD: async (payload) => {
    const response = await apiClient.post('/db/addGateD', payload);
    return response.data;
  },
  updateProStagelevel: async (payload) => {
    const response = await apiClient.post('/db/updateProStagelevel', payload);
    return response.data;
  },
  updateTblProject: async (payload) => {
    const response = await apiClient.post('/db/updateTblProject', payload);
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
  }
};
