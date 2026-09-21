import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '../services/projectApi';

export function useTempFiles() {
  const queryClient = useQueryClient();
  const uid = localStorage.getItem('loginId') || ''; // The verified identity mapping

  const {
    data: tempFiles = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['tempFiles', uid],
    queryFn: async () => {
      const res = await projectApi.getTempFiles({ uid });
      return res.data || [];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (formData) => projectApi.uploadTempFile(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tempFiles', uid] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => projectApi.deleteTempFile({ uid, id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tempFiles', uid] });
    },
  });

  return {
    tempFiles,
    isLoading,
    isError,
    uploadFile: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    deleteFile: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
