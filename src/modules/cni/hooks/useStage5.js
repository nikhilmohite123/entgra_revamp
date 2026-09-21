import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { stage5Api } from '../services/stage5Api';
import { projectApi } from '../services/projectApi';

export function useStage5(projectId) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const uid = localStorage.getItem('loginId') || '';

  const { data: rawItem, isLoading: isLoadingItem } = useQuery({
    queryKey: ['stage5Project', projectId, uid],
    queryFn: async () => {
      const data = await projectApi.getById({ id: projectId, uid });
      return data[0] || null;
    },
    enabled: !!projectId && !!uid,
  });

  const { data: rawMaterials = [], isLoading: isLoadingMaterials, refetch: refetchMaterials } = useQuery({
    queryKey: ['stage5Materials', projectId],
    queryFn: () => stage5Api.getPreProductionListById({ id: projectId }),
    enabled: !!projectId,
  });

  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['cniEmployees'],
    queryFn: () => stage5Api.getEpmDetail(),
  });

  const { data: flcsd_materials_raw = [], isLoading: isLoadingFlcsd } = useQuery({
    queryKey: ['stage5FlcsdMaterials', projectId, uid],
    queryFn: () => stage5Api.getRawStg4MaterialListById({ id: projectId, uid }),
    enabled: !!projectId && !!uid,
  });

  const { data: tempFiles = [], isLoading: isLoadingTemp } = useQuery({
    queryKey: ['stage5TempFiles', projectId, uid],
    queryFn: () => stage5Api.getCNIStageFileInTable({ uid, type: 'S5', id: projectId }),
    enabled: !!projectId && !!uid,
  });

  const addStageMutation = useMutation({
    mutationFn: async ({ item, flcsd_materials, approvals }) => {
      const itemPayload = { prodata: item, id: projectId, item, uid, Approvals: approvals };
      const approvalPayload = { Approvals: approvals, id: projectId, uid, item };
      const custPayload = { prodata: flcsd_materials, id: projectId };

      await Promise.all([
        stage5Api.updateProStage5(itemPayload).then(() => stage5Api.addApprovalsForGate5(approvalPayload)),
        stage5Api.addCustVDetail(custPayload)
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
      navigate('/cni/dashboard');
    }
  });

  const saveRemarkMutation = useMutation({
    mutationFn: (item) => stage5Api.Updatestage1Remark({ item, uid, id: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
      navigate('/cni/dashboard');
    }
  });

  const deleteMaterialMutation = useMutation({
    mutationFn: (id) => stage5Api.deleteListDataByIds({ id }),
    onSuccess: () => refetchMaterials()
  });

  const uploadPreproductionMutation = useMutation({
    mutationFn: (formData) => stage5Api.uploadStage5PreProductionRowDetails(formData),
    onSuccess: () => refetchMaterials()
  });

  const deleteTempFileMutation = useMutation({
    mutationFn: (attachId) => stage5Api.deleteStageFileInStage({ uid, attachId, proId: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stage5TempFiles', projectId, uid] });
    }
  });

  return {
    rawItem,
    rawMaterials,
    employees,
    flcsd_materials_raw,
    tempFiles,
    isLoading: isLoadingItem || isLoadingMaterials || isLoadingEmployees || isLoadingFlcsd || isLoadingTemp,
    addStage: addStageMutation.mutateAsync,
    isAddingStage: addStageMutation.isPending,
    saveRemark: saveRemarkMutation.mutateAsync,
    isSavingRemark: saveRemarkMutation.isPending,
    deleteMaterial: deleteMaterialMutation.mutateAsync,
    isDeletingMaterial: deleteMaterialMutation.isPending,
    uploadPreproduction: uploadPreproductionMutation.mutateAsync,
    isUploadingPreproduction: uploadPreproductionMutation.isPending,
    deleteTempFile: deleteTempFileMutation.mutateAsync,
    isDeletingFile: deleteTempFileMutation.isPending
  };
}
