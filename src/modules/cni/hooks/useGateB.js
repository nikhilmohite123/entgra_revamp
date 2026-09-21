import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { gateBApi } from '../services/gateBApi';
import { projectApi } from '../services/projectApi';
import { stage2Api } from '../services/stage2Api';

export function useGateB(projectId) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const uid = localStorage.getItem('loginId') || '';

  const {
    data: item,
    isLoading: isLoadingItem,
    isError: isErrorItem,
  } = useQuery({
    queryKey: ['gateBProject', projectId, uid],
    queryFn: async () => {
      const data = await projectApi.getById({ id: projectId, uid });
      return data[0];
    },
    enabled: !!projectId && !!uid,
  });

  const {
    data: attachments = [],
  } = useQuery({
    queryKey: ['gateBAttach', projectId, uid],
    queryFn: () => stage2Api.getProS2AttchById({ id: projectId, uid }),
    enabled: !!projectId && !!uid,
  });

  const {
    data: materials = [],
  } = useQuery({
    queryKey: ['gateBMaterials', projectId, uid],
    queryFn: () => gateBApi.getdetailsStage2({ id: projectId, uid }),
    enabled: !!projectId && !!uid,
  });

  const {
    data: products = [],
  } = useQuery({
    queryKey: ['gateBProducts', projectId, uid],
    queryFn: () => gateBApi.getdetailsStage2_({ id: projectId, uid }),
    enabled: !!projectId && !!uid,
  });

  const {
    data: locations = [],
  } = useQuery({
    queryKey: ['locations'],
    queryFn: () => projectApi.getLocation(),
  });

  const {
    data: gatebData,
  } = useQuery({
    queryKey: ['gateBDetail', projectId, uid],
    queryFn: async () => {
      const data = await gateBApi.getGateBDetailById({ id: projectId, uid });
      return data[0] || null;
    },
    enabled: !!projectId && !!uid,
  });

  const addGateMutation = useMutation({
    mutationFn: async ({ currentItem }) => {
      // 1. Pass to Stage 3 (updateProStagelevel with s_level: 3)
      await gateBApi.updateProStagelevel({ id: projectId, s_level: 3, uid, item: currentItem });
      // 2. Add Gate B
      await gateBApi.addGateB({ id: projectId, gBData: currentItem, username: uid });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
      navigate('/cni/dashboard');
    }
  });

  const scrapMutation = useMutation({
    mutationFn: (payload) => gateBApi.scrapProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
      navigate('/cni/dashboard');
    }
  });

  const shelveMutation = useMutation({
    mutationFn: (payload) => gateBApi.shelveProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
      navigate('/cni/dashboard');
    }
  });

  const returnMutation = useMutation({
    mutationFn: (payload) => gateBApi.returnProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
      navigate('/cni/dashboard');
    }
  });

  const updateRecordMutation = useMutation({
    mutationFn: async ({ currentItem }) => {
      // In GateBCtrl.js: updateTblProject_(item, gateb, level="2G")
      // gateb is undefined from HTML.
      await gateBApi.updateTblProject({ 
        id: projectId, 
        uid, 
        item: currentItem, 
        gateb: undefined, 
        s_level: "2G" 
      });
      await gateBApi.addGateB({ id: projectId, gBData: currentItem, username: uid });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
      navigate('/cni/dashboard');
    }
  });

  return {
    item,
    attachments,
    materials,
    products,
    locations,
    gatebData,
    isLoading: isLoadingItem,
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
