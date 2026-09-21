import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labOsApi } from '../services/labOsApi';

/**
 * Custom hooks for LabOS utilizing TanStack Query
 */

export const useLabOS = (category = 1) => {
  const uid = localStorage.getItem('loginId') || localStorage.getItem('uid') || '';

  const matHeadersQuery = useQuery({
    queryKey: ['labos', 'matHeaders', category, uid],
    queryFn: () => labOsApi.getMatHeadersRec(category, uid),
  });

  const pendingApprovalQuery = useQuery({
    queryKey: ['labos', 'pendingApproval', category, uid],
    queryFn: () => labOsApi.getMatRecAsPerApproval(category, uid),
  });

  const matReportQuery = useQuery({
    queryKey: ['labos', 'matReport', category, uid],
    queryFn: () => labOsApi.getMatReportRec(category, uid),
  });

  const pendingActivityQuery = useQuery({
    queryKey: ['labos', 'pendingActivity', uid],
    queryFn: () => labOsApi.getPendingActivity(uid),
  });

  return {
    matHeadersQuery,
    pendingApprovalQuery,
    matReportQuery,
    pendingActivityQuery,
    uid
  };
};

export const useLabOSGlobalSearch = (searchTerm) => {
  return useQuery({
    queryKey: ['labos', 'global-search', searchTerm],
    queryFn: () => labOsApi.globalSearch(searchTerm),
    enabled: !!searchTerm,
  });
};

export const useLabOSChild = (matId) => {
  const uid = localStorage.getItem('loginId') || localStorage.getItem('uid') || '';

  return useQuery({
    queryKey: ['labos', 'childDetails', matId, uid],
    queryFn: () => labOsApi.getMatHeaderChildRec(matId, uid),
    enabled: !!matId,
  });
};

// --- NEW TEST WORKFLOW HOOKS ---

export const useLabOSApprovers = () => {
  return useQuery({
    queryKey: ['labos', 'approvers'],
    queryFn: () => labOsApi.getCniLpEmpAuth(),
  });
};

export const useLabOSForm = (matcode, category, lpIds) => {
  const headerQuery = useQuery({
    queryKey: ['labos', 'header', matcode, category],
    queryFn: () => labOsApi.getMatHeader(matcode, category),
    enabled: !!matcode && !!category,
  });

  const childrenQuery = useQuery({
    queryKey: ['labos', 'children', matcode, category],
    queryFn: () => labOsApi.getMatChildData(matcode, category),
    enabled: !!matcode && !!category,
  });

  const reportQuery = useQuery({
    queryKey: ['labos', 'report', headerQuery.data?.data?.n_mat_id, lpIds],
    queryFn: () => labOsApi.getReportByPlId(headerQuery.data?.data?.n_mat_id, lpIds),
    enabled: !!headerQuery.data?.data?.n_mat_id && Array.isArray(lpIds) && lpIds.length > 0,
  });

  return { headerQuery, childrenQuery, reportQuery };
};

export const useLabOSMutations = () => {
  const queryClient = useQueryClient();

  const saveMatHeaderMutation = useMutation({
    mutationFn: (data) => labOsApi.saveMatHeader(data),
  });

  const updateSampleDescMutation = useMutation({
    mutationFn: (data) => labOsApi.updateSampleDesc(data),
  });

  const saveMatChildMutation = useMutation({
    mutationFn: (data) => labOsApi.saveMatChild(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labos', 'children'] });
      queryClient.invalidateQueries({ queryKey: ['labos', 'report'] });
    },
  });

  const updateMatChildMutation = useMutation({
    mutationFn: (data) => labOsApi.updateMatChild(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labos', 'children'] });
      queryClient.invalidateQueries({ queryKey: ['labos', 'report'] });
    },
  });

  const deleteMatChildMutation = useMutation({
    mutationFn: (id) => labOsApi.deleteMatChild(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labos', 'children'] });
      queryClient.invalidateQueries({ queryKey: ['labos', 'report'] });
    },
  });

  return {
    saveMatHeaderMutation,
    updateSampleDescMutation,
    saveMatChildMutation,
    updateMatChildMutation,
    deleteMatChildMutation,
  };
};

// --- SUMMARY WORKFLOW HOOKS ---

export const useLabOSSummary = (categoryId) => {
  return useQuery({
    queryKey: ['labos', 'summary', categoryId],
    queryFn: () => labOsApi.getSummryReport(categoryId),
    enabled: !!categoryId,
  });
};

// --- ANALYTICS WORKFLOW HOOKS ---

export const useLabOSAnalyticsMaterials = () => {
  return useQuery({
    queryKey: ['labos', 'analytics', 'materials'],
    queryFn: () => labOsApi.getMatReportRecAll(),
  });
};

export const useLabOSAnalyticsSubTests = (mainTestIds) => {
  return useQuery({
    queryKey: ['labos', 'analytics', 'subtests', mainTestIds],
    queryFn: () => labOsApi.getSubTest(mainTestIds),
    enabled: !!mainTestIds && (Array.isArray(mainTestIds) ? mainTestIds.length > 0 : mainTestIds !== ''),
  });
};

export const useLabOSAnalyticsReport = () => {
  return useMutation({
    mutationFn: async ({ mode, aggregation, payload }) => {
      if (mode === 'LAMINATE_PROPERTY') {
        if (aggregation === 'AVG') return labOsApi.getMultipleAvgReport(payload);
        if (aggregation === 'MIN_MAX') return labOsApi.getMultipleMmReport(payload);
        return labOsApi.getMultipleReportByProperty(payload); // NONE
      } else {
        // PROPERTY_VS_MATERIAL
        if (aggregation === 'AVG') return labOsApi.getAvgReportByProperty(payload);
        if (aggregation === 'MIN_MAX') return labOsApi.getMinMaxReport(payload);
        return labOsApi.getReportByProperty(payload); // NONE
      }
    }
  });
};
