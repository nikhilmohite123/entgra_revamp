import { apiClient } from '../../../services/api';

export const stageApi = {
  getAttachments: (data) => apiClient.post('/db/getProS1AttchById', data),
  getApprovalDetails: (data) => apiClient.post('/db/getApprovelDetetail', data),
  updateRemark: (data) => apiClient.post('/db/Updatestage1Remark', data),
  goAhead: (data) => apiClient.post('/db/goAheadByCNIHead', data),
  
  updateStage2: (data) => apiClient.post('/db/updateProStage2', data),
  addProjectDetail: (data) => apiClient.post('/db/addProjectDetail', data),
  
  updateStage3: (data) => apiClient.post('/db/updateProStage3', data),
  getRawMaterialList: (data) => apiClient.post('/db/getRawMaterialListById', data),
  
  updateStage4: (data) => apiClient.post('/db/updateProStage4', data),
  addCustVDetail: (data) => apiClient.post('/db/addCustVDetail', data),
  
  updateStage5: (data) => apiClient.post('/db/updateProStage5', data),
  getGateApprovals: (data) => apiClient.post('/db/getGate5ApprvalsDetails', data),
  
  getStageFiles: (data) => apiClient.post('/db/getCNIStageFileInTable', data),
  deleteStageFile: (data) => apiClient.post('/db/deleteStageFileInStage', data),
};
