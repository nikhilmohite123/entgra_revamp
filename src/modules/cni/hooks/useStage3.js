import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { stage3Api } from '../services/stage3Api';
import { projectApi } from '../services/projectApi';

export function useStage3(projectId) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const uid = localStorage.getItem('loginId') || '';

  const {
    data: item,
    isLoading: isLoadingItem,
    isError: isErrorItem,
  } = useQuery({
    queryKey: ['stage3Project', projectId, uid],
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
    queryKey: ['stage3TempFiles', projectId, uid],
    queryFn: () => stage3Api.getCNIStageFileInTable({ uid, type: 'S3', id: projectId }),
    enabled: !!projectId && !!uid,
  });

  const uploadTempFileMutation = useMutation({
    mutationFn: (formData) => projectApi.uploadTempFileGeneric(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stage3TempFiles', projectId, uid] });
    },
  });

  const addStageMutation = useMutation({
    mutationFn: (payload) => stage3Api.updateProStage3(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
      navigate('/cni/dashboard');
    }
  });

  const deleteTempFileMutation = useMutation({
    mutationFn: (attachId) => stage3Api.deleteStageFileInStage({ uid, attachId, proId: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stage3TempFiles', projectId, uid] });
    }
  });

  const uploadRowDetailsMutation = useMutation({
    mutationFn: (formData) => stage3Api.uploadStage3RowDetails(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gateCProducts', projectId, uid] });
      queryClient.invalidateQueries({ queryKey: ['gateCMaterials', projectId, uid] });
    }
  });

  const uploadCandILabDetailsMutation = useMutation({
    mutationFn: (formData) => stage3Api.uploadStage3_CandI_lab_Details(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gateCProducts', projectId, uid] });
      queryClient.invalidateQueries({ queryKey: ['gateCMaterials', projectId, uid] });
    }
  });

  return {
    item,
    tempFiles,
    isLoading: isLoadingItem || isLoadingTempFiles,
    isError: isErrorItem,
    addStage: addStageMutation.mutateAsync,
    isAddingStage: addStageMutation.isPending,
    uploadRowDetails: uploadRowDetailsMutation.mutateAsync,
    isUploadingRow: uploadRowDetailsMutation.isPending,
    uploadCandILabDetails: uploadCandILabDetailsMutation.mutateAsync,
    isUploadingCandI: uploadCandILabDetailsMutation.isPending,
    deleteTempFile: deleteTempFileMutation.mutateAsync,
    isDeletingFile: deleteTempFileMutation.isPending,
  };
}
