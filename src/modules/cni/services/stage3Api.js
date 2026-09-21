import { apiClient } from '../../../services/api';

export const stage3Api = {
  getRawMaterialListById: async (payload) => {
    const response = await apiClient.post('/db/getRawMaterialListById', payload);
    return response.data;
  },
  getCandILabListById: async (payload) => {
    const response = await apiClient.post('/db/getCandILabListById', payload);
    return response.data;
  },
  deleteRawMaterialListById: async (payload) => {
    const response = await apiClient.post('/db/deleteRawMaterialListById', payload);
    return response.data;
  },
  deleteC_n_i_labListById: async (payload) => {
    const response = await apiClient.post('/db/deleteC_n_i_labListById', payload);
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
  updateProStage3: async (payload) => {
    const response = await apiClient.post('/db/updateProStage3', payload);
    return response.data;
  },
  uploadStage3RowDetails: async (formData) => {
    const response = await apiClient.post('/uploadStage3RowDetails', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  uploadStage3_CandI_lab_Details: async (formData) => {
    const response = await apiClient.post('/uploadStage3_CandI_lab_Details', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
