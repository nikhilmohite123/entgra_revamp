import { useQuery } from '@tanstack/react-query';
import { projectApi } from '../services/projectApi';
import { useCniPermissions } from './useCniPermissions';

export function useStageGateData() {
  const { user: uid, cniHead: isCniHead } = useCniPermissions();
  const cniHead = isCniHead ? '1' : '0';
  
  const payload = { id: uid, cniHead };

  const myProjects = useQuery({
    queryKey: ['stageGate', 'myProjects', uid],
    queryFn: async () => {
      const res = await projectApi.getAllStageDataById(payload);
      return res.data || [];
    },
  });

  const cniHeadApproval = useQuery({
    queryKey: ['stageGate', 'cniHeadApproval', uid],
    queryFn: async () => {
      const res = await projectApi.getPendingCniApprovalData(payload);
      return res.data || [];
    },
  });

  const otherOption = useQuery({
    queryKey: ['stageGate', 'otherOption', uid],
    queryFn: async () => {
      const res = await projectApi.getPendingApprovalData(payload);
      return res.data || [];
    },
  });

  const stageProjects = useQuery({
    queryKey: ['stageGate', 'stageProjects', uid],
    queryFn: async () => {
      const res = await projectApi.getAllStageData(payload);
      return res.data || [];
    },
  });

  const commercialCif = useQuery({
    queryKey: ['stageGate', 'commercialCif', uid],
    queryFn: async () => {
      const res = await projectApi.getAllStageDataCfi(payload);
      return res.data || [];
    },
  });

  const cifApproved = useQuery({
    queryKey: ['stageGate', 'cifApproved', uid],
    queryFn: async () => {
      const res = await projectApi.getAllStageDataCfiApproved(payload);
      return res.data || [];
    },
  });

  const projectStatus = useQuery({
    queryKey: ['stageGate', 'projectStatus', uid],
    queryFn: async () => {
      const res = await projectApi.getReportDataList(payload);
      return res.data || [];
    },
  });

  const projectSummary = useQuery({
    queryKey: ['stageGate', 'projectSummary', uid],
    queryFn: async () => {
      const res = await projectApi.getAllCniProjects(payload);
      return res.data || [];
    },
  });

  const refetchAll = () => {
    myProjects.refetch();
    cniHeadApproval.refetch();
    otherOption.refetch();
    stageProjects.refetch();
    commercialCif.refetch();
    cifApproved.refetch();
    projectStatus.refetch();
    projectSummary.refetch();
  };

  const isLoading = myProjects.isLoading || cniHeadApproval.isLoading || otherOption.isLoading || 
                    stageProjects.isLoading || commercialCif.isLoading || cifApproved.isLoading || 
                    projectStatus.isLoading || projectSummary.isLoading;

  const hasError = myProjects.isError || cniHeadApproval.isError || otherOption.isError || 
                   stageProjects.isError || commercialCif.isError || cifApproved.isError || 
                   projectStatus.isError || projectSummary.isError;

  return {
    myProjects,
    cniHeadApproval,
    otherOption,
    stageProjects,
    commercialCif,
    cifApproved,
    projectStatus,
    projectSummary,
    
    isLoading,
    hasError,
    refetchAll
  };
}
