import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { gateCApi } from '../services/gateCApi';
import { projectApi } from '../services/projectApi';

export function useGateC(projectId) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const uid = localStorage.getItem('loginId') || '';

  const {
    data: item,
    isLoading: isLoadingItem,
    isError: isErrorItem,
  } = useQuery({
    queryKey: ['gateCProject', projectId, uid],
    queryFn: async () => {
      const data = await projectApi.getById({ id: projectId, uid });
      return data[0] || null;
    },
    enabled: !!projectId && !!uid,
  });

  const {
    data: gatecData,
    isLoading: isLoadingGatec,
  } = useQuery({
    queryKey: ['gateCDetail', projectId, uid],
    queryFn: async () => {
      const data = await gateCApi.getGateCDetailById({ id: projectId, uid });
      return data[0] || null;
    },
    enabled: !!projectId && !!uid,
  });

  const {
    data: materials = [],
    isLoading: isLoadingMaterials,
  } = useQuery({
    queryKey: ['gateCMaterials', projectId, uid],
    queryFn: () => gateCApi.getRawMaterialListById({ id: projectId }),
    enabled: !!projectId,
  });

  // Note: Only fetching getCandILabListById because getRawProductListById is overwritten in legacy GateCCtrl.js
  const {
    data: products = [],
    isLoading: isLoadingProducts,
  } = useQuery({
    queryKey: ['gateCProducts', projectId, uid],
    queryFn: () => gateCApi.getCandILabListById({ id: projectId }),
    enabled: !!projectId,
  });

  const addGateMutation = useMutation({
    mutationFn: async ({ currentItem, s_level }) => {
      // 1. Pass to Stage 4 (updateProStagelevel with s_level)
      await gateCApi.updateProStagelevel({ id: projectId, s_level, uid, item: currentItem });
      // 2. Add Gate C
      await gateCApi.addGateC({ id: projectId, gBData: currentItem, uid, s_level });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
      navigate('/cni/dashboard');
    }
  });

  const scrapMutation = useMutation({
    mutationFn: (payload) => gateCApi.scrapProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
      navigate('/cni/dashboard');
    }
  });

  const shelveMutation = useMutation({
    mutationFn: (payload) => gateCApi.shelveProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
      navigate('/cni/dashboard');
    }
  });

  const returnMutation = useMutation({
    mutationFn: (payload) => gateCApi.returnProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
      navigate('/cni/dashboard');
    }
  });

  const updateRecordMutation = useMutation({
    mutationFn: async ({ currentItem }) => {
      // 1. addGateC with s_level undefined
      await gateCApi.addGateC({ id: projectId, gBData: currentItem, uid, s_level: undefined });
      // 2. updateTblProject_ with s_level "3G"
      await gateCApi.updateTblProject({ id: projectId, uid, item: currentItem, s_level: "3G" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
      navigate('/cni/dashboard');
    }
  });

  return {
    item,
    gatecData,
    materials,
    products,
    isLoading: isLoadingItem || isLoadingGatec || isLoadingMaterials || isLoadingProducts,
    isError: isErrorItem,
    addGate: addGateMutation.mutateAsync,
    isAddingGate: addGateMutation.isPending,
    scrapProject: scrapMutation.mutateAsync,
    isScrapping: scrapMutation.isPending,
    shelveProject: shelveMutation.mutateAsync,
    isShelving: shelveMutation.isPending,
    returnProject: returnMutation.mutateAsync,
    isReturning: returnMutation.isPending,
    updateRecord: updateRecordMutation.mutateAsync,
    isUpdatingRecord: updateRecordMutation.isPending,
  };
}
