import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { gateEApi } from '../services/gateEApi';
import { projectApi } from '../services/projectApi';

export function useGateE(projectId) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const uid = localStorage.getItem('loginId') || '';

  const { data: rawItem, isLoading: isLoadingItem } = useQuery({
    queryKey: ['gateEProject', projectId, uid],
    queryFn: async () => {
      const data = await projectApi.getById({ id: projectId, uid });
      return data[0] || null;
    },
    enabled: !!projectId && !!uid,
  });

  const { data: materials = [], isLoading: isLoadingMaterials } = useQuery({
    queryKey: ['gateETechnoDetails', projectId, uid],
    queryFn: () => gateEApi.getProTechnoDetailsById({ id: projectId, uid }),
    enabled: !!projectId && !!uid,
  });

  const { data: attch = [], isLoading: isLoadingAttch } = useQuery({
    queryKey: ['gateEAttch', projectId, uid],
    queryFn: () => gateEApi.getProS5AttchById({ id: projectId, uid }),
    enabled: !!projectId && !!uid,
  });

  const { data: approvals = [], isLoading: isLoadingApprovals } = useQuery({
    queryKey: ['gateEApprovals', projectId, uid],
    queryFn: () => gateEApi.getGate5ApprvalsDetails({ id: projectId, uid }),
    enabled: !!projectId && !!uid,
  });

  const addGateMutation = useMutation({
    mutationFn: async (currentItem) => {
      await gateEApi.updateProStagelevel({ id: projectId, s_level: '6', item: currentItem, uid });
      await gateEApi.addGateEDetail({ id: projectId, item: currentItem, s_level: '6', uid, type: 'CIF' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
      navigate('/cni/dashboard');
    }
  });

  return {
    rawItem,
    materials,
    attch,
    approvals,
    isLoading: isLoadingItem || isLoadingMaterials || isLoadingAttch || isLoadingApprovals,
    addGate: addGateMutation.mutateAsync,
    isAddingGate: addGateMutation.isPending
  };
}
