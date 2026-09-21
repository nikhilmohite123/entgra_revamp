import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { gateAApi } from '../services/gateAApi';

export function useGateA(projectId) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const uid = localStorage.getItem('loginId') || '';

  const {
    data: projectData,
    isLoading: isLoadingProject,
    isError: isErrorProject,
  } = useQuery({
    queryKey: ['gateAProject', projectId, uid],
    queryFn: () => gateAApi.getProById({ id: projectId, uid }),
    enabled: !!projectId && !!uid,
  });

  const {
    data: attachments = [],
  } = useQuery({
    queryKey: ['gateAAttach', projectId, uid],
    queryFn: () => gateAApi.getProS1AttchById({ id: projectId, uid }),
    enabled: !!projectId && !!uid,
  });

  const {
    data: approvals = [],
  } = useQuery({
    queryKey: ['gateAApprovals', projectId, uid],
    queryFn: () => gateAApi.getApprovelDetetailCNI_2_({ id: projectId, uid }),
    enabled: !!projectId && !!uid,
  });

  const {
    data: teamData = [],
  } = useQuery({
    queryKey: ['gateATeam', projectId],
    queryFn: () => gateAApi.getGateADetailById({ id: projectId }),
    enabled: !!projectId,
  });

  const item = projectData?.[0] || null;

  const addGateMutation = useMutation({
    mutationFn: async ({ item, proTeam }) => {
      await gateAApi.updateProStagelevel({ id: projectId, s_level: 2, uid, item });
      await gateAApi.addGateA({ proTeam, prodata: item, id: projectId, s_level: "2", uid });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
      navigate('/cni/dashboard');
    }
  });

  const updateRecordMutation = useMutation({
    mutationFn: async ({ item, proTeam }) => {
      await gateAApi.updateTblProject({ id: projectId, uid, item, s_level: "1G" });
      await gateAApi.addGateA({ proTeam, prodata: item, id: projectId, s_level: "1G", uid });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
      // Update record doesn't redirect in legacy, it just logs status. But let's stay on page or navigate?
      // Legacy code for updateTblProject says: `console.log(status)` then `$scope.AddGateA(item, level = "1G");`
      // `AddGateA` success redirects to `stageTbl`.
      navigate('/cni/dashboard');
    }
  });

  const scrapMutation = useMutation({
    mutationFn: (payload) => gateAApi.scrapProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
      navigate('/cni/dashboard');
    }
  });

  const shelveMutation = useMutation({
    mutationFn: (payload) => gateAApi.shelveProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
      navigate('/cni/dashboard');
    }
  });

  const deleteGateRecMutation = useMutation({
    mutationFn: (rec) => gateAApi.deleteGateRec({ rec }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gateATeam', projectId] });
    }
  });

  return {
    item,
    attachments,
    approvals,
    teamData,
    isLoading: isLoadingProject,
    isError: isErrorProject,
    addGate: addGateMutation.mutateAsync,
    isAddingGate: addGateMutation.isPending,
    updateRecord: updateRecordMutation.mutateAsync,
    isUpdatingRecord: updateRecordMutation.isPending,
    scrapProject: scrapMutation.mutateAsync,
    isScrapping: scrapMutation.isPending,
    shelveProject: shelveMutation.mutateAsync,
    isShelving: shelveMutation.isPending,
    deleteGateRec: deleteGateRecMutation.mutateAsync,
  };
}
