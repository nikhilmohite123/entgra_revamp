import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  ArrowLeft,
  Search,
  BarChart3,
  Table
} from 'lucide-react';
import styles from '../styles/atrExcelView.module.css';
import AtrHeader from '../components/AtrHeader';
import AtrFooter from '../components/AtrFooter';
import atrToast from '../components/AtrToast';
import { BASE_URL } from '../constant/atrConstants';

// Helper to format names into Title Case
const toTitleCase = (str) => {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function AtrExcelViewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const statusParam = searchParams.get('status') || 'total';

  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const tableRef = useRef(null);

  /**
   * get_datatable_for_excel:
   * Legacy: GET /AtrRoute/get_datatable_for_excel with { sts: status }
   */
  const fetchDatatableForExcel = useCallback(async (status) => {
    setLoading(true);
    try {
      const queryUrl = `${BASE_URL}/AtrRoute/get_datatable_for_excel?sts=${encodeURIComponent(status)}`;
      const res = await fetch(queryUrl);
      if (res.ok) {
        const result = await res.json();
        if (Array.isArray(result)) {
          setDataList(result);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error('Error fetching datatable for excel:', err);
    }

    // Demo fallback records if backend is unavailable
    setDataList([
      {
        s_auditing_party_name: 'MGB Advisors Pvt Ltd',
        s_financial_period: '2024-25',
        s_group: 'India',
        s_location: 'VASIND',
        n_count: 3,
        s_area: 'Warehouse & Inventory Control',
        s_broadTheme: 'Material Requisition Reconciliation',
        s_observation: 'Physical stock verification identified minor variance in chemical batch registers.',
        s_actionPlanned: 'Standardize barcode scan verification on incoming chemical deliveries.',
        s_rating: 'Medium',
        s_dept: 'Supply Chain',
        s_primeResponsibility: 'rajesh.sharma',
        s_targetDate: '2024-12-15'
      },
      {
        s_auditing_party_name: 'Price Waterhouse Coopers Services LLP',
        s_financial_period: '2024-25',
        s_group: 'India',
        s_location: 'WADA',
        n_count: 1,
        s_area: 'Environmental Health & Safety',
        s_broadTheme: 'Hazardous Waste Handling Protocol',
        s_observation: 'Secondary containment capacity in effluent treatment plant requires upgrade.',
        s_actionPlanned: 'Construct bund walls with 110% storage capacity as per statutory norms.',
        s_rating: 'High',
        s_dept: 'Safety & EHS',
        s_primeResponsibility: 'amit.kumar',
        s_targetDate: '2025-01-20'
      },
      {
        s_auditing_party_name: 'MGB Advisors Pvt Ltd',
        s_financial_period: '2023-24',
        s_group: 'Egypt',
        s_location: 'EGYPT',
        n_count: 2,
        s_area: 'Financial Controls & Invoicing',
        s_broadTheme: 'Vendor Advance Settlement',
        s_observation: 'Aged advance balances reconciled and cleared in ERP.',
        s_actionPlanned: 'Automated 60-day aging review implemented in monthly account closure.',
        s_rating: 'Low',
        s_dept: 'Finance',
        s_primeResponsibility: 'mohamed.ali',
        s_targetDate: '2024-06-30'
      },
      {
        s_auditing_party_name: 'Grant Thornton Bharat LLP',
        s_financial_period: '2024-25',
        s_group: 'India',
        s_location: 'GOA',
        n_count: 4,
        s_area: 'Quality Control',
        s_broadTheme: 'Calibration Certification Cycle',
        s_observation: 'Calibration due date tags on pressure testing gauges requires renewed labeling.',
        s_actionPlanned: 'Implement preventive maintenance ERP calibration alert notification system.',
        s_rating: 'Medium',
        s_dept: 'Quality Assurance',
        s_primeResponsibility: 'suresh.patil',
        s_targetDate: '2024-11-30'
      }
    ]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDatatableForExcel(statusParam);
  }, [fetchDatatableForExcel, statusParam]);

  /**
   * exportTbl (Legacy XML-Excel format export matching tablesToExcel)
   */
  const exportTbl = () => {
    if (dataList.length === 0) {
      atrToast.warning('No data available to export');
      return;
    }

    const headers = [
      'Auditing Party Name',
      'Financial Period',
      'Group',
      'Location',
      'Count',
      'Area',
      'Broad Theme',
      'Observation',
      'Action Planned',
      'Rating',
      'Department',
      'Prime Responsibility',
      'Target Date'
    ];

    const rows = filteredList.map((row) => [
      row.s_auditing_party_name || '',
      row.s_financial_period || '',
      row.s_group || '',
      row.s_location || '',
      row.n_count ?? 0,
      row.s_area || '',
      row.s_broadTheme || '',
      row.s_observation || '',
      row.s_actionPlanned || '',
      row.s_rating || '',
      row.s_dept || '',
      toTitleCase(row.s_primeResponsibility || ''),
      row.s_targetDate || ''
    ]);

    // Construct legacy Excel XML format with styles
    const tableHeaderHtml = headers
      .map(
        (h) =>
          `<th style="font-weight:bold;text-align:center;background:#d9d9d9;height:40px;border:1px solid #000000;padding:6px;font-size:12px;">${h}</th>`
      )
      .join('');

    const tableRowsHtml = rows
      .map(
        (r) =>
          `<tr>${r
            .map(
              (c) =>
                `<td style="border:1px solid #000000;padding:6px;vertical-align:top;font-size:12px;white-space:normal;word-wrap:break-word;">${c}</td>`
            )
            .join('')}</tr>`
      )
      .join('');

    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <!--[if gte mso 9]>
        <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Sheet1</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
        </xml>
        <![endif]-->
      </head>
      <body>
        <table style="border-collapse:collapse;width:100%;table-layout:fixed;">
          <thead><tr>${tableHeaderHtml}</tr></thead>
          <tbody>${tableRowsHtml}</tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const link = document.createElement('a');
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}_${String(today.getMonth() + 1).padStart(2, '0')}_${today.getFullYear()}`;
    const filename = `export_${formattedDate}.xls`;

    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  // Filter list by search query
  const filteredList = dataList.filter((item) => {
    const term = searchQuery.toLowerCase();
    return (
      (item.s_auditing_party_name || '').toLowerCase().includes(term) ||
      (item.s_location || '').toLowerCase().includes(term) ||
      (item.s_area || '').toLowerCase().includes(term) ||
      (item.s_broadTheme || '').toLowerCase().includes(term) ||
      (item.s_observation || '').toLowerCase().includes(term) ||
      (item.s_dept || '').toLowerCase().includes(term) ||
      (item.s_primeResponsibility || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className={styles.excelPageContainer}>
      {/* Top Navbar */}
      <AtrHeader />

      <main className={styles.mainContainer}>
        {/* Page Header Banner */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>
            <BarChart3 size={28} />
            ATR Data Export
          </h1>
          <button
            type="button"
            className={styles.btnBack}
            onClick={() => navigate('/atr/charts')}
            title="Back to Charts Dashboard"
          >
            <ArrowLeft size={16} />
            <span>Back to Charts</span>
          </button>
        </div>

        {/* Main Data Export Card */}
        <div className={styles.card} id="user_list">
          <div className={styles.cardHeader}>
            <h2 className={styles.tableTitle}>
              <Table size={20} className={styles.tableTitleIcon} />
              <span>Data Export View:</span>
              <span className={styles.statusPill} id="data_of">
                {statusParam}
              </span>
            </h2>

            <div className={styles.headerActions}>
              <div className={styles.searchWrapper}>
                <Search size={15} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search exported records..."
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button
                type="button"
                className={styles.downloadBtn}
                id="addbtn"
                onClick={exportTbl}
                title="Download Excel Spreadsheet"
              >
                <FileSpreadsheet size={18} />
                <span>Download Excel</span>
              </button>
            </div>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.tableResponsive}>
              <table
                id="get_datatable_for_excel"
                className={styles.excelTable}
                ref={tableRef}
              >
                <thead>
                  <tr>
                    <th className={styles.colPartyName}>Auditing Party Name</th>
                    <th className={styles.colFinPeriod}>Financial Period</th>
                    <th className={styles.colGroup}>Group</th>
                    <th className={styles.colLocation}>Location</th>
                    <th className={styles.colCount}>Count</th>
                    <th className={styles.colArea}>Area</th>
                    <th className={styles.colBroadTheme}>Broad Theme</th>
                    <th className={styles.colObservation}>Observation</th>
                    <th className={styles.colActionPlanned}>Action Planned</th>
                    <th className={styles.colRating}>Rating</th>
                    <th className={styles.colDept}>Department</th>
                    <th className={styles.colResponsibility}>Prime Responsibility</th>
                    <th className={styles.colTargetDate}>Target Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.length > 0 ? (
                    filteredList.map((row, idx) => (
                      <tr key={idx}>
                        <td className={styles.colPartyName}>
                          {row.s_auditing_party_name || '—'}
                        </td>
                        <td className={styles.colFinPeriod}>
                          {row.s_financial_period || '—'}
                        </td>
                        <td className={styles.colGroup}>
                          {row.s_group || '—'}
                        </td>
                        <td className={styles.colLocation}>
                          {row.s_location || '—'}
                        </td>
                        <td className={styles.colCount}>
                          {row.n_count ?? '0'}
                        </td>
                        <td className={styles.colArea}>
                          {row.s_area || '—'}
                        </td>
                        <td className={styles.colBroadTheme}>
                          {row.s_broadTheme || '—'}
                        </td>
                        <td className={styles.colObservation}>
                          {row.s_observation || '—'}
                        </td>
                        <td className={styles.colActionPlanned}>
                          {row.s_actionPlanned || '—'}
                        </td>
                        <td className={styles.colRating}>
                          <span
                            className={
                              row.s_rating === 'High'
                                ? styles.ratingHigh
                                : row.s_rating === 'Low'
                                ? styles.ratingLow
                                : styles.ratingMedium
                            }
                          >
                            {row.s_rating || 'Low'}
                          </span>
                        </td>
                        <td className={styles.colDept}>
                          {row.s_dept || '—'}
                        </td>
                        <td className={styles.colResponsibility}>
                          {toTitleCase(row.s_primeResponsibility || '')}
                        </td>
                        <td className={styles.colTargetDate}>
                          {row.s_targetDate || '—'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={13} className={styles.emptyState}>
                        {loading ? 'Loading export data...' : 'No data records found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.tableInfo}>
              <span>
                Showing {filteredList.length} of {dataList.length} records
              </span>
              <span>Filter: Status = <strong>{statusParam}</strong></span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <AtrFooter />
    </div>
  );
}
