import { apiClient } from '../../../services/api';

export const auditTrailApi = {
  getAuditLogByProjectId: async ({ projectId, uid, cniHead }) => {
    const response = await apiClient.post('/db/AuditTrailByID', { 
      id: projectId,
      uid: uid,
      cniHead: cniHead
    });
    return response.data;
  }
};
