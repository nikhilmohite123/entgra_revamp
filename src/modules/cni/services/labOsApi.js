import { apiClient } from '../../../services/api';

/**
 * LabOS Legacy API Service
 * Maps exactly to existing /cni_lp_api/* endpoints.
 */

export const labOsApi = {
  getMatHeadersRec: async (cat, uid) => {
    const data = {
      s_categories: cat,
      s_created_by: uid
    };
    const response = await apiClient.post('/cni_lp_api/get_mat_headers_rec', data);
    return response.data;
  },

  getMatReportRec: async (cat, uid) => {
    const data = {
      s_categories: cat,
      s_created_by: uid
    };
    const response = await apiClient.post('/cni_lp_api/get_mat_report_rec', data);
    return response.data;
  },

  getMatRecAsPerApproval: async (cat, uid) => {
    const data = {
      ctr: cat, // Legacy uses ctr for this
      s_created_by: uid
    };
    const response = await apiClient.post('/cni_lp_api/get_mat_rec_as_per_approval', data);
    return response.data;
  },

  getPendingActivity: async (uid) => {
    const data = {
      s_created_by: uid
    };
    const response = await apiClient.post('/cni_lp_api/get_pending_activity', data);
    return response.data;
  },

  getMatHeaderChildRec: async (matId, uid) => {
    const data = {
      n_mat_id: matId,
      s_created_by: uid
    };
    const response = await apiClient.post('/cni_lp_api/get_mat_header_child_rec', data);
    return response.data;
  },
  
  globalSearch: async (searchTerm) => {
    const data = { search_term: searchTerm };
    const response = await apiClient.post('/cni_lp_api/global_search', data);
    return response.data;
  },

  // --- NEW TEST WORKFLOW ENDPOINTS ---

  getCniLpEmpAuth: async () => {
    const response = await apiClient.post('/cni_lp_api/cni_lp_emp_auth');
    return response.data;
  },

  saveMatHeader: async (data) => {
    const response = await apiClient.post('/cni_lp_api/save_mat_header', data);
    return response.data;
  },

  getMatHeader: async (matcode, category) => {
    const data = {
      s_mat_code: matcode,
      s_categories: category
    };
    const response = await apiClient.post('/cni_lp_api/get_mat_header', data);
    return response.data;
  },

  updateSampleDesc: async (data) => {
    const response = await apiClient.post('/cni_lp_api/update_sample_desc', data);
    return response.data;
  },

  getMatChildData: async (matcode, category) => {
    const data = {
      s_mat_code: matcode,
      s_categories: category
    };
    const response = await apiClient.post('/cni_lp_api/get_mat_child_data', data);
    return response.data;
  },

  getMatChildById: async (id) => {
    const data = { id };
    const response = await apiClient.post('/cni_lp_api/get_mat_childbyid', data);
    return response.data;
  },

  saveMatChild: async (data) => {
    const response = await apiClient.post('/cni_lp_api/save_mat_child', data);
    return response.data;
  },

  updateMatChild: async (data) => {
    const response = await apiClient.post('/cni_lp_api/update_mat_child', data);
    return response.data;
  },

  deleteMatChild: async (id) => {
    const data = { id };
    const response = await apiClient.post('/cni_lp_api/delete_mat_child', data);
    return response.data;
  },

  getReportByPlId: async (matId, lpIdArray) => {
    const data = {
      n_mat_id: matId,
      n_lp_id: lpIdArray
    };
    const response = await apiClient.post('/cni_lp_api/get_report_by_pl_id', data);
    return response.data;
  },

  // --- SUMMARY WORKFLOW ---
  getSummryReport: async (categoryId) => {
    const response = await apiClient.post('/cni_lp_api/get_summry_report', { s_categories: categoryId });
    return response.data;
  },

  // --- ANALYTICS WORKFLOW ---
  
  // Form dependencies
  getMatReportRecAll: async () => {
    const response = await apiClient.post('/cni_lp_api/get_mat_report_rec_all');
    return response.data;
  },
  
  getSubTest: async (mainTestIds) => {
    // mainTestIds could be a string or array depending on mode.
    const response = await apiClient.post('/cni_lp_api/getsubtest', { stype: mainTestIds });
    return response.data;
  },

  // Laminate Property Mode (Multi-Select Main Test + Material required)
  getMultipleAvgReport: async (payload) => {
    const response = await apiClient.post('/cni_lp_api/get_multiple_avg_report', payload);
    return response.data;
  },

  getMultipleMmReport: async (payload) => {
    const response = await apiClient.post('/cni_lp_api/get_multiple_mm_report', payload);
    return response.data;
  },

  getMultipleReportByProperty: async (payload) => {
    const response = await apiClient.post('/cni_lp_api/get_Multiplereport_by_Property', payload);
    return response.data;
  },

  // Property Vs Material Codes Mode (Single-Select Main Test + No Material)
  getAvgReportByProperty: async (payload) => {
    const response = await apiClient.post('/cni_lp_api/get_avg_report_by_Property', payload);
    return response.data;
  },

  getMinMaxReport: async (payload) => {
    const response = await apiClient.post('/cni_lp_api/get_min_max_report', payload);
    return response.data;
  },

  getReportByProperty: async (payload) => {
    const response = await apiClient.post('/cni_lp_api/get_report_by_Property', payload);
    return response.data;
  }
};
