import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gateEApi } from '../services/gateEApi';
import { projectApi } from '../services/projectApi';
import { useCniPermissions } from './useCniPermissions';

export function useProvisionalCif(projectId) {
  const { user } = useCniPermissions();
  const queryClient = useQueryClient();

  const { data: projectData, isLoading: isLoadingProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectApi.getProjectById({ id: projectId, uid: user }),
    enabled: !!projectId && !!user,
  });

  const { data: technoDetails, isLoading: isLoadingTechno } = useQuery({
    queryKey: ['proTechnoDetails', projectId],
    queryFn: () => gateEApi.getProTechnoDetailsById({ id: projectId, uid: user }),
    enabled: !!projectId && !!user,
  });

  const { data: approvals, isLoading: isLoadingApprovals } = useQuery({
    queryKey: ['gate5Approvals', projectId],
    queryFn: () => gateEApi.getGate5ApprvalsDetails({ id: projectId, uid: user }),
    enabled: !!projectId && !!user,
  });

  const item = projectData?.[0] || {};

  const mutation = useMutation({
    mutationFn: async (formData) => {
      // Merge form data with item
      const mergedItem = { ...item, ...formData };
      
      // Concurrent mutations exactly per Provisional CIF legacy contract
      const req1 = gateEApi.updateProStagelevel({
        id: projectId,
        s_level: '5',
        item: mergedItem,
        uid: user
      });

      const req2 = gateEApi.addGateEDetail({
        id: projectId,
        s_level: '5',
        type: 'PCIF',
        item: mergedItem,
        uid: user
      });

      return Promise.all([req1, req2]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    }
  });

  return {
    item,
    technoDetails: technoDetails || [],
    approvals: approvals || [],
    isLoading: isLoadingProject || isLoadingTechno || isLoadingApprovals,
    submitProvisionalCif: mutation.mutateAsync,
    isSubmitting: mutation.isPending
  };
}
