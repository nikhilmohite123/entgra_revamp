import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '../services/dashboardApi';
import { useCniPermissions } from './useCniPermissions';

export function useDashboardData(filters = null) {
  const queryClient = useQueryClient();
  const { user, dept, cniHead, custAdmin, isAdmin } = useCniPermissions(); // get role logic from permissions later if needed
  const role = localStorage.getItem('action_type') || '';
  const loc = localStorage.getItem('loc') || '';

  const basePayload = { dept, role, loc, user };

  // Fetch access permissions
  const { data: accessData, isLoading: isLoadingAccess } = useQuery({
    queryKey: ['dashboardAccess', basePayload],
    queryFn: async () => {
      const s_empname = localStorage.getItem('uid') || '';
      const response = await dashboardApi.getAccess({ ...basePayload, s_empname });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch dashboard records
  const { data: recordsData, isLoading: isLoadingRecords, isFetching: isFetchingRecords } = useQuery({
    queryKey: ['dashboardRecords', basePayload, filters],
    queryFn: async () => {
      if (filters) {
        const payload = { ...basePayload, ...filters };
        const response = await dashboardApi.getFiltered(payload);
        return response.data;
      } else {
        const response = await dashboardApi.getAll(basePayload);
        return response.data;
      }
    },
    staleTime: 0, // always fetch fresh on invalidate
  });

  // Upload Document Mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await dashboardApi.uploadDocument(formData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate query to trigger fresh /db/getAllRecord or filtered
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
    }
  });

  // getVerify Mutation (fire-and-forget tracking)
  const verifyMutation = useMutation({
    mutationFn: async () => {
      await dashboardApi.getVerify(basePayload);
    }
  });

  // Remove File Mutation
  const removeFileMutation = useMutation({
    mutationFn: async (id) => {
      const payload = { ...basePayload, n_reg_attch_id: id };
      const response = await dashboardApi.removeFile(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
    }
  });

  // Edit File Mutation (fetches single record for editing)
  const editFileMutation = useMutation({
    mutationFn: async (id) => {
      const payload = { ...basePayload, n_reg_attch_id: id };
      const response = await dashboardApi.editFile(payload);
      return response.data[0]; // legacy returns array [0]
    }
  });

  // Tracking clicks
  const tdsClickMutation = useMutation({
    mutationFn: async () => {
      await dashboardApi.getTdsClick(basePayload);
    }
  });

  const ghsSdsClickMutation = useMutation({
    mutationFn: async () => {
      await dashboardApi.getGhsSdsClick(basePayload);
    }
  });

  return {
    accessData,
    isLoadingAccess,
    recordsData: recordsData || [],
    isLoadingRecords,
    isFetchingRecords,
    uploadDocumentMutation,
    verifyMutation,
    removeFileMutation,
    editFileMutation,
    tdsClickMutation,
    ghsSdsClickMutation,
  };
}
