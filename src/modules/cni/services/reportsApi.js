import { apiClient } from '../../../services/api';

export const reportsApi = {
  getCniReportDetail: async () => {
    const response = await apiClient.post('/db/getCniReportDetail', {});
    return response.data;
  }
};
