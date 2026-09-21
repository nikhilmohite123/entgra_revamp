import { apiClient } from '../../../services/api';

export const gateApi = {
  getGateA: (data) => apiClient.post('/db/getGateADetailById', data),
  submitGateA: (data) => apiClient.post('/db/addGateA', data),
  
  getGateB: (data) => apiClient.post('/db/getGateBDetailById', data),
  submitGateB: (data) => apiClient.post('/db/addGateB', data),
  
  getGateC: (data) => apiClient.post('/db/getGateCDetailById', data),
  submitGateC: (data) => apiClient.post('/db/addGateC', data),
  
  getGateD: (data) => apiClient.post('/db/getGateDDetailById', data),
  submitGateD: (data) => apiClient.post('/db/addGateD', data),
  
  submitGateE: (data) => apiClient.post('/db/addGateEDetail', data),
  
  updateLevel: (data) => apiClient.post('/db/updateProStagelevel', data),
  deleteRecord: (data) => apiClient.post('/db/deleteGateRec', data),
};
