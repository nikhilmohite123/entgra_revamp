import { useQuery } from '@tanstack/react-query';
import { logApi } from '../services/logApi';

export function useLogs() {
  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ['reguAccessName'],
    queryFn: logApi.getReguAccessName,
  });

  const { data: reportData, isLoading: isReportLoading } = useQuery({
    queryKey: ['genReport'],
    queryFn: logApi.genReport,
  });

  return {
    users: usersData || [],
    reports: reportData?.data || [], // Note: legacy accesses result.data
    isLoading: isUsersLoading || isReportLoading,
  };
}
