import { apiClient } from '../../../services/api';

export const dashboardApi = {
  getAll: (payload) => apiClient.post('/db/getAllRecord', payload),
  getFiltered: (filters) => apiClient.post('/db/getFilterAllRecord', filters),
  getVerify: (payload) => apiClient.post('/db/getverify', payload),
  removeFile: (data) => apiClient.post('/db/removefile', data),
  editFile: (data) => apiClient.post('/db/editfile', data),
  getAccess: (payload) => apiClient.post('/db/regulatoryAccess', payload),
  uploadDocument: (formData) => apiClient.post('/uploadRegltryDocmnt', formData, {
    headers: {
      'Content-Type': undefined
    }
  }),
  getTdsClick: (payload) => apiClient.post('/db/clickOn_tds', payload),
  getGhsSdsClick: (payload) => apiClient.post('/db/clickOn_GhsSds', payload),
};
