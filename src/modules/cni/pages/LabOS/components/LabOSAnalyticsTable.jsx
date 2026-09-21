import React from 'react';
import { CniLoader } from '../../../components/common';
import cniStyles from '../../../styles/cni-premium.module.css';

export function LabOSAnalyticsTable({ data, isLoading, isError }) {
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
        Failed to load analytics data. Please try again.
      </div>
    );
  }

  // Handle nested data structures (legacy API sometimes wraps in data.data or just returns an array)
  const reportData = Array.isArray(data) ? data : data?.data;

  if (!reportData || reportData.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No records found.
      </div>
    );
  }

  // The legacy system uses the keys of the first object to generate columns dynamically
  const columns = Object.keys(reportData[0]);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: '1rem' }}>
      <table className={cniStyles.cniTable} style={{ minWidth: '100%' }}>
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index} className={cniStyles.cniTh} style={{ background: '#f8fafc', padding: '1rem', borderBottom: '2px solid var(--border-glass)', whiteSpace: 'nowrap' }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reportData.map((row, rowIndex) => (
            <tr key={rowIndex} style={{ borderBottom: '1px solid var(--border-glass)' }}>
              {columns.map((col, colIndex) => {
                let cellValue = row[col];
                
                // If it's an object, try to render it safely or stringify
                if (typeof cellValue === 'object' && cellValue !== null) {
                  cellValue = JSON.stringify(cellValue);
                }
                
                return (
                  <td key={colIndex} className={cniStyles.cniTd}>
                    {cellValue !== null && cellValue !== undefined ? cellValue : '0'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
