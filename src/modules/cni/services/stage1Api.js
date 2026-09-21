import { apiClient } from '../../../services/api';

export const stage1Api = {
  getProById: async (payload) => {
    const response = await apiClient.post('/db/getProById', payload);
    return response.data;
  },
  getProS1AttchById: async (payload) => {
    const response = await apiClient.post('/db/getProS1AttchById', payload);
    return response.data;
  },
  getApprovelDetetail: async (payload) => {
    const response = await apiClient.post('/db/getApprovelDetetail', payload);
    return response.data;
  },
  Updatestage1Remark: async (payload) => {
    const response = await apiClient.post('/db/Updatestage1Remark', payload);
    return response.data;
  },
  goAheadByCNIHead: async (payload) => {
    const response = await apiClient.post('/db/goAheadByCNIHead', payload);
    return response.data;
  },
  AddApprovalMAil: async (payload) => {
    const response = await apiClient.post('/db/AddApprovalMAil', payload);
    return response.data;
  },
  scrapProject: async (payload) => {
    const response = await apiClient.post('/db/scrapProject', payload);
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
