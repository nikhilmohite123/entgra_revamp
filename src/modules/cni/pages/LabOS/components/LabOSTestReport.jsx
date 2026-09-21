import React from 'react';
import cniStyles from "../../../styles/cni-premium.module.css";
import { CniLoader } from '../../../components/common';

export function LabOSTestReport({ data, isLoading, isError, lpIds, headerData }) {
  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}><CniLoader /></div>;
  if (isError) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>Failed to load Test Report.</div>;
  if (!data || !headerData || lpIds.length === 0) return null;

  // The legacy endpoint returns a 7-element array:
  // 0: Optical Testing
  // 1: Mechanical Testing
  // 2: Barrier Testing
  // 3: CBT
  // 4: DOP Details
  // 5: RM Testing
  // 6: Seal Properties

  // Pivot logic: Helper to find the record for a specific LP ID within a specific category array
  const getRecord = (categoryArray, lpId) => categoryArray?.find(r => r.n_lp_id === lpId);

  // Helper for formatting values
  const fmt = (val) => (val === 'NA' || val == null ? 'ND' : Number(val).toFixed(2));

  // Determine if RM Test (Category 4)
  const isRmTest = headerData.s_categories === '4';

  return (
    <div className={cniStyles.dashboardCard} style={{ marginBottom: '2rem' }}>
      <div className={cniStyles.cardHeader} style={{ background: 'var(--primary)', color: 'white', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between' }}>
        <h3 className={cniStyles.cardTitle} style={{ color: 'white' }}>Test Result</h3>
      </div>
      
      <div className={cniStyles.cardBody} style={{ padding: 0, overflowX: 'auto' }}>
        <table className={cniStyles.cniTable} style={{ margin: 0, minWidth: '1000px' }}>
          <thead>
            <tr>
              <th className={cniStyles.cniTh} colSpan={3}>Matcode</th>
              {lpIds.map(id => <th key={id} className={cniStyles.cniTh} style={{ color: 'var(--primary)' }}>{getRecord(data[4], id)?.s_mat_code || '--'}</th>)}
            </tr>
            <tr>
              <th className={cniStyles.cniTh} colSpan={3}>Lab Sam Id</th>
              {lpIds.map(id => <th key={id} className={cniStyles.cniTh} style={{ color: 'var(--primary)' }}>{getRecord(data[4], id)?.s_lab_sample_id || '--'}</th>)}
            </tr>
            <tr>
              <th className={cniStyles.cniTh} colSpan={3}>DOP</th>
              {lpIds.map(id => <th key={id} className={cniStyles.cniTh} style={{ color: 'var(--primary)' }}>{getRecord(data[4], id)?.d_dop ? new Date(getRecord(data[4], id).d_dop).toLocaleDateString() : '--'}</th>)}
            </tr>
            <tr>
              <th className={cniStyles.cniTh} colSpan={3}>Sample Desc.</th>
              {lpIds.map(id => <th key={id} className={cniStyles.cniTh} style={{ color: 'var(--primary)' }}>{getRecord(data[4], id)?.s_sample_desc || '--'}</th>)}
            </tr>
          </thead>
          
          {!isRmTest ? (
            <tbody>
              {/* --- OPTICAL TESTINGS --- */}
              <tr>
                <td colSpan={3 + lpIds.length} style={{ background: 'var(--bg-tertiary)', fontWeight: 600, padding: '0.5rem 1rem' }}>OPTICAL TESTINGS</td>
              </tr>
              <tr>
                <td colSpan={3} style={{ fontWeight: 600 }}>DOT</td>
                {lpIds.map(id => <td key={id}>{getRecord(data[0], id)?.d_ot_dot ? new Date(getRecord(data[0], id).d_ot_dot).toLocaleDateString() : '0'}</td>)}
              </tr>
              <tr>
                <th className={cniStyles.cniTh}>NAME OF TEST</th>
                <th className={cniStyles.cniTh}>UNIT</th>
                <th className={cniStyles.cniTh}>STANDARD USED</th>
                <th className={cniStyles.cniTh} colSpan={lpIds.length} style={{ textAlign: 'center' }}>TEST RESULTS</th>
              </tr>
              <tr>
                <td>OPACITY</td><td>%</td><td>IS 1060(PART-1,CLAUSE 16):1966</td>
                {lpIds.map(id => <td key={id}>{getRecord(data[0], id) ? fmt(getRecord(data[0], id).f_opacity) : '0'}</td>)}
              </tr>
              <tr>
                <td>WHITENESS INDEX</td><td>-</td><td>ASTM E 313-98</td>
                {lpIds.map(id => <td key={id}>{getRecord(data[0], id) ? fmt(getRecord(data[0], id).f_whiteness_index) : '0'}</td>)}
              </tr>
              <tr>
                <td>YELLOWNESS INDEX</td><td>-</td><td>IS 13360 (PART 9 SEC 9):2001</td>
                {lpIds.map(id => <td key={id}>{getRecord(data[0], id) ? fmt(getRecord(data[0], id).f_yellowness_index) : '0'}</td>)}
              </tr>
              <tr>
                <td>HAZE/TRANSPARENCY</td><td>-</td><td>ASTM D1003 - 13</td>
                {lpIds.map(id => <td key={id}>{getRecord(data[0], id) ? fmt(getRecord(data[0], id).f_haze_transparancy) : '0'}</td>)}
              </tr>
              <tr>
                <td>GLOSS 20°</td><td>GU</td><td>ASTM D-2457</td>
                {lpIds.map(id => <td key={id}>{getRecord(data[0], id) ? fmt(getRecord(data[0], id).f_gloss_20) : '0'}</td>)}
              </tr>
              <tr>
                <td>GLOSS 60°</td><td>GU</td><td>ASTM D-2457</td>
                {lpIds.map(id => <td key={id}>{getRecord(data[0], id) ? fmt(getRecord(data[0], id).f_gloss_60) : '0'}</td>)}
              </tr>
              <tr>
                <td>GLOSS 85°</td><td>GU</td><td>ASTM D-2457</td>
                {lpIds.map(id => <td key={id}>{getRecord(data[0], id) ? fmt(getRecord(data[0], id).f_gloss_84) : '0'}</td>)}
              </tr>
              
              {/* Note: Legacy implementation has massive Mechanical testing parsing (50+ rows mapping avg_vlu.split). 
                  For MVP structural migration, we render the Barrier testing as an example of horizontal pivot.
                  Full data mapping can be expanded here based on actual API payload shapes. */}

              {/* --- BARRIER TESTINGS --- */}
              <tr>
                <td colSpan={3 + lpIds.length} style={{ background: 'var(--bg-tertiary)', fontWeight: 600, padding: '0.5rem 1rem' }}>BARRIER TESTINGS</td>
              </tr>
              <tr>
                <td colSpan={3} style={{ fontWeight: 600 }}>DOT</td>
                {lpIds.map(id => <td key={id}>{getRecord(data[2], id)?.d_bt_dot ? new Date(getRecord(data[2], id).d_bt_dot).toLocaleDateString() : '0'}</td>)}
              </tr>
              <tr>
                <th className={cniStyles.cniTh}>NAME OF TEST</th>
                <th className={cniStyles.cniTh}>STANDARD</th>
                <th className={cniStyles.cniTh}>CONDITION</th>
                <th className={cniStyles.cniTh} colSpan={lpIds.length} style={{ textAlign: 'center' }}>TEST RESULTS</th>
              </tr>
              <tr>
                <td>WVTR</td><td>ASTM F 1249-13</td><td>38 deg C and 90 % RH</td>
                {lpIds.map(id => <td key={id}>{getRecord(data[2], id) ? `${fmt(getRecord(data[2], id).s_wvtr_transmission_rate)} g/m2-day` : '0 g/m2-day'}</td>)}
              </tr>
              <tr>
                <td>OTR</td><td>ASTM D-3985-17</td><td>23 deg C and 0 % RH</td>
                {lpIds.map(id => <td key={id}>{getRecord(data[2], id) ? `${fmt(getRecord(data[2], id).s_otr_transmission_rate_1)} cc/m2-day` : '0 cc/m2-day'}</td>)}
              </tr>
              <tr>
                <td>OTR</td><td>ASTM D-3985-27</td><td>23 deg C and 0 % RH</td>
                {lpIds.map(id => <td key={id}>{getRecord(data[2], id) ? `${fmt(getRecord(data[2], id).s_otr_transmission_rate_2)} cc/m2-day` : '0 cc/m2-day'}</td>)}
              </tr>

            </tbody>
          ) : (
            <tbody>
              <tr>
                <td colSpan={3 + lpIds.length} style={{ background: 'var(--bg-tertiary)', fontWeight: 600, padding: '0.5rem 1rem' }}>RM MATERIAL TESTING</td>
              </tr>
              {/* RM Logic mapping */}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}
