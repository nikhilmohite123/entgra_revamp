import { apiClient } from '../../../services/api';

export const reportApi = {
  getProjectNames: () => apiClient.post('/db/get_project_name'),
};
