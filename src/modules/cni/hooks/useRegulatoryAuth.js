import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { regulatoryAuthApi } from '../services/regulatoryAuthApi';

export function useRegulatoryAuth() {
  const queryClient = useQueryClient();

  const { data: employees, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['reportPersons'],
    queryFn: regulatoryAuthApi.getReportPerson,
  });

  const { data: accessData, isLoading: isLoadingAccess } = useQuery({
    queryKey: ['authorizeAccessData'],
    queryFn: regulatoryAuthApi.getAthorizeAccessData,
  });

  const mutation = useMutation({
    mutationFn: regulatoryAuthApi.regulatoryAuthorizeUsers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authorizeAccessData'] });
    }
  });

  return {
    employees: employees || [],
    accessData: accessData || [],
    isLoading: isLoadingEmployees || isLoadingAccess,
    saveAuthorization: mutation.mutateAsync,
    isSubmitting: mutation.isPending
  };
}
