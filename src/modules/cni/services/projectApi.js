import { apiClient } from '../../../services/api';

export const projectApi = {
  create: (data) => apiClient.post('/db/createNewProject', data),
  getById: (data) => apiClient.post('/db/getProById', data),
  getTempFiles: (data) => apiClient.post('/db/getTempFileInStage1', data),
  deleteTempFile: (data) => apiClient.post('/db/deleteTempFileInStage1', data),
  uploadTempFile: (formData) => apiClient.post('/uploadStages_in_temp1', formData),
  uploadTempFileGeneric: (formData) => apiClient.post('/uploadStages_in_temp', formData),
  scrap: (data) => apiClient.post('/db/scrapProject', data),
  shelve: (data) => apiClient.post('/db/shelveProject', data),
  returnProject: (data) => apiClient.post('/db/returnProject', data),
  getCfiProject: (data) => apiClient.post('/db/cfiProjectById', data),
  getApprovedCfi: (data) => apiClient.post('/db/ApprovedCFIProjectById', data),
  getLocation: () => apiClient.post('/global/getlocation'),
  
  // Stage Gate Dashboard Endpoints
  getAllStageData: (data) => apiClient.post('/db/readAllstageData', data),
  getAllStageDataById: (data) => apiClient.post('/db/readAllstageDataBYID', data),
  getPendingApprovalData: (data) => apiClient.post('/db/pendngApprovlDataset', data),
  getPendingCniApprovalData: (data) => apiClient.post('/db/pendngCNIAPprovalData', data),
  getAllStageDataCfi: (data) => apiClient.post('/db/readAllstageData_cfi', data),
  getAllStageDataCfiApproved: (data) => apiClient.post('/db/readAllstageData_cfi_approved', data),
  getReportDataList: (data) => apiClient.post('/db/reportData_list', data),
  getAllCniProjects: (data) => apiClient.post('/db/getcniall_project', data),
  
  // Modals
  getPcifCifAttachment: (data) => apiClient.post('/db/getcniattachmentpcif_cif', data),
  getLatestDoe: (data) => apiClient.post('/db/getlatest_doe', data),
};
