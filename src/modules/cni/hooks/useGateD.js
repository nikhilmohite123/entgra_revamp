import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { gateDApi } from '../services/gateDApi';
import { projectApi } from '../services/projectApi';
import { stage4Api } from '../services/stage4Api';

export function useGateD(projectId) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const uid = localStorage.getItem('loginId') || '';

  const {
    data: item,
    isLoading: isLoadingItem,
    isError: isErrorItem,
  } = useQuery({
    queryKey: ['gateDProject', projectId, uid],
    queryFn: async () => {
      const data = await projectApi.getById({ id: projectId, uid });
      return data[0] || null;
    },
    enabled: !!projectId && !!uid,
  });

  const {
    data: gatedData,
    isLoading: isLoadingGated,
  } = useQuery({
    queryKey: ['gateDDetail', projectId, uid],
    queryFn: async () => {
      const data = await gateDApi.getGateDDetailById({ id: projectId, uid });
      return data[0] || null;
    },
    enabled: !!projectId && !!uid,
  });

  const {
    data: attch = [],
    isLoading: isLoadingAttch,
  } = useQuery({
    queryKey: ['gateDPersistentAttch', projectId, uid],
    queryFn: () => gateDApi.getProS4AttchById({ id: projectId }),
    enabled: !!projectId,
  });

  const {
    data: tempFiles = [],
    isLoading: isLoadingTemp,
  } = useQuery({
    queryKey: ['stage4TempFiles', projectId, uid],
    queryFn: () => stage4Api.getCNIStageFileInTable({ uid, type: 'S4', id: projectId }),
    enabled: !!projectId && !!uid,
  });

  const addGateMutation = useMutation({
    mutationFn: async ({ currentItem, s_level }) => {
      // Gate D sequencing: updateProStagelevel THEN addGateD
      await gateDApi.updateProStagelevel({ id: projectId, s_level, item: currentItem, uid });
      await gateDApi.addGateD({ id: projectId, gdData: currentItem, uid, s_level });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
      navigate('/cni/dashboard');
    }
  });

  const scrapMutation = useMutation({
    mutationFn: (payload) => gateDApi.scrapProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
      navigate('/cni/dashboard');
    }
  });

  const shelveMutation = useMutation({
    mutationFn: (payload) => gateDApi.shelveProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
      navigate('/cni/dashboard');
    }
  });

  const returnMutation = useMutation({
    mutationFn: (payload) => gateDApi.returnProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
      navigate('/cni/dashboard');
    }
  });

  const updateRecordMutation = useMutation({
    mutationFn: async ({ currentItem }) => {
      // 1. addGateD with s_level undefined
      await gateDApi.addGateD({ id: projectId, gdData: currentItem, uid, s_level: undefined });
      // 2. updateTblProject_ with s_level "4G"
      await gateDApi.updateTblProject({ id: projectId, uid, item: currentItem, s_level: "4G" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
      navigate('/cni/dashboard');
    }
  });

  return {
    item,
    gatedData,
    attch,
    tempFiles,
    isLoading: isLoadingItem || isLoadingGated || isLoadingAttch || isLoadingTemp,
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
