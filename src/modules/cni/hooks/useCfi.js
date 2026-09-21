import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cfiApi } from '../services/cfiApi';
import { useCniPermissions } from './useCniPermissions';

export function useCfi(projectId) {
  const { user } = useCniPermissions();
  const queryClient = useQueryClient();

  const { data: cfiData, isLoading } = useQuery({
    queryKey: ['cfiProject', projectId],
    queryFn: () => cfiApi.cfiProjectById({ id: projectId, uid: user, type: "CIF" }),
    enabled: !!projectId && !!user,
  });

  const item = cfiData?.[0] || {};

  const mutation = useMutation({
    mutationFn: async () => {
      // Final CFI only calls this mutation, and does NOT call updateProStagelevel
      return await cfiApi.approvedCFIProjectById({
        id: projectId,
        uid: user,
        item
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
      queryClient.invalidateQueries({ queryKey: ['cfiProject', projectId] });
    }
  });

  return {
    item,
    isLoading,
    approveCfi: mutation.mutateAsync,
    isSubmitting: mutation.isPending
  };
}
