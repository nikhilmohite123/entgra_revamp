import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { stage1Api } from '../services/stage1Api';

export function useStage1(projectId) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const uid = localStorage.getItem('loginId') || '';

  const {
    data: projectData,
    isLoading: isLoadingProject,
    isError: isErrorProject,
  } = useQuery({
    queryKey: ['stage1Project', projectId, uid],
    queryFn: () => stage1Api.getProById({ id: projectId, uid }),
    enabled: !!projectId && !!uid,
  });

  const {
    data: attachments = [],
    isLoading: isLoadingAttach,
  } = useQuery({
    queryKey: ['stage1Attach', projectId, uid],
    queryFn: () => stage1Api.getProS1AttchById({ id: projectId, uid }),
    enabled: !!projectId && !!uid,
  });

  const {
    data: approvals = [],
    isLoading: isLoadingApprovals,
  } = useQuery({
    queryKey: ['stage1Approvals', projectId, uid],
    queryFn: () => stage1Api.getApprovelDetetail({ id: projectId, uid }),
    enabled: !!projectId && !!uid,
  });

  const item = projectData?.[0] || null;

  const saveMutation = useMutation({
    mutationFn: (payload) => stage1Api.Updatestage1Remark(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
      navigate('/cni/dashboard');
    }
  });

  const goAheadMutation = useMutation({
    mutationFn: async ({ item, proTeam }) => {
      // Step 1: goAheadByCNIHead
      await stage1Api.goAheadByCNIHead({ uid, id: projectId, item, proTeam });
      // Step 2: AddApprovalMAil only if Step 1 succeeds
      await stage1Api.AddApprovalMAil({ proTeam, prodata: item, id: projectId, uid });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
      navigate('/cni/dashboard');
    }
  });

  const scrapMutation = useMutation({
    mutationFn: (payload) => stage1Api.scrapProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
      navigate('/cni/dashboard');
    }
  });

  return {
    item,
    attachments,
    approvals,
    isLoading: isLoadingProject || isLoadingAttach || isLoadingApprovals,
    isError: isErrorProject,
    saveProject: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    goAhead: goAheadMutation.mutateAsync,
    isGoingAhead: goAheadMutation.isPending,
    scrapProject: scrapMutation.mutateAsync,
    isScrapping: scrapMutation.isPending,
  };
}
