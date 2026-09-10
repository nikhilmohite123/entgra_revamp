import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/npdDashboard.module.css';
import NpdHeader from '../components/NpdHeader';
import { BASE_URL } from '../constants/npdConstants';

export default function NpdDashboardPage() {
  // Global View State
  const [stageProjects, setStageProjects] = useState({});
  const [stageVolumes, setStageVolumes] = useState({});
  const [stageAmounts, setStageAmounts] = useState({});
  const [globalTotals, setGlobalTotals] = useState({ projects: 0, volume: 0, amount: 0 });

  // Regional View State
  const [regionTable, setRegionTable] = useState([]);
  const [regionTotals, setRegionTotals] = useState({ projects: 0, volume: 0, amount: 0 });

  // Component View State
  const [componentTable, setComponentTable] = useState([]);
  const [componentTotals, setComponentTotals] = useState({ projects: 0, volume: 0, amount: 0 });

  // Investment View State
  const [investmentTable, setInvestmentTable] = useState([]);

  // Canvas Refs
  const chart1Ref = useRef(null);
  const chart2Ref = useRef(null);
  const chart3Ref = useRef(null);
  const chart4Ref = useRef(null);

  // Chart Instances Refs
  const chart1Instance = useRef(null);
  const chart2Instance = useRef(null);
  const chart3Instance = useRef(null);
  const chart4Instance = useRef(null);
  const baseUrl = BASE_URL;
  // Helper to load Chart.js dynamically
  const getChartJs = async () => {
    try {
      const ChartModule = await import('chart.js/auto');
      return ChartModule.default;
    } catch {
      return window.Chart;
    }
  };

  // Section 1: Fetch Global Stage Data
  useEffect(() => {
    const fetchStageProjects = async () => {
      try {
        const response = await fetch(`${baseUrl}/npd/getstagewiseproject`, { method: 'POST' });
        const result = await response.json();
        if (result && Array.isArray(result.data)) {
          const map = {};
          result.data.forEach((item) => {
            if (item.s_status) map[item.s_status] = item.stsproj;
          });
          setStageProjects(map);
        }
      } catch (err) {
        console.error('Error fetching stage projects:', err);
      }
    };

    const fetchStageVolAmount = async () => {
      try {
        const response = await fetch(`${baseUrl}/npd/getstagevolamount`, { method: 'POST' });
        const result = await response.json();
        if (result && Array.isArray(result.data)) {
          const volMap = {};
          const amountMap = {};
          result.data.forEach((item) => {
            if (item.s_status) {
              volMap[item.s_status] = item.val || 0;
              amountMap[item.s_status] = item.capaxamount || 0;
            }
          });
          setStageVolumes(volMap);
          setStageAmounts(amountMap);
        }
      } catch (err) {
        console.error('Error fetching stage vol amount:', err);
      }
    };

    const fetchGraph1 = async () => {
      try {
        const response = await fetch(`${baseUrl}/npd/get_graph_data`, { method: 'POST' });
        const result = await response.json();
        if (result && Array.isArray(result.data)) {
          const labels = [];
          const projects = [];
          const volumes = [];
          const amounts = [];
          let totP = 0, totV = 0, totA = 0;

          result.data.forEach((item) => {
            if (item.s_status && item.s_status.trim().toLowerCase() === 'total') {
              totP = item.stsproj || 0;
              totV = item.val || 0;
              totA = item.capaxamount || 0;
            } else {
              labels.push(item.s_status || '_');
              projects.push(item.stsproj || 0);
              volumes.push(item.val || 0);
              amounts.push(item.capaxamount || 0);
            }
          });

          setGlobalTotals({ projects: totP, volume: totV, amount: totA });

          const ChartClass = await getChartJs();
          if (ChartClass && chart1Ref.current) {
            if (chart1Instance.current) chart1Instance.current.destroy();
            chart1Instance.current = new ChartClass(chart1Ref.current, {
              type: 'bar',
              data: {
                labels,
                datasets: [
                  { label: 'Projects', data: projects, backgroundColor: 'rgba(54, 162, 235, 0.6)' },
                  { label: 'Volume (millions)', data: volumes, backgroundColor: 'rgba(255, 206, 86, 0.6)' },
                  { label: 'Amount', data: amounts, backgroundColor: 'rgba(38, 185, 82, 0.6)' },
                ],
              },
              options: { responsive: true, scales: { y: { beginAtZero: true } } },
            });
          }
        }
      } catch (err) {
        console.error('Error fetching graph 1:', err);
      }
    };

    fetchStageProjects();
    fetchStageVolAmount();
    fetchGraph1();
  }, []);

  // Section 2: Fetch Regional Data
  useEffect(() => {
    const fetchRegional = async () => {
      try {
        const response = await fetch(`${baseUrl}/npd/get_region_wise_data`);
        const result = await response.json();
        if (result && Array.isArray(result.data)) {
          setRegionTable(result.data);

          const labels = [];
          const projects = [];
          const volumes = [];
          const amounts = [];
          let totP = 0, totV = 0, totA = 0;

          result.data.forEach((item) => {
            if (item.s_region && item.s_region.trim().toLowerCase() === 'total') {
              totP = item.stsproj || 0;
              totV = item.val || 0;
              totA = item.capaxamount || 0;
            } else {
              labels.push(item.s_region || '_');
              projects.push(item.stsproj || 0);
              volumes.push(item.val || 0);
              amounts.push(item.capaxamount || 0);
            }
          });

          setRegionTotals({ projects: totP, volume: totV, amount: totA });

          const ChartClass = await getChartJs();
          if (ChartClass && chart2Ref.current) {
            if (chart2Instance.current) chart2Instance.current.destroy();
            chart2Instance.current = new ChartClass(chart2Ref.current, {
              type: 'bar',
              data: {
                labels,
                datasets: [
                  { label: 'Projects', data: projects, backgroundColor: 'rgba(54, 162, 235, 0.6)' },
                  { label: 'Volume (millions)', data: volumes, backgroundColor: 'rgba(255, 206, 86, 0.6)' },
                  { label: 'Amount', data: amounts, backgroundColor: 'rgba(38, 185, 82, 0.6)' },
                ],
              },
              options: { responsive: true, scales: { y: { beginAtZero: true } } },
            });
          }
        }
      } catch (err) {
        console.error('Error fetching regional data:', err);
      }
    };
    fetchRegional();
  }, []);

  // Section 3: Fetch Component Data
  useEffect(() => {
    const fetchComponent = async () => {
      try {
        const response = await fetch(`${baseUrl}/npd/get_component_wise_data`);
        const result = await response.json();
        if (result && Array.isArray(result.data)) {
          setComponentTable(result.data);

          const labels = [];
          const projects = [];
          const volumes = [];
          const amounts = [];
          let totP = 0, totV = 0, totA = 0;

          result.data.forEach((item) => {
            if (item.s_component && item.s_component.trim().toLowerCase() === 'total') {
              totP = item.stsproj || 0;
              totV = item.val || 0;
              totA = item.capaxamount || 0;
            } else {
              labels.push(item.s_component || '_');
              projects.push(item.stsproj || 0);
              volumes.push(item.val || 0);
              amounts.push(item.capaxamount || 0);
            }
          });

          setComponentTotals({ projects: totP, volume: totV, amount: totA });

          const ChartClass = await getChartJs();
          if (ChartClass && chart3Ref.current) {
            if (chart3Instance.current) chart3Instance.current.destroy();
            chart3Instance.current = new ChartClass(chart3Ref.current, {
              type: 'bar',
              data: {
                labels,
                datasets: [
                  { label: 'Projects', data: projects, backgroundColor: 'rgba(54, 162, 235, 0.6)' },
                  { label: 'Volume (millions)', data: volumes, backgroundColor: 'rgba(255, 206, 86, 0.6)' },
                  { label: 'Amount', data: amounts, backgroundColor: 'rgba(38, 185, 82, 0.6)' },
                ],
              },
              options: { responsive: true, scales: { y: { beginAtZero: true } } },
            });
          }
        }
      } catch (err) {
        console.error('Error fetching component data:', err);
      }
    };
    fetchComponent();
  }, []);

  // Section 4: Fetch Investment Data
  useEffect(() => {
    const fetchInvestment = async () => {
      try {
        const response = await fetch(`${baseUrl}/npd/get_investment_wise_data`);
        const result = await response.json();
        if (result && Array.isArray(result.data)) {
          const mergedMap = {};
          result.data.forEach((item) => {
            let detail = item.s_tool_inv_detail;
            if (!detail || detail.trim() === '') {
              detail = 'NOT YET DECIDED';
            }
            if (!mergedMap[detail]) {
              mergedMap[detail] = {
                s_tool_inv_detail: detail,
                stsproj: 0,
                val: 0,
                capaxamount: 0,
              };
            }
            mergedMap[detail].stsproj += Number(item.stsproj || 0);
            mergedMap[detail].val += Number(item.val || 0);
            mergedMap[detail].capaxamount += Number(item.capaxamount || 0);
          });

          const tableRows = Object.values(mergedMap);
          setInvestmentTable(tableRows);

          const labels = [];
          const projects = [];
          const volumes = [];
          const amounts = [];

          result.data.forEach((item) => {
            labels.push(item.s_tool_inv_detail || '');
            projects.push(item.stsproj || 0);
            volumes.push(item.val || 0);
            amounts.push(item.capaxamount || 0);
          });

          const ChartClass = await getChartJs();
          if (ChartClass && chart4Ref.current) {
            if (chart4Instance.current) chart4Instance.current.destroy();
            chart4Instance.current = new ChartClass(chart4Ref.current, {
              type: 'bar',
              data: {
                labels,
                datasets: [
                  { label: 'Projects', data: projects, backgroundColor: 'rgba(54, 162, 235, 0.6)' },
                  { label: 'Volume (millions)', data: volumes, backgroundColor: 'rgba(255, 206, 86, 0.6)' },
                  { label: 'Amount', data: amounts, backgroundColor: 'rgba(38, 185, 82, 0.6)' },
                ],
              },
              options: { responsive: true, scales: { y: { beginAtZero: true } } },
            });
          }
        }
      } catch (err) {
        console.error('Error fetching investment data:', err);
      }
    };
    fetchInvestment();
  }, []);

  // Clean up charts on unmount
  useEffect(() => {
    return () => {
      if (chart1Instance.current) chart1Instance.current.destroy();
      if (chart2Instance.current) chart2Instance.current.destroy();
      if (chart3Instance.current) chart3Instance.current.destroy();
      if (chart4Instance.current) chart4Instance.current.destroy();
    };
  }, []);

  const STAGES = [
    { name: 'Stage 1', desc: 'Business Case Approval', keyP: 'Stage 1', keyV: 'Stage 1' },
    { name: 'Stage 2', desc: 'Mould Development', keyP: 'Stage 2', keyV: 'Stage 2' },
    { name: 'Stage 3', desc: 'Mould/Sample Approval', keyP: 'Stage 3', keyV: 'Stage 3' },
    { name: 'Stage 4', desc: 'Proto-Commercial', keyP: 'Stage 4', keyV: 'Stage 4' },
    { name: 'Stage 5', desc: 'Commercial', keyP: 'Stage 5', keyV: 'Stage 5' },
  ];

  return (
    <div>
      {/* NPD Header */}
      <NpdHeader />

      <div className={`container-fluid ${styles.dashboardContainer}`}>
        {/* 1. EPL Global View */}
        <div className={styles.cardSection}>
          <div className={styles.cardHeader}>
            <h4 className="mb-0">EPL Global View</h4>
          </div>
          <div className={styles.cardBody}>
            <div className="row">
              <div className="col-md-6">
                <div className={styles.tableResponsive}>
                  <table className={styles.tableDashboard}>
                    <thead>
                      <tr>
                        <th>Stage</th>
                        <th>Description</th>
                        <th>Projects</th>
                        <th>Tube Volume<br />(millions)</th>
                        <th>Amount<br />(USD'000)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {STAGES.map((st, idx) => (
                        <tr key={idx}>
                          <td>{st.name}</td>
                          <td>{st.desc}</td>
                          <td>{stageProjects[st.keyP] || '-'}</td>
                          <td>{stageVolumes[st.keyV] !== undefined ? Number(stageVolumes[st.keyV]).toFixed(2) : '-'}</td>
                          <td>{stageAmounts[st.keyV] !== undefined ? Number(stageAmounts[st.keyV]).toFixed(2) : '-'}</td>
                        </tr>
                      ))}
                      <tr className={styles.blueclass}>
                        <td>Total</td>
                        <td>-</td>
                        <td>{stageProjects['Total'] || '-'}</td>
                        <td>{stageVolumes['Total'] !== undefined ? Number(stageVolumes['Total']).toFixed(2) : '-'}</td>
                        <td>{stageAmounts['Total'] !== undefined ? Number(stageAmounts['Total']).toFixed(2) : '-'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="col-md-6">
                <div className={styles.chartTotalsHeader}>
                  <span className={styles.totalBlue}>Total Projects: {globalTotals.projects.toFixed(2)}</span>
                  <span className={styles.totalGold}>Total Volume: {globalTotals.volume.toFixed(2)}M</span>
                  <span className={styles.totalGreen}>Total Amount: {Number(globalTotals.amount).toLocaleString()}</span>
                </div>
                <div className={styles.chartCanvasContainer}>
                  <canvas ref={chart1Ref} id="barChart" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. EPL Regional View */}
        <div className={styles.cardSection}>
          <div className={styles.cardHeader}>
            <h4 className="mb-0">EPL Regional View</h4>
          </div>
          <div className={styles.cardBody}>
            <div className="row">
              <div className="col-md-6">
                <div className={styles.tableResponsive}>
                  <table className={styles.tableDashboard}>
                    <thead>
                      <tr>
                        <th>Region</th>
                        <th>Projects</th>
                        <th>Tube Volume<br />(millions)</th>
                        <th>Amount<br />(USD'000)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {regionTable.map((item, idx) => {
                        const isTotal = item.s_region === 'Total';
                        return (
                          <tr key={idx} className={isTotal ? styles.blueclass : ''}>
                            <td>{item.s_region}</td>
                            <td>{item.stsproj}</td>
                            <td>{Number(item.val || 0).toFixed(2)}</td>
                            <td>{Number(item.capaxamount || 0).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="col-md-6">
                <div className={styles.chartTotalsHeader}>
                  <span className={styles.totalBlue}>Total Projects: {regionTotals.projects}</span>
                  <span className={styles.totalGold}>Total Volume: {regionTotals.volume.toFixed(2)}M</span>
                  <span className={styles.totalGreen}>Total Amount: {Number(regionTotals.amount).toLocaleString()}</span>
                </div>
                <div className={styles.chartCanvasContainer}>
                  <canvas ref={chart2Ref} id="barChart2" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. EPL Component View */}
        <div className={styles.cardSection}>
          <div className={styles.cardHeader}>
            <h4 className="mb-0">EPL Component View</h4>
          </div>
          <div className={styles.cardBody}>
            <div className="row">
              <div className="col-md-6">
                <div className={styles.tableResponsive}>
                  <table className={styles.tableDashboard}>
                    <thead>
                      <tr>
                        <th>Component</th>
                        <th>Projects</th>
                        <th>Tube Volume<br />(millions)</th>
                        <th>Amount<br />(USD'000)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {componentTable.map((item, idx) => {
                        const isTotal = item.s_component === 'Total';
                        return (
                          <tr key={idx} className={isTotal ? styles.blueclass : ''}>
                            <td>{item.s_component}</td>
                            <td>{item.stsproj}</td>
                            <td>{Number(item.val || 0).toFixed(2)}</td>
                            <td>{Number(item.capaxamount || 0).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="col-md-6">
                <div className={styles.chartTotalsHeader}>
                  <span className={styles.totalBlue}>Total Projects: {componentTotals.projects}</span>
                  <span className={styles.totalGold}>Total Volume: {componentTotals.volume.toFixed(2)}M</span>
                  <span className={styles.totalGreen}>Total Amount: {Number(componentTotals.amount).toLocaleString()}</span>
                </div>
                <div className={styles.chartCanvasContainer}>
                  <canvas ref={chart3Ref} id="barChart3" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. EPL Investment Wise */}
        <div className={styles.cardSection}>
          <div className={styles.cardHeader}>
            <h4 className="mb-0">EPL Investment Wise</h4>
          </div>
          <div className={styles.cardBody}>
            <div className="row">
              <div className="col-md-6">
                <div className={styles.tableResponsive}>
                  <table className={styles.tableDashboard}>
                    <thead>
                      <tr>
                        <th>Investment Details</th>
                        <th>Projects</th>
                        <th>Tube Volume<br />(millions)</th>
                        <th>Amount<br />(USD'000)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {investmentTable.map((item, idx) => {
                        const isTotal = item.s_tool_inv_detail === 'Total';
                        return (
                          <tr key={idx} className={isTotal ? styles.blueclass : ''}>
                            <td>{item.s_tool_inv_detail}</td>
                            <td>{item.stsproj}</td>
                            <td>{Number(item.val || 0).toFixed(2)}</td>
                            <td>{Number(item.capaxamount || 0).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="col-md-6">
                <div className={styles.chartCanvasContainer}>
                  <canvas ref={chart4Ref} id="barChart4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
