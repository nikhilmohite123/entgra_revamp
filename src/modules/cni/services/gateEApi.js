import { apiClient } from '../../../services/api';

export const gateEApi = {
  getGate5ApprvalsDetails: async (payload) => {
    const response = await apiClient.post('/db/getGate5ApprvalsDetails', payload);
    return response.data;
  },
  getProTechnoDetailsById: async (payload) => {
    const response = await apiClient.post('/db/getProTechnoDetailsById', payload);
    return response.data;
  },
  getProS5AttchById: async (payload) => {
    const response = await apiClient.post('/db/getProS5AttchById', payload);
    return response.data;
  },
  updateProStagelevel: async (payload) => {
    const response = await apiClient.post('/db/updateProStagelevel', payload);
    return response.data;
  },
  addGateEDetail: async (payload) => {
    const response = await apiClient.post('/db/addGateEDetail', payload);
    return response.data;
  }
};
