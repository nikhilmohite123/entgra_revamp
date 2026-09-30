import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  CheckCircle,
  Clock,
  ArrowLeft,
  PieChart,
  Activity,
  Layers,
} from 'lucide-react';
import styles from '../styles/WccAnalytics.module.css';
import { BASE_URL } from '../constants/wccConstants';
import WccToast from '../component/WccToast';
import WccHeader from '../component/WccHeader';

// Helper to load Chart.js dynamically
const getChartJs = async () => {
  try {
    const ChartModule = await import('chart.js/auto');
    return ChartModule.default;
  } catch {
    return window.Chart;
  }
};

// Common chart color palette
const chartColors = [
  '#4facfe',
  '#00f2fe',
  '#43e97b',
  '#38f9d7',
  '#667eea',
  '#764ba2',
  '#f7971e',
  '#ff6a00',
];

export default function WccAnalyticsDashboardPage() {
  const navigate = useNavigate();

  // Top Stat Counts
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
  });

  // Table Data
  const [plantWiseData, setPlantWiseData] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [toast, setToast] = useState(null);

  // Canvas Refs
  const levelChartRef = useRef(null);
  const plantChartRef = useRef(null);
  const regionChartRef = useRef(null);
  const stackedChartRef = useRef(null);

  // Chart Instances for cleanup
  const levelChartInstance = useRef(null);
  const plantChartInstance = useRef(null);
  const regionChartInstance = useRef(null);
  const stackedChartInstance = useRef(null);

  // 1. Fetch Top Summary Data
  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`${BASE_URL}/workcompletionRoute/get_dashboard_data`);
      if (res.ok) {
        const result = await res.json();
        if (result && Array.isArray(result.data) && result.data.length > 0) {
          setStats({
            total: result.data[0].total || 0,
            completed: result.data[0].completed || 0,
            pending: result.data[0].pending || 0,
          });
        }
      }
    } catch (err) {
      console.error('Error fetching WCC dashboard summary:', err);
    }
  };

  // 2. Fetch & Render Level Chart
  const fetchLevelData = async (Chart) => {
    try {
      const res = await fetch(`${BASE_URL}/workcompletionRoute/get_level_data`);
      if (!res.ok) return;
      const result = await res.json();

      const labels = [];
      const counts = [];

      (result.data || []).forEach((item) => {
        labels.push(item.LEVEL || '');
        counts.push(item.level_count || 0);
      });

      if (levelChartInstance.current) {
        levelChartInstance.current.destroy();
      }

      if (levelChartRef.current) {
        const ctx = levelChartRef.current.getContext('2d');
        levelChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                label: 'Requests By Level',
                data: counts,
                backgroundColor: chartColors,
                borderWidth: 2,
                borderColor: '#ffffff',
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'top' },
            },
            scales: {
              y: { beginAtZero: true },
            },
          },
        });
      }
    } catch (err) {
      console.error('Error rendering level chart:', err);
    }
  };

  // 3. Fetch & Render Plant Chart (Pie)
  const fetchPlantData = async (Chart) => {
    try {
      const res = await fetch(`${BASE_URL}/workcompletionRoute/get_plant_data`);
      if (!res.ok) return;
      const result = await res.json();

      const labels = [];
      const counts = [];

      (result.data || []).forEach((item) => {
        labels.push(item.s_location || '');
        counts.push(item.plant_count || 0);
      });

      if (plantChartInstance.current) {
        plantChartInstance.current.destroy();
      }

      if (plantChartRef.current) {
        const ctx = plantChartRef.current.getContext('2d');
        plantChartInstance.current = new Chart(ctx, {
          type: 'pie',
          data: {
            labels,
            datasets: [
              {
                label: 'Requests By Plant',
                data: counts,
                backgroundColor: chartColors,
                borderWidth: 2,
                borderColor: '#ffffff',
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'right' },
            },
          },
        });
      }
    } catch (err) {
      console.error('Error rendering plant chart:', err);
    }
  };

  // 4. Fetch & Render Region Chart (Doughnut)
  const fetchRegionData = async (Chart) => {
    try {
      const res = await fetch(`${BASE_URL}/workcompletionRoute/get_region_data`);
      if (!res.ok) return;
      const result = await res.json();

      const labels = [];
      const counts = [];

      (result.data || []).forEach((item) => {
        labels.push(item.s_region || '');
        counts.push(item.request_count || 0);
      });

      if (regionChartInstance.current) {
        regionChartInstance.current.destroy();
      }

      if (regionChartRef.current) {
        const ctx = regionChartRef.current.getContext('2d');
        regionChartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels,
            datasets: [
              {
                label: 'Requests By Region',
                data: counts,
                backgroundColor: chartColors,
                borderWidth: 2,
                borderColor: '#ffffff',
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'right' },
            },
          },
        });
      }
    } catch (err) {
      console.error('Error rendering region chart:', err);
    }
  };

  // 5. Fetch & Render Completed vs Pending Stacked Chart
  const fetchCompletedPendingData = async (Chart) => {
    try {
      const res = await fetch(`${BASE_URL}/workcompletionRoute/get_completed_pending_data`);
      if (!res.ok) return;
      const result = await res.json();

      const labels = [];
      const countsCompleted = [];
      const countsPending = [];

      (result.data || []).forEach((item) => {
        labels.push(item.s_location || '');
        countsCompleted.push(item.completed_count || 0);
        countsPending.push(item.pending_count || 0);
      });

      if (stackedChartInstance.current) {
        stackedChartInstance.current.destroy();
      }

      if (stackedChartRef.current) {
        const ctx = stackedChartRef.current.getContext('2d');
        stackedChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                label: 'Pending',
                data: countsPending,
                backgroundColor: '#f59e0b',
              },
              {
                label: 'Completed',
                data: countsCompleted,
                backgroundColor: '#10b981',
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'top' },
            },
            scales: {
              x: { stacked: true },
              y: { stacked: true, beginAtZero: true },
            },
          },
        });
      }
    } catch (err) {
      console.error('Error rendering stacked chart:', err);
    }
  };

  // 6. Fetch Plant-Wise Summary Table
  const fetchPlantWiseSummary = async () => {
    setLoadingTable(true);
    try {
      const res = await fetch(`${BASE_URL}/workcompletionRoute/get_plant_wise_complete_pendding`);
      if (res.ok) {
        const result = await res.json();
        setPlantWiseData(result.data || []);
      }
    } catch (err) {
      console.error('Error fetching plant wise summary:', err);
    } finally {
      setLoadingTable(false);
    }
  };

  // Initialize all data and charts on mount
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      await fetchDashboardData();
      await fetchPlantWiseSummary();

      const Chart = await getChartJs();
      if (!isMounted || !Chart) return;

      fetchLevelData(Chart);
      fetchPlantData(Chart);
      fetchRegionData(Chart);
      fetchCompletedPendingData(Chart);
    };

    init();

    return () => {
      isMounted = false;
      if (levelChartInstance.current) levelChartInstance.current.destroy();
      if (plantChartInstance.current) plantChartInstance.current.destroy();
      if (regionChartInstance.current) regionChartInstance.current.destroy();
      if (stackedChartInstance.current) stackedChartInstance.current.destroy();
    };
  }, []);

  const openWCCPage = (type) => {
    sessionStorage.setItem('wccType', type);
    navigate('/wcc/wcc_data_export');
  };

  return (
    <div>
      <WccHeader />
      <div className={styles.dashboardContainer}>
        <WccToast toast={toast} onClose={() => setToast(null)} />

      {/* Top Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}>
            <Activity size={22} color="#ffffff" />
          </div>
          <h1 className={styles.headerTitle}>Work Completion Certificate Dashboard</h1>
        </div>
        <div className={styles.headerNav}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate('/wcc')}
          >
            <ArrowLeft size={16} /> Go Back to WCC
          </button>
        </div>
      </div>

      {/* Top Stats Overview */}
      <div className={styles.statsOverview}>
        <div
          className={`${styles.statCard} ${styles.total}`}
          onClick={() => openWCCPage('total')}
          title="Click to view all requests"
        >
          <div className={styles.statHeader}>
            <div>
              <div className={styles.statNumber}>
                {stats.total.toLocaleString()}
              </div>
              <div className={styles.statLabel}>Total Requests</div>
            </div>
            <div className={styles.statIcon}>
              <BarChart3 size={24} />
            </div>
          </div>
        </div>

        <div
          className={`${styles.statCard} ${styles.completed}`}
          onClick={() => openWCCPage('completed')}
          title="Click to view completed requests"
        >
          <div className={styles.statHeader}>
            <div>
              <div className={styles.statNumber}>
                {stats.completed.toLocaleString()}
              </div>
              <div className={styles.statLabel}>Completed</div>
            </div>
            <div className={styles.statIcon}>
              <CheckCircle size={24} />
            </div>
          </div>
        </div>

        <div
          className={`${styles.statCard} ${styles.pending}`}
          onClick={() => openWCCPage('pending')}
          title="Click to view pending requests"
        >
          <div className={styles.statHeader}>
            <div>
              <div className={styles.statNumber}>
                {stats.pending.toLocaleString()}
              </div>
              <div className={styles.statLabel}>Pending</div>
            </div>
            <div className={styles.statIcon}>
              <Clock size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className={styles.chartsGrid}>
        {/* Level-wise Bar Chart */}
        <div className={styles.chartContainer}>
          <div className={styles.chartTitle}>Level-wise Completion / Pendency</div>
          <div className={styles.chartWrapper}>
            <canvas ref={levelChartRef}></canvas>
          </div>
        </div>

        {/* Requests by Plant (Pie) */}
        <div className={styles.chartContainer}>
          <div className={styles.chartTitle}>Requests By Plant</div>
          <div className={styles.chartWrapper}>
            <canvas ref={plantChartRef}></canvas>
          </div>
        </div>

        {/* Requests by Region (Doughnut) */}
        {/* <div className={styles.chartContainer}> 
          <div className={styles.chartTitle}>Requests By Region</div>
          <div className={styles.chartWrapper}>
            <canvas ref={regionChartRef}></canvas>
          </div>
        </div>*/}

        {/* Stacked Completion vs Pending */}
        <div className={styles.chartContainer}>
          <div className={styles.chartTitle}>Plants Wise Status Of Completion VS Pending</div>
          <div className={styles.chartWrapper}>
            <canvas ref={stackedChartRef}></canvas>
          </div>
        </div>

        {/* Plant Summary Table Card */}
        <div className={`${styles.chartContainer} ${styles.fullWidthChart}`}>
          <div className={styles.chartTitle}>
            <Layers size={18} /> Plant-wise Request Summary
          </div>
          <div className={styles.tableContainer}>
            {loadingTable ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div> Loading plant summary data...
              </div>
            ) : plantWiseData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                No plant summary data available.
              </div>
            ) : (
              <table className={styles.plantSummaryTable}>
                <thead>
                  <tr>
                    <th>Plant Location</th>
                    <th>Total Requests</th>
                    <th>Completed Requests</th>
                    <th>Pending Requests</th>
                  </tr>
                </thead>
                <tbody>
                  {plantWiseData.map((row, idx) => {
                    const isTotal = row.s_location === 'TOTAL';
                    return (
                      <tr key={idx} className={isTotal ? styles.totalRow : ''}>
                        <td style={{ fontWeight: isTotal ? 700 : 500 }}>
                          {row.s_location || '—'}
                        </td>
                        <td style={{ fontWeight: isTotal ? 700 : 400 }}>
                          {row.total_request ?? 0}
                        </td>
                        <td className={styles.completedText}>
                          {row.completed_request ?? 0}
                        </td>
                        <td className={styles.pendingText}>
                          {row.pending_request ?? 0}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
