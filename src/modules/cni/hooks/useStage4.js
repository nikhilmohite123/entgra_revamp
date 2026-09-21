import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { stage4Api } from '../services/stage4Api';
import { projectApi } from '../services/projectApi';

export function useStage4(projectId) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const uid = localStorage.getItem('loginId') || '';

  const {
    data: rawItem,
    isLoading: isLoadingItem,
    isError: isErrorItem,
  } = useQuery({
    queryKey: ['stage4Project', projectId, uid],
    queryFn: async () => {
      const data = await projectApi.getById({ id: projectId, uid });
      return data[0] || null;
    },
    enabled: !!projectId && !!uid,
  });

  const {
    data: tempFiles = [],
    isLoading: isLoadingTempFiles,
  } = useQuery({
    queryKey: ['stage4TempFiles', projectId, uid],
    queryFn: () => stage4Api.getCNIStageFileInTable({ uid, type: 'S4', id: projectId }),
    enabled: !!projectId && !!uid,
  });

  // Note: the legacy Stage4Ctrl fetches getProS4AttchById only in Gate D? Actually in stage4.html it renders it
  // both for Stage 4 and Gate D, wait. Stage4Ctrl.js does NOT fetch getProS4AttchById. Only GateDCtrl.js fetches it!
  // BUT Stage 4 HTML is shared. We'll only fetch it in Gate D as per legacy behavior.

  const addStageMutation = useMutation({
    mutationFn: (payload) => stage4Api.updateProStage4(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
      navigate('/cni/dashboard');
    }
  });

  const deleteTempFileMutation = useMutation({
    mutationFn: (attachId) => stage4Api.deleteStageFileInStage({ uid, attachId, proId: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stage4TempFiles', projectId, uid] });
    }
  });

  return {
    rawItem,
    tempFiles,
    isLoading: isLoadingItem || isLoadingTempFiles,
    isError: isErrorItem,
    addStage: addStageMutation.mutateAsync,
    isAddingStage: addStageMutation.isPending,
    deleteTempFile: deleteTempFileMutation.mutateAsync,
    isDeletingFile: deleteTempFileMutation.isPending,
  };
}
