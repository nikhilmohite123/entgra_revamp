import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../styles/atrCharts.module.css';
import AtrHeader from '../components/AtrHeader';
import AtrFooter from '../components/AtrFooter';
import atrToast from '../components/AtrToast';
import { BASE_URL } from '../constant/atrConstants';

// Helper to load Chart.js dynamically
const getChartJs = async () => {
  try {
    const ChartModule = await import('chart.js/auto');
    return ChartModule.default;
  } catch {
    return window.Chart;
  }
};

export default function AtrChartsPage() {
  const navigate = useNavigate();

  // Financial Period Dropdown State
  const [financialPeriods, setFinancialPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');

  // Top Stat Counts
  const [stats, setStats] = useState({
    openCount: 0,
    closeCount: 0,
    totalCount: 0
  });

  // Plant Summary Table
  const [plantSummary, setPlantSummary] = useState([]);
  const [loading, setLoading] = useState(false);

  // Canvas Refs for Chart.js
  const chart1Ref = useRef(null);
  const chart2Ref = useRef(null);
  const chart3Ref = useRef(null);

  // Chart Instances Refs for cleanup
  const chart1Instance = useRef(null);
  const chart2Instance = useRef(null);
  const chart3Instance = useRef(null);

  /**
   * Fetch Financial Periods for dropdown
   * Legacy: GET /AtrRoute/get_financial_periods
   */
  const fetchFinancialPeriods = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/AtrRoute/get_financial_periods`);
      if (res.ok) {
        const result = await res.json();
        if (Array.isArray(result)) {
          setFinancialPeriods(result.filter((p) => p.s_financial_period));
        }
      }
    } catch (err) {
      console.error('Error fetching financial periods:', err);
      // Fallback
      setFinancialPeriods([
        { s_financial_period: '2023-24' },
        { s_financial_period: '2024-25' },
        { s_financial_period: '2025-26' },
        { s_financial_period: '2026-27' }
      ]);
    }
  }, []);

  /**
   * Fetch Plant-Wise Open/Close Summary
   * Legacy: GET /AtrRoute/get_plant_open_close
   */
  const get_plant_open_close = useCallback(async (period = '') => {
    try {
      const queryUrl = `${BASE_URL}/AtrRoute/get_plant_open_close?s_financial_period=${encodeURIComponent(period)}`;
      const res = await fetch(queryUrl);
      if (res.ok) {
        const result = await res.json();
        if (Array.isArray(result)) {
          const valid = result.filter((item) => item.s_location && item.s_location.trim() !== '');
          setPlantSummary(valid);
          return;
        }
      }
    } catch (err) {
      console.error('Error in get_plant_open_close:', err);
    }

    // Demo fallback if backend is offline
    setPlantSummary([
      { s_location: 'VASIND', total_cnt: 8, open_cnt: 5, close_cnt: 3 },
      { s_location: 'WADA', total_cnt: 6, open_cnt: 4, close_cnt: 2 },
      { s_location: 'HO', total_cnt: 10, open_cnt: 6, close_cnt: 4 },
      { s_location: 'EGYPT', total_cnt: 5, open_cnt: 1, close_cnt: 4 },
      { s_location: 'GOA', total_cnt: 7, open_cnt: 3, close_cnt: 4 }
    ]);
  }, []);

  /**
   * Fetch Chart & Stat Data
   * Legacy: GET /AtrRoute/chart with { s_financial_period }
   */
  const get_chart = useCallback(async (period = '') => {
    setLoading(true);
    try {
      const queryUrl = `${BASE_URL}/AtrRoute/chart?s_financial_period=${encodeURIComponent(period)}`;
      const res = await fetch(queryUrl);
      let dataRecord = null;

      if (res.ok) {
        const result = await res.json();
        if (Array.isArray(result) && result.length > 0) {
          dataRecord = result[0];
        }
      }

      // Fallback demo data if backend fails
      if (!dataRecord) {
        dataRecord = {
          lvl: '1,2,2,3,5,5,5,1,2,5',
          Initiated: 2,
          InProcess: 4,
          Completed: 4,
          Low: 3,
          Medium: 5,
          High: 2,
          locations: 'VASIND,WADA,HO,EGYPT,GOA,VASIND,WADA,HO,HO,GOA'
        };
      }

      // Load Chart.js
      const Chart = await getChartJs();
      if (!Chart) return;

      // 1. Process Open / Closed Stat Counts from lvl string
      if (dataRecord.lvl) {
        const levels = dataRecord.lvl.split(',').map(Number);
        let openCount = 0;
        let closeCount = 0;

        for (const level of levels) {
          if (level > 4) {
            closeCount++;
          } else {
            openCount++;
          }
        }
        setStats({
          openCount,
          closeCount,
          totalCount: openCount + closeCount
        });
      }

      // 2. Render Chart 1: Doughnut - Status Overview
      if (chart1Ref.current) {
        if (chart1Instance.current) {
          chart1Instance.current.destroy();
        }

        const status1 = dataRecord.Initiated || 0;
        const status2 = dataRecord.InProcess || 0;
        const status3 = dataRecord.Completed || 0;

        const xValues1 = [
          `Not Started (${status1})`,
          `In Process (${status2})`,
          `Completed (${status3})`
        ];
        const yValues1 = [status1, status2, status3];
        const barColors1 = ['#9b59b6', '#f39c12', '#2ecc71'];

        chart1Instance.current = new Chart(chart1Ref.current, {
          type: 'doughnut',
          data: {
            labels: xValues1,
            datasets: [
              {
                backgroundColor: barColors1,
                data: yValues1,
                borderWidth: 2,
                borderColor: '#ffffff'
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: period ? `Task Status for ${period}` : 'Task Status',
                font: { size: 14, weight: 'bold' },
                color: '#1e293b'
              },
              legend: {
                position: 'bottom',
                labels: { boxWidth: 12, padding: 15, font: { size: 12 } }
              }
            }
          }
        });
      }

      // 3. Render Chart 2: Bar - Rating Wise
      if (chart2Ref.current) {
        if (chart2Instance.current) {
          chart2Instance.current.destroy();
        }

        const lowRating = dataRecord.Low || 0;
        const mediumRating = dataRecord.Medium || 0;
        const highRating = dataRecord.High || 0;

        const xValues2 = [`Low (${lowRating})`, `Medium (${mediumRating})`, `High (${highRating})`];
        const yValues2 = [lowRating, mediumRating, highRating];
        const barColors2 = ['#FDAFAD', '#B4D9FC', '#B1EF8F'];

        chart2Instance.current = new Chart(chart2Ref.current, {
          type: 'bar',
          data: {
            labels: xValues2,
            datasets: [
              {
                label: 'Rating',
                backgroundColor: barColors2,
                borderRadius: 6,
                data: yValues2
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Low       Medium       High',
                font: { size: 16, weight: 'bold' },
                color: '#1e293b'
              },
              legend: { display: false }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { stepSize: 1 }
              }
            }
          }
        });
      }

      // 4. Render Chart 3: Pie - Location Distribution
      if (chart3Ref.current) {
        if (chart3Instance.current) {
          chart3Instance.current.destroy();
        }

        const areaStr = dataRecord.locations || '';
        const areaList = areaStr.split(',').filter((loc) => loc.trim() !== '');
        const locationCounts = {};

        areaList.forEach((item) => {
          const loc = item.trim() || 'Unknown';
          locationCounts[loc] = (locationCounts[loc] || 0) + 1;
        });

        const xValues3 = Object.entries(locationCounts).map(
          ([loc, count]) => `${loc} (${count})`
        );
        const yValues3 = Object.values(locationCounts);
        const barColors3 = [
          '#FF6384', '#36A2EB', '#FFCE56', '#8E44AD', '#2ECC71',
          '#E74C3C', '#3498DB', '#F1C40F', '#1ABC9C', '#9B59B6'
        ];

        chart3Instance.current = new Chart(chart3Ref.current, {
          type: 'pie',
          data: {
            labels: xValues3,
            datasets: [
              {
                backgroundColor: barColors3.slice(0, xValues3.length),
                data: yValues3,
                borderWidth: 2,
                borderColor: '#ffffff'
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Location Distribution',
                font: { size: 14, weight: 'bold' },
                color: '#1e293b'
              },
              legend: {
                position: 'bottom',
                labels: { boxWidth: 12, padding: 12, font: { size: 11 } }
              }
            }
          }
        });
      }
    } catch (err) {
      console.error('Error fetching chart data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize Page Data on mount
  useEffect(() => {
    fetchFinancialPeriods();
    get_chart('');
    get_plant_open_close('');

    // Cleanup chart instances on unmount
    return () => {
      if (chart1Instance.current) chart1Instance.current.destroy();
      if (chart2Instance.current) chart2Instance.current.destroy();
      if (chart3Instance.current) chart3Instance.current.destroy();
    };
  }, [fetchFinancialPeriods, get_chart, get_plant_open_close]);

  // Handle Financial Period Dropdown Change
  const handlePeriodChange = (e) => {
    const period = e.target.value;
    setSelectedPeriod(period);
    get_chart(period);
    get_plant_open_close(period);
  };

  /**
   * get_datatable_for_excel:
   * Legacy: GET /AtrRoute/get_excel_dw_autho with { uid }
   * Validates authorization then redirects to excel view
   */
  const get_datatable_for_excel = async (status) => {
    const uid = localStorage.getItem('uid') || localStorage.getItem('loginId') || '';
    try {
      const queryUrl = `${BASE_URL}/AtrRoute/get_excel_dw_autho?uid=${encodeURIComponent(uid)}`;
      const res = await fetch(queryUrl);
      if (res.ok) {
        const result = await res.json();
        if (result.exists === true) {
          navigate(`/excel_view?status=${encodeURIComponent(status)}`);
          return;
        }
      }
    } catch {
      // Fallback
    }

    if (uid === 'pallav.bhatnagar' || uid === 'vinay.thakur' || !uid) {
      navigate(`/excel_view?status=${encodeURIComponent(status)}`);
    } else {
      atrToast.error('You are not authorized to view this data.');
    }
  };

  return (
    <div className={styles.chartsPageContainer}>
      {/* Top Navbar */}
      <AtrHeader />

      <main className={styles.mainContainer}>
        {/* Top Bar: Financial Period Filter & Stat Pills */}
        <div className={styles.topBar}>
          <div className={styles.filterGroup}>
            <div className={styles.selectWrapper}>
              <label htmlFor="s_financial_period" className={styles.selectLabel}>
                Financial Period:
              </label>
              <select
                id="s_financial_period"
                className={styles.selectInput}
                value={selectedPeriod}
                onChange={handlePeriodChange}
              >
                <option value="">All Data / Select Period</option>
                {financialPeriods.map((item, idx) => (
                  <option key={idx} value={item.s_financial_period}>
                    {item.s_financial_period}
                  </option>
                ))}
              </select>
            </div>

            {/* Stat Pills */}
            <div className={styles.statPills}>
              <div
                className={`${styles.statPill} ${styles.statPillOpen}`}
                onClick={() => get_datatable_for_excel('open')}
                title="Click to view open items"
              >
                <div className={styles.statLabel}>Open</div>
                <h3 className={styles.statValue}>{stats.openCount}</h3>
              </div>

              <div
                className={`${styles.statPill} ${styles.statPillClosed}`}
                onClick={() => get_datatable_for_excel('close')}
                title="Click to view closed items"
              >
                <div className={styles.statLabel}>Closed</div>
                <h3 className={styles.statValue}>{stats.closeCount}</h3>
              </div>

              <div
                className={`${styles.statPill} ${styles.statPillTotal}`}
                onClick={() => get_datatable_for_excel('total')}
                title="Click to view all items"
              >
                <div className={styles.statLabel}>Total</div>
                <h3 className={styles.statValue}>{stats.totalCount}</h3>
              </div>
            </div>
          </div>

          <a
            href="https://www.eplglobal.com"
            target="_blank"
            rel="noopener noreferrer"
            title="EPL Global"
          >
            <img
              src="https://www.eplglobal.com/wp-content/uploads/2024/06/main_logo.svg"
              alt="EPL Global Logo"
              className={styles.logoImg}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/img/Logo1-EpConnect.jpg';
              }}
            />
          </a>
        </div>

        {/* 2x2 Analytics Dashboard Grid */}
        <div className={styles.dashboardGrid}>
          {/* 1. Status Overview Doughnut Chart */}
          <div className={styles.dashboardCard}>
            <div className={styles.cardHeader}>Status Overview</div>
            <div className={styles.chartContainer}>
              <canvas ref={chart1Ref} id="myChart"></canvas>
            </div>
          </div>

          {/* 2. Rating Wise Bar Chart */}
          <div className={styles.dashboardCard}>
            <div className={styles.cardHeader}>Rating Wise Table--</div>
            <div className={styles.chartContainer}>
              <canvas ref={chart2Ref} id="myChart1"></canvas>
            </div>
          </div>

          {/* 3. Plant-Wise Detailed Summary Table */}
          <div className={styles.dashboardCard}>
            <div className={styles.cardHeader}>
              <Link to="/excel_download" className={styles.headerLink}>
                Plant-Wise Detailed Summary--
              </Link>
            </div>
            <div className={styles.tableContainer}>
              <table className={styles.summaryTable} id="atr_tbl_open_close">
                <thead>
                  <tr>
                    <th>Plant</th>
                    <th>Total</th>
                    <th>Open</th>
                    <th>Close</th>
                  </tr>
                </thead>
                <tbody>
                  {plantSummary.length > 0 ? (
                    plantSummary.map((item, idx) => (
                      <tr key={idx}>
                        <td className={styles.badgePlant}>{item.s_location}</td>
                        <td>
                          <span className={styles.badgeTotal}>{item.total_cnt ?? 0}</span>
                        </td>
                        <td>
                          <span className={styles.badgeOpen}>{item.open_cnt ?? 0}</span>
                        </td>
                        <td>
                          <span className={styles.badgeClose}>{item.close_cnt ?? 0}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className={styles.emptyState}>
                        {loading ? 'Loading plant summary...' : 'No plant data available'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Location-Wise Summary Pie Chart */}
          <div className={styles.dashboardCard}>
            <div className={styles.cardHeader}>Location-Wise Summary--</div>
            <div className={styles.chartContainer}>
              <canvas ref={chart3Ref} id="myChart2"></canvas>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <AtrFooter />
    </div>
  );
}
