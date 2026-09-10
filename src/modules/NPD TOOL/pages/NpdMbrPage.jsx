import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/npdMbr.module.css';
import NpdHeader from '../components/NpdHeader';
import { BASE_URL } from '../constants/npdConstants';

const ALL_STAGES = [
  { stage: 'Stage 1', desc: 'Business Case Approval' },
  { stage: 'Stage 2', desc: 'Mould Development' },
  { stage: 'Stage 3', desc: 'Mould / Sample Approval' },
  { stage: 'Stage 4', desc: 'Proto-Commercial' },
  { stage: 'Stage 5', desc: 'Commercial' },
];

const REGIONS = [
  { value: 'AMESA', label: 'Amesa' },
  { value: 'EAP', label: 'EAP' },
  { value: 'AMERICAS', label: 'Americas' },
  { value: 'EU', label: 'EU' },
];

export default function NpdMbrPage() {
  const [selectedRegion, setSelectedRegion] = useState('AMESA');
  const [stageData, setStageData] = useState([]);
  const [stageTotals, setStageTotals] = useState({ projects: 0, volume: 0, amount: 0 });
  const [criticalProjects, setCriticalProjects] = useState([]);
  const [loadingStage, setLoadingStage] = useState(true);
  const [loadingCritical, setLoadingCritical] = useState(true);
  const [imageZoomUrl, setImageZoomUrl] = useState(null);

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Dynamic Chart.js import helper
  const getChartJs = async () => {
    try {
      const ChartModule = await import('chart.js/auto');
      return ChartModule.default;
    } catch {
      return window.Chart;
    }
  };
  const baseUrl = BASE_URL;
  // 1. Fetch Stage Wise Data
  useEffect(() => {
    const fetchStageWiseData = async () => {
      setLoadingStage(true);
      try {
        const response = await fetch(`${baseUrl}/npd/stage_wise_data_by_region?region=${selectedRegion}`);
        const res = await response.json();
        const apiData = res.data || [];

        const apiMap = {};
        apiData.forEach((item) => {
          apiMap[item.stage] = item;
        });

        let totP = 0, totV = 0, totA = 0;
        const rows = ALL_STAGES.map((s) => {
          const item = apiMap[s.stage] || { projects: 0, tube_volume_mn: 0, amount_usd_000: 0 };
          const p = Number(item.projects || 0);
          const v = Number(item.tube_volume_mn || 0);
          const a = Number(item.amount_usd_000 || 0);
          totP += p;
          totV += v;
          totA += a;
          return {
            stage: s.stage,
            desc: s.desc,
            projects: p,
            tube_volume_mn: v,
            amount_usd_000: a,
          };
        });

        setStageData(rows);
        setStageTotals({ projects: totP, volume: totV, amount: totA });
      } catch (err) {
        console.error('Error fetching stage wise data:', err);
      } finally {
        setLoadingStage(false);
      }
    };

    fetchStageWiseData();
  }, [selectedRegion]);

  // 2. Fetch Critical Projects Data
  useEffect(() => {
    const fetchCriticalData = async () => {
      setLoadingCritical(true);
      try {
        const response = await fetch(`${baseUrl}/npd/load_creatical_data?region=${selectedRegion}`);
        const res = await response.json();
        setCriticalProjects(res.data || []);
      } catch (err) {
        console.error('Error fetching critical data:', err);
        setCriticalProjects([]);
      } finally {
        setLoadingCritical(false);
      }
    };

    fetchCriticalData();
  }, [selectedRegion]);

  // 3. Fetch Volume Bar Chart Data
  useEffect(() => {
    const fetchVolumeGraph = async () => {
      try {
        const response = await fetch(`${baseUrl}/npd/get_volume_graph_data?region=${selectedRegion}`);
        const result = await response.json();
        const dataArray = result.data || [];

        const values = dataArray.map((item) => Number(item.total_value || 0));
        const total = values.reduce((sum, val) => sum + val, 0);

        const chartValues = [...values, total];
        const chartLabels = ['Q1 25-26', 'Q2 25-26', 'Q3 25-26', 'Q4 25-26', 'TOTAL'];

        const ChartClass = await getChartJs();
        if (ChartClass && chartRef.current) {
          if (chartInstance.current) chartInstance.current.destroy();

          const ctx = chartRef.current.getContext('2d');
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, 'rgba(80, 150, 220, 0.9)');
          gradient.addColorStop(1, 'rgba(160, 205, 245, 0.9)');

          chartInstance.current = new ChartClass(chartRef.current, {
            type: 'bar',
            data: {
              labels: chartLabels,
              datasets: [
                {
                  label: 'Volume (millions)',
                  data: chartValues,
                  backgroundColor: gradient,
                  borderColor: 'rgba(60, 120, 200, 1)',
                  borderWidth: 1,
                },
              ],
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Quarterly Projected Volume',
                  font: { size: 16, weight: 'bold' },
                },
                legend: { display: false },
              },
              scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Volume' } },
                x: { title: { display: true, text: 'Time series' } },
              },
            },
          });
        }
      } catch (err) {
        console.error('Error fetching volume graph data:', err);
      }
    };

    fetchVolumeGraph();
  }, [selectedRegion]);

  // Clean up chart on unmount
  useEffect(() => {
    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, []);

  const getRegionTitle = () => {
    if (selectedRegion === 'AMESA') return 'Project Status Amesa';
    if (selectedRegion === 'AMERICAS') return 'Project Status Americas';
    return `Project Status ${selectedRegion}`;
  };

  return (
    <div>
      {/* NPD Header */}
      <NpdHeader />

      <div className={`container-fluid ${styles.mbrContainer}`}>
        {/* Region Radio Selector */}
        <div className={styles.regionSelector}>
          {REGIONS.map((r) => {
            const isChecked = selectedRegion === r.value;
            return (
              <button
                key={r.value}
                type="button"
                className={`${styles.regionBtn} ${isChecked ? styles.regionBtnActive : ''}`}
                onClick={() => setSelectedRegion(r.value)}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        {/* STAGE WISE VIEW CARD */}
        <div className={styles.cardSection}>
          <h2>{getRegionTitle()}</h2>
          <div className={styles.gridSplit}>
            {/* Stage Table */}
            <div className="table-responsive">
              <table className={styles.tableMbr}>
                <thead>
                  <tr>
                    <th>Stage</th>
                    <th>Description</th>
                    <th>Projects</th>
                    <th>Volume in MN</th>
                    <th>Capex AMT($)</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingStage ? (
                    <tr>
                      <td colSpan={5} className="py-3 text-muted">Loading stage data...</td>
                    </tr>
                  ) : (
                    <>
                      {stageData.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.stage}</td>
                          <td>{row.desc}</td>
                          <td>{row.projects}</td>
                          <td>{row.tube_volume_mn.toFixed(2)}</td>
                          <td>{row.amount_usd_000.toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className={styles.blueclass}>
                        <td>Total</td>
                        <td></td>
                        <td>{stageTotals.projects}</td>
                        <td>{stageTotals.volume.toFixed(2)}</td>
                        <td>{stageTotals.amount.toFixed(2)}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Quarterly Volume Bar Chart */}
            <div className={styles.chartBox}>
              <canvas ref={chartRef} id="barChart2" />
            </div>
          </div>
        </div>

        {/* CRITICAL PROJECTS CARD */}
        <div className={styles.cardSection}>
          <h2>Critical Projects</h2>
          <div className="table-responsive">
            <table className={styles.criticalTable}>
              <thead>
                <tr>
                  <th>Project No</th>
                  <th>Component</th>
                  <th>Project Name</th>
                  <th>Targeted Customer</th>
                  <th>Potential Vol<br />(Mn Tubes/Yr)</th>
                  <th>Capex Approved Amount<br />(USD 000)</th>
                  <th>Expected Completion</th>
                  <th>Image</th>
                </tr>
              </thead>
              <tbody>
                {loadingCritical ? (
                  <tr>
                    <td colSpan={8} className="py-3 text-muted">Loading critical projects...</td>
                  </tr>
                ) : criticalProjects.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-3 text-muted">No Critical Projects Found</td>
                  </tr>
                ) : (
                  criticalProjects.map((row, idx) => {
                    const hasImage = row.s_path && row.s_npd_new_file_name;
                    const imageSrc = hasImage ? `${row.s_path}/${row.s_npd_new_file_name}` : null;

                    return (
                      <tr key={idx}>
                        <td>{row.s_project_no || '-'}</td>
                        <td>{row.s_component || '-'}</td>
                        <td>{row.s_project_name || '-'}</td>
                        <td>{row.s_targated_customer || '-'}</td>
                        <td>{row.s_potential_vol || '-'}</td>
                        <td>{row.s_capex_app_amount || '-'}</td>
                        <td>{row.s_expected_com || '-'}</td>
                        <td>
                          {imageSrc ? (
                            <img
                              src={imageSrc}
                              alt="Project Thumbnail"
                              className={styles.tableThumb}
                              onClick={() => setImageZoomUrl(imageSrc)}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <span className="text-muted small">No Image</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Full Image Zoom Modal */}
      {imageZoomUrl && (
        <div className={styles.imageModalOverlay} onClick={() => setImageZoomUrl(null)}>
          <img src={imageZoomUrl} alt="Zoomed View" className={styles.zoomedImage} />
        </div>
      )}
    </div>
  );
}
