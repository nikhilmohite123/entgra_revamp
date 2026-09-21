import { apiClient } from '../../../services/api';

export const gateAApi = {
  getProById: async (payload) => {
    const response = await apiClient.post('/db/getProById', payload);
    return response.data;
  },
  getProS1AttchById: async (payload) => {
    const response = await apiClient.post('/db/getProS1AttchById', payload);
    return response.data;
  },
  getApprovelDetetailCNI_2_: async (payload) => {
    const response = await apiClient.post('/db/getApprovelDetetailCNI_2_', payload);
    return response.data;
  },
  getGateADetailById: async (payload) => {
    const response = await apiClient.post('/db/getGateADetailById', payload);
    return response.data;
  },
  updateProStagelevel: async (payload) => {
    const response = await apiClient.post('/db/updateProStagelevel', payload);
    return response.data;
  },
  addGateA: async (payload) => {
    const response = await apiClient.post('/db/addGateA', payload);
    return response.data;
  },
  updateTblProject: async (payload) => {
    const response = await apiClient.post('/db/updateTblProject', payload);
    return response.data;
  },
  deleteGateRec: async (payload) => {
    const response = await apiClient.post('/db/deleteGateRec', payload);
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
  getEpmDetail: async () => {
    const response = await apiClient.post('/db/getEpmDetail');
    return response.data;
  },
  getEpmDetailByEmpId: async (payload) => {
    const response = await apiClient.post('/db/getEpmDetailByEmpId', payload);
    return response.data;
  }
};
