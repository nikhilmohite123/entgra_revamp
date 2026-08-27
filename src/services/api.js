// Mock API service supplying realistic dashboard stats and log entries
export const getDashboardStats = (moduleId) => {
  return {
    metrics: [
      { label: 'Active Sessions', value: `${(moduleId * 12 + 104).toLocaleString()}`, icon: 'users', trend: '+4.8%' },
      { label: 'CPU Utilization', value: `${Math.min(98, 15 + moduleId * 6)}%`, icon: 'cpu', trend: '-2.1%' },
      { label: 'Request Success Rate', value: `${(99.4 + (moduleId % 3) * 0.2).toFixed(1)}%`, icon: 'activity', trend: 'stable' },
      { label: 'Alert Volume', value: `${moduleId * 2 + 1}`, icon: 'bell', trend: '-10%' },
    ],
    telemetry: Array.from({ length: 5 }, (_, i) => ({
      id: `tel-${moduleId}-${i}`,
      event: `Module ${moduleId} heartbeat verified`,
      timestamp: new Date(Date.now() - i * 60000).toLocaleTimeString(),
      status: i % 2 === 0 ? 'Optimal' : 'Checking',
      severity: i % 2 === 0 ? 'success' : 'warning',
    })),
  };
};

export const getModuleTableData = (moduleId) => {
  return Array.from({ length: 8 }, (_, i) => ({
    id: `row-${moduleId}-${i + 1}`,
    name: `Resource ID #${1000 + moduleId * 100 + i}`,
    category: moduleId % 2 === 0 ? 'Production' : 'Staging',
    value: `$${(250 + moduleId * 15 + i * 5).toFixed(2)}`,
    status: i % 3 === 0 ? 'Active' : i % 3 === 1 ? 'Pending' : 'Suspended',
    badgeClass: i % 3 === 0 ? 'success' : i % 3 === 1 ? 'warning' : 'danger',
  }));
};
