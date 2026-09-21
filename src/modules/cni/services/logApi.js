import { apiClient } from '../../../services/api';

export const logApi = {
  getReguAccessName: async () => {
    const response = await apiClient.post('/db/get_reguAccessName', {});
    return response.data;
  },
  getReguDeptLoc: async () => {
    const response = await apiClient.post('/db/get_regu_Dept_Loc', {});
    return response.data;
  },
  genReport: async () => {
    const response = await apiClient.post('/db/genreport', {});
    return response.data;
  }
};
