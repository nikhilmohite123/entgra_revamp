import React, { useState, useEffect } from 'react';
import { LabOSAnalyticsTable } from './components/LabOSAnalyticsTable';
import { 
  useLabOSAnalyticsMaterials, 
  useLabOSAnalyticsSubTests, 
  useLabOSAnalyticsReport 
} from '../../hooks/useLabOS';
import { Filter, FileBarChart } from 'lucide-react';
import cniStyles from '../../styles/cni-premium.module.css';

const MODES = {
  PROPERTY_VS_MATERIAL: 'PROPERTY_VS_MATERIAL',
  LAMINATE_PROPERTY: 'LAMINATE_PROPERTY'
};

const AGGREGATIONS = {
  NONE: 'NONE',
  AVG: 'AVG',
  MIN_MAX: 'MIN_MAX'
};

const MAIN_TESTS = [
  { id: 'OT', label: 'Optical Testing' },
  { id: 'MT', label: 'Mechanical Testing' },
  { id: 'BT', label: 'Barrier Testing' },
  { id: 'CBT', label: 'CBT' }
];

export function LabOSAnalyticsPage() {
  const [mode, setMode] = useState(MODES.PROPERTY_VS_MATERIAL);
  const [aggregation, setAggregation] = useState(AGGREGATIONS.NONE);
  
  const [materialId, setMaterialId] = useState('');
  
  // Single/Multi state for Main Test
  const [mainTestSingle, setMainTestSingle] = useState('');
  const [mainTestMulti, setMainTestMulti] = useState([]);
  
  // Sub Test state (Always multi-select in legacy)
  const [subTests, setSubTests] = useState([]);

  const { data: materialsData, isLoading: isLoadingMaterials } = useLabOSAnalyticsMaterials();
  
  // Resolve current main test selection for Sub Test dependency
  const activeMainTest = mode === MODES.PROPERTY_VS_MATERIAL ? mainTestSingle : mainTestMulti;
  
  const { data: subTestsData, isLoading: isLoadingSubTests } = useLabOSAnalyticsSubTests(activeMainTest);
  
  const reportMutation = useLabOSAnalyticsReport();

  // Handle mode switch safely to prevent stale state leaking
  const handleModeSwitch = (newMode) => {
    if (newMode === mode) return;
    
    // Clear inputs that might be incompatible
    setSubTests([]);
    if (newMode === MODES.PROPERTY_VS_MATERIAL) {
      // Material hidden, clear it
      setMaterialId('');
      // Multi-select -> Single-select. Clear it.
      setMainTestSingle('');
    } else {
      // Single-select -> Multi-select. Clear it.
      setMainTestMulti([]);
    }
    
    // Clear the report result
    reportMutation.reset();
    
    setMode(newMode);
  };

  // Clear subtests when activeMainTest changes
  useEffect(() => {
    setSubTests([]);
    reportMutation.reset();
  }, [activeMainTest, mode]);

  const handleApply = () => {
    // Validate
    if (mode === MODES.LAMINATE_PROPERTY && !materialId) {
      alert("Please select a Material.");
      return;
    }
    
    const isMainTestValid = mode === MODES.PROPERTY_VS_MATERIAL ? !!mainTestSingle : mainTestMulti.length > 0;
    if (!isMainTestValid) {
      alert("Please select a Main Test.");
      return;
    }

    if (subTests.length === 0) {
      alert("Please select at least one Sub Test.");
      return;
    }

    // Build Payload perfectly mimicking legacy
    let payload = {};

    if (mode === MODES.PROPERTY_VS_MATERIAL) {
      payload = {
        maintest: mainTestSingle, // string
        subtest: subTests // array
      };
    } else {
      payload = {
        maintest: mainTestMulti, // array
        subtest: subTests, // array
        n_material_id: materialId // The legacy sometimes expects this to be array due to weird mat_id push bug, but sending string should be standard.
      };
      
      // Special case: In Laminate Property + None, legacy passes an array of material ids.
      if (aggregation === AGGREGATIONS.NONE) {
        payload.n_material_id = [materialId];
      }
    }

    reportMutation.mutate({ mode, aggregation, payload });
  };

  const handleReset = () => {
    setMaterialId('');
    setMainTestSingle('');
    setMainTestMulti([]);
    setSubTests([]);
    setAggregation(AGGREGATIONS.NONE);
    reportMutation.reset();
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
      
      {/* Legacy external reporting links */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: 600, flexGrow: 1 }}>Analytics Dashboard</h2>
        
        <a href="/lot_comp_report" className={cniStyles.btnSecondary} style={{ textDecoration: 'none' }}>
          LoT Comparison <span style={{fontSize: '10px', verticalAlign: 'super', color: 'var(--danger)'}}>Legacy</span>
        </a>
        <a href="/cni_lp_report" className={cniStyles.btnSecondary} style={{ textDecoration: 'none' }}>
          Graph <span style={{fontSize: '10px', verticalAlign: 'super', color: 'var(--danger)'}}>Legacy</span>
        </a>
        <a href="/cni_lp_rawreport" className={cniStyles.btnSecondary} style={{ textDecoration: 'none' }}>
          RAW Material <span style={{fontSize: '10px', verticalAlign: 'super', color: 'var(--danger)'}}>Legacy</span>
        </a>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        
        {/* Form Column */}
        <div style={{ flex: '0 0 350px', border: 'none', boxShadow: '0 8px 30px rgba(6, 43, 103, 0.08)' }} className={cniStyles.dashboardCard}>
          <div 
            className={cniStyles.cardHeader}
            style={{ 
              background: 'linear-gradient(135deg, var(--primary) 0%, #0a3a8a 100%)', 
              color: 'white', 
              borderRadius: '12px 12px 0 0',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              borderBottom: 'none'
            }}
          >
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Filter size={20} color="white" />
            </div>
            <h3 className={cniStyles.cardTitle} style={{ color: 'white', margin: 0, fontSize: '1.25rem' }}>Report Configuration</h3>
          </div>
          
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Mode Selection */}
            <div>
              <label className={cniStyles.formLabel}>Report Mode</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button 
                  className={mode === MODES.PROPERTY_VS_MATERIAL ? cniStyles.btnPrimary : cniStyles.btnSecondary}
                  onClick={() => handleModeSwitch(MODES.PROPERTY_VS_MATERIAL)}
                  style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }}
                >
                  Property Vs Material Codes
                </button>
                <button 
                  className={mode === MODES.LAMINATE_PROPERTY ? cniStyles.btnPrimary : cniStyles.btnSecondary}
                  onClick={() => handleModeSwitch(MODES.LAMINATE_PROPERTY)}
                  style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }}
                >
                  Laminate Property
                </button>
              </div>
            </div>

            <hr style={{ border: 0, borderTop: '1px solid var(--border-glass)', margin: 0 }} />

            {/* Material Selection (Visible only in LAMINATE_PROPERTY) */}
            {mode === MODES.LAMINATE_PROPERTY && (
              <div>
                <label className={cniStyles.formLabel}>Material Code</label>
                <select 
                  className={cniStyles.formControl}
                  value={materialId}
                  onChange={(e) => setMaterialId(e.target.value)}
                >
                  <option value="">Select Mat</option>
                  {!isLoadingMaterials && materialsData?.data?.map(m => (
                    <option key={m.n_mat_id} value={m.n_mat_id}>
                      {m.s_mat_code} ({m.s_sample_desc})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Main Test Selection */}
            <div>
              <label className={cniStyles.formLabel}>Main Test</label>
              {mode === MODES.PROPERTY_VS_MATERIAL ? (
                <select 
                  className={cniStyles.formControl}
                  value={mainTestSingle}
                  onChange={(e) => setMainTestSingle(e.target.value)}
                >
                  <option value="">Select Test</option>
                  {MAIN_TESTS.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              ) : (
                <select 
                  className={cniStyles.formControl}
                  multiple
                  value={mainTestMulti}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setMainTestMulti(values);
                  }}
                  style={{ height: '120px' }}
                >
                  {MAIN_TESTS.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Sub Test Selection */}
            <div>
              <label className={cniStyles.formLabel}>Sub Test</label>
              <select 
                className={cniStyles.formControl}
                multiple
                value={subTests}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setSubTests(values);
                }}
                disabled={isLoadingSubTests || (!mainTestSingle && mainTestMulti.length === 0)}
                style={{ height: '150px' }}
              >
                {!isLoadingSubTests && subTestsData?.data?.map(st => (
                  <option key={st.s_sub_test} value={st.s_sub_test}>
                    {st.s_test_name}
                  </option>
                ))}
              </select>
            </div>

            <hr style={{ border: 0, borderTop: '1px solid var(--border-glass)', margin: 0 }} />

            {/* Aggregation Selection */}
            <div>
              <label className={cniStyles.formLabel}>Options</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    checked={aggregation === AGGREGATIONS.NONE}
                    onChange={() => setAggregation(AGGREGATIONS.NONE)}
                  />
                  None
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    checked={aggregation === AGGREGATIONS.AVG}
                    onChange={() => setAggregation(AGGREGATIONS.AVG)}
                  />
                  AVG
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    checked={aggregation === AGGREGATIONS.MIN_MAX}
                    onChange={() => setAggregation(AGGREGATIONS.MIN_MAX)}
                  />
                  MIN-MAX
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button 
                onClick={handleApply}
                disabled={reportMutation.isPending}
                className={cniStyles.btnPrimary} 
                style={{ flex: 1 }}
              >
                {reportMutation.isPending ? 'Loading...' : 'Apply'}
              </button>
              <button 
                onClick={handleReset}
                className={cniStyles.btnSecondary} 
                style={{ flex: 1 }}
              >
                Reset
              </button>
            </div>

          </div>
        </div>

        {/* Results Column */}
        <div style={{ flex: 1, border: 'none', boxShadow: '0 8px 30px rgba(6, 43, 103, 0.08)' }} className={cniStyles.dashboardCard}>
          <div 
            className={cniStyles.cardHeader} 
            style={{ 
              background: 'linear-gradient(135deg, var(--primary) 0%, #0a3a8a 100%)', 
              color: 'white', 
              borderRadius: '12px 12px 0 0',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              borderBottom: 'none'
            }}
          >
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileBarChart size={20} color="white" />
            </div>
            <h3 className={cniStyles.cardTitle} style={{ color: 'white', margin: 0, fontSize: '1.25rem' }}>Test Results</h3>
          </div>
          
          <div style={{ padding: '0' }}>
            {(!reportMutation.isIdle && !reportMutation.isPending && !reportMutation.isError && reportMutation.data) ? (
              <LabOSAnalyticsTable 
                data={reportMutation.data} 
                isLoading={reportMutation.isPending} 
                isError={reportMutation.isError} 
              />
            ) : (
              <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                {reportMutation.isPending ? (
                  <div>Generating report...</div>
                ) : reportMutation.isError ? (
                  <div style={{ color: 'var(--danger)' }}>Failed to generate report. Please try again.</div>
                ) : (
                  <div>Configure your report and click Apply to see results.</div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
