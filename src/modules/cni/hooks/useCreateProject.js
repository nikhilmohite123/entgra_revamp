import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '../services/projectApi';

export function useCreateProject() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createMutation = useMutation({
    mutationFn: (payload) => projectApi.create(payload),
    onSuccess: () => {
      // Invalidate dashboard queries to ensure fresh data on redirect
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
      // Navigate to the Dashboard (legacy stageTbl)
      navigate('/cni/stages');
    },
  });

  return {
    createProject: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
