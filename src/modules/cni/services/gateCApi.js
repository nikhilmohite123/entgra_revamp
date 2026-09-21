import { apiClient } from '../../../services/api';

export const gateCApi = {
  getGateCDetailById: async (payload) => {
    const response = await apiClient.post('/db/getGateCDetailById', payload);
    return response.data;
  },
  addGateC: async (payload) => {
    const response = await apiClient.post('/db/addGateC', payload);
    return response.data;
  },
  updateProStagelevel: async (payload) => {
    const response = await apiClient.post('/db/updateProStagelevel', payload);
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
  },
  getRawMaterialListById: async (payload) => {
    const response = await apiClient.post('/db/getRawMaterialListById', payload);
    return response.data;
  },
  getCandILabListById: async (payload) => {
    const response = await apiClient.post('/db/getCandILabListById', payload);
    return response.data;
  },
};
