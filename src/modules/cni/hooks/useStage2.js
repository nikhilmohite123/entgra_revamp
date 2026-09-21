import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { stage2Api } from '../services/stage2Api';
import { projectApi } from '../services/projectApi';
import { format } from 'date-fns';

export function useStage2(projectId) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const uid = localStorage.getItem('loginId') || '';

  const {
    data: item,
    isLoading: isLoadingItem,
    isError: isErrorItem,
  } = useQuery({
    queryKey: ['stage2Project', projectId, uid],
    queryFn: async () => {
      const data = await projectApi.getById({ id: projectId, uid });
      return data[0];
    },
    enabled: !!projectId && !!uid,
  });

  const {
    data: locations = [],
  } = useQuery({
    queryKey: ['locations'],
    queryFn: () => projectApi.getLocation(),
  });

  const addStageMutation = useMutation({
    mutationFn: async ({ itemData, products, materials }) => {
      // Format dates to yyyy/MM/dd as required by legacy
      const formattedItem = { ...itemData };
      if (formattedItem.d_activation_date) {
        formattedItem.d_activation_date = format(new Date(formattedItem.d_activation_date), 'yyyy/MM/dd');
      }
      if (formattedItem.d_target_date) {
        formattedItem.d_target_date = format(new Date(formattedItem.d_target_date), 'yyyy/MM/dd');
      }
      if (formattedItem.d_dop_date) {
        formattedItem.d_dop_date = format(new Date(formattedItem.d_dop_date), 'yyyy/MM/dd');
      }

      await stage2Api.updateProStage2({ id: projectId, item: formattedItem, uid });

      if (products && products.length !== 0) {
        await stage2Api.addProjectDetail({ prodata: products, id: projectId });
      }

      if (materials && materials.length !== 0) {
        await stage2Api.addBusiRow({ prodata: materials, id: projectId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardRecords'] });
      navigate('/cni/dashboard');
    }
  });

  return {
    item,
    locations,
    isLoading: isLoadingItem,
    isError: isErrorItem,
    addStage: addStageMutation.mutateAsync,
    isAddingStage: addStageMutation.isPending,
  };
}
