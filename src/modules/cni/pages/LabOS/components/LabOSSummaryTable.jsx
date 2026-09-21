import React from 'react';
import { CniLoader } from '../../../components/common';
import cniStyles from '../../../styles/cni-premium.module.css';

export function LabOSSummaryTable({ data, isLoading, isError }) {
  if (isLoading) {
    return (
      <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}>
        <CniLoader />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--danger)', fontWeight: 600 }}>
        Failed to load summary data. Please try again.
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No records found.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', paddingBottom: '1rem' }}>
      <table id="tblData" className={cniStyles.cniTable} style={{ minWidth: '1500px' }}>
        <thead>
          <tr>
            <th className={cniStyles.cniTh} style={{ background: '#f8fafc', padding: '1rem', borderBottom: '2px solid var(--border-glass)', whiteSpace: 'nowrap' }}>Serial No</th>
            <th className={cniStyles.cniTh} style={{ background: '#f8fafc', padding: '1rem', borderBottom: '2px solid var(--border-glass)', whiteSpace: 'nowrap' }}>Material Code</th>
            <th className={cniStyles.cniTh} style={{ background: '#f8fafc', padding: '1rem', borderBottom: '2px solid var(--border-glass)', whiteSpace: 'nowrap' }}>Sample_type</th>
            <th className={cniStyles.cniTh} style={{ background: '#f8fafc', padding: '1rem', borderBottom: '2px solid var(--border-glass)', whiteSpace: 'nowrap' }}>Remark</th>
            <th className={cniStyles.cniTh} style={{ background: '#f8fafc', padding: '1rem', borderBottom: '2px solid var(--border-glass)', whiteSpace: 'nowrap' }}>Created_by</th>
            <th className={cniStyles.cniTh} style={{ background: '#f8fafc', padding: '1rem', borderBottom: '2px solid var(--border-glass)', whiteSpace: 'nowrap' }}>Created_date</th>
            <th className={cniStyles.cniTh} style={{ background: '#f8fafc', padding: '1rem', borderBottom: '2px solid var(--border-glass)', whiteSpace: 'nowrap' }}>Lable_Sample_id</th>
            <th className={cniStyles.cniTh} style={{ background: '#f8fafc', padding: '1rem', borderBottom: '2px solid var(--border-glass)', whiteSpace: 'nowrap' }}>Optical Test_Status</th>
            <th className={cniStyles.cniTh} style={{ background: '#f8fafc', padding: '1rem', borderBottom: '2px solid var(--border-glass)', whiteSpace: 'nowrap' }}>Mechanical Test_Status</th>
            <th className={cniStyles.cniTh} style={{ background: '#f8fafc', padding: '1rem', borderBottom: '2px solid var(--border-glass)', whiteSpace: 'nowrap' }}>Barrier Test_Status</th>
            <th className={cniStyles.cniTh} style={{ background: '#f8fafc', padding: '1rem', borderBottom: '2px solid var(--border-glass)', whiteSpace: 'nowrap' }}>CB Test_Status</th>
            <th className={cniStyles.cniTh} style={{ background: '#f8fafc', padding: '1rem', borderBottom: '2px solid var(--border-glass)', whiteSpace: 'nowrap' }}>Characterization Test_Status</th>
            <th className={cniStyles.cniTh} style={{ background: '#f8fafc', padding: '1rem', borderBottom: '2px solid var(--border-glass)', whiteSpace: 'nowrap' }}>Sealing Properties_Status</th>
            <th className={cniStyles.cniTh} style={{ background: '#f8fafc', padding: '1rem', borderBottom: '2px solid var(--border-glass)', whiteSpace: 'nowrap' }}>RM_Material_Status</th>
            <th className={cniStyles.cniTh} style={{ background: '#f8fafc', padding: '1rem', borderBottom: '2px solid var(--border-glass)', whiteSpace: 'nowrap' }}>Approver</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} style={{ borderBottom: '1px solid var(--border-glass)' }}>
              <td className={cniStyles.cniTd}>{index + 1}</td>
              <td className={cniStyles.cniTd}>{row.Mterial_code}</td>
              <td className={cniStyles.cniTd}>{row.sample_type}</td>
              <td className={cniStyles.cniTd}>{row.Reamrk}</td>
              <td className={cniStyles.cniTd}>{row.created_by}</td>
              <td className={cniStyles.cniTd}>{row.created_date}</td>
              <td className={cniStyles.cniTd}>{row.Lab_Sample_Id}</td>
              <td className={cniStyles.cniTd}>
                {row.OT_STATUS} {row.Approver_ot_Remark ? `Approver Remark-${row.Approver_ot_Remark}` : ''}
              </td>
              <td className={cniStyles.cniTd}>
                {row.MT_STATUS} {row.Approver_mt_Remark ? `Approver Remark-${row.Approver_mt_Remark}` : ''}
              </td>
              <td className={cniStyles.cniTd}>
                {row.BT_STATUS} {row.Approver_bt_Remark ? `Approver Remark-${row.Approver_bt_Remark}` : ''}
              </td>
              <td className={cniStyles.cniTd}>
                {row.CBT_STATUS} {row.Approver_cbt_Remark ? `Approver Remark-${row.Approver_cbt_Remark}` : ''}
              </td>
              <td className={cniStyles.cniTd}>
                {row.CT_STATUS} {row.Approver_ct_Remark ? `Approver Remark-${row.Approver_ct_Remark}` : ''}
              </td>
              <td className={cniStyles.cniTd}>
                {row.SP_STATUS} {row.Approver_sp_Remark ? `Approver Remark-${row.Approver_sp_Remark}` : ''}
              </td>
              <td className={cniStyles.cniTd}>
                {row.RM_STATUS} {row.Approver_rm_Remark ? `Approver Remark-${row.Approver_rm_Remark}` : ''}
              </td>
              <td className={cniStyles.cniTd}>{row.approver}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
