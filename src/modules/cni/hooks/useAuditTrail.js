import { useQuery } from '@tanstack/react-query';
import { auditTrailApi } from '../services/auditTrailApi';
import { useCniPermissions } from './useCniPermissions';

export function useAuditTrail(projectId) {
  const { user, cniHead } = useCniPermissions();
  const cniHeadValue = cniHead ? 1 : 0;
  const uid = user === 'null' || !user ? '' : user;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['auditTrail', projectId, uid, cniHeadValue],
    queryFn: () => auditTrailApi.getAuditLogByProjectId({ projectId, uid, cniHead: cniHeadValue }),
    enabled: !!projectId,
  });

  return {
    data: data || [],
    isLoading,
    isError,
    error,
  };
}
