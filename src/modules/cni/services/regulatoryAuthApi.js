import { apiClient } from '../../../services/api';

export const regulatoryAuthApi = {
  getReportPerson: async () => {
    const response = await apiClient.post('/global/getReportPerson', {});
    return response.data;
  },
  getAthorizeAccessData: async () => {
    const response = await apiClient.post('/db/getAthorizeAccessData', {});
    return response.data;
  },
  getUsersData: async (payload) => {
    const response = await apiClient.post('/db/getUsersData', payload);
    return response.data;
  },
  regulatoryAuthorizeUsers: async (payload) => {
    const response = await apiClient.post('/db/regulatoryAuthorizeUsers', payload);
    return response.data;
  }
};
