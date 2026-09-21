import { apiClient } from '../../../services/api';

export const stage5Api = {
  getPreProductionListById: async (payload) => {
    const response = await apiClient.post('/db/getPreProductionListById', payload);
    return response.data;
  },
  deleteListDataByIds: async (payload) => {
    const response = await apiClient.post('/db/deleteListDataByIds', payload);
    return response.data;
  },
  getEpmDetail: async () => {
    const response = await apiClient.post('/db/getEpmDetail');
    return response.data;
  },
  getEpmDetailByEmpId: async (payload) => {
    const response = await apiClient.post('/db/getEpmDetailByEmpId', payload);
    return response.data;
  },
  getRawStg4MaterialListById: async (payload) => {
    const response = await apiClient.post('/db/getRawStg4MaterialListById', payload);
    return response.data;
  },
  addCustVDetail: async (payload) => {
    const response = await apiClient.post('/db/addCustVDetail', payload);
    return response.data;
  },
  updateProStage5: async (payload) => {
    const response = await apiClient.post('/db/updateProStage5', payload);
    return response.data;
  },
  addApprovalsForGate5: async (payload) => {
    const response = await apiClient.post('/db/addApprovalsForGate5', payload);
    return response.data;
  },
  Updatestage1Remark: async (payload) => {
    const response = await apiClient.post('/db/Updatestage1Remark', payload);
    return response.data;
  },
  uploadStage5PreProductionRowDetails: async (formData) => {
    const response = await apiClient.post('/uploadStage5PreProductionRowDetails', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  getCNIStageFileInTable: async (payload) => {
    const response = await apiClient.post('/db/getCNIStageFileInTable', payload);
    return response.data;
  },
  deleteStageFileInStage: async (payload) => {
    const response = await apiClient.post('/db/deleteStageFileInStage', payload);
    return response.data;
  }
};
