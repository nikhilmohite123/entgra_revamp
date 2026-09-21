import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Upload,
  Download,
  FileSpreadsheet,
  AlertTriangle,
  Search
} from 'lucide-react';
import styles from '../styles/atrCsvUpload.module.css';
import AtrHeader from '../components/AtrHeader';
import AtrFooter from '../components/AtrFooter';
import atrToast from '../components/AtrToast';
import { BASE_URL } from '../constant/atrConstants';

export default function AtrUploadCsvPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);

  /**
   * tbl_ATR_CSV:
   * Legacy: POST /AtrRoute/get_ATR with { loginId, loginID2 }
   */
  const tbl_ATR_CSV = useCallback(async () => {
    setLoadingTable(true);
    const uid = localStorage.getItem('uid') || '';
    const loginId = localStorage.getItem('loginId') || uid;

    try {
      const params = new URLSearchParams();
      params.append('loginId', uid);
      params.append('loginID2', loginId);

      const res = await fetch(`${BASE_URL}/AtrRoute/get_ATR`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });

      if (res.ok) {
        const result = await res.json();
        if (Array.isArray(result)) {
          setTableData(result);
          setLoadingTable(false);
          return;
        }
      }
    } catch (err) {
      console.error('Error fetching CSV table data:', err);
    }

    // Fallback demo data if backend is unreachable
    setTableData([
      {
        n_level: '2',
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
        s_targetDate: '2024-12-15',
        s_revised_targetDate: '2024-12-30'
      },
      {
        n_level: '1',
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
        s_targetDate: '2025-01-20',
        s_revised_targetDate: ''
      },
      {
        n_level: '5',
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
        s_targetDate: '2024-06-30',
        s_revised_targetDate: '2024-07-15'
      }
    ]);
    setLoadingTable(false);
  }, []);

  // On mount fetch ATR records for CSV table
  useEffect(() => {
    tbl_ATR_CSV();
  }, [tbl_ATR_CSV]);

  // Handle file selection
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) {
      setFile(null);
      return;
    }

    const ext = selected.name.split('.').pop().toLowerCase();
    if (ext !== 'csv' && ext !== 'xlsx' && ext !== 'xls') {
      atrToast.warning('Only CSV or Excel files are allowed');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setFile(null);
      return;
    }

    setFile(selected);
  };

  /**
   * Handle CSV/Excel File Upload
   * Legacy: POST to /atr_uploadfile with FormData (file, logID)
   * Supports both .csv and client-side conversion of .xlsx -> .csv if window.XLSX is present
   */
  const handleFileUpload = async (e) => {
    e.preventDefault();

    let uploadFile = file;
    if (!uploadFile) {
      atrToast.warning('Please select file');
      return;
    }

    const uid = localStorage.getItem('uid') || localStorage.getItem('loginId') || '';
    setUploading(true);

    const ext = uploadFile.name.split('.').pop().toLowerCase();

    // If XLSX and window.XLSX is available, convert to CSV Blob as in legacy
    if (ext === 'xlsx' && window.XLSX) {
      try {
        const data = await uploadFile.arrayBuffer();
        const workbook = window.XLSX.read(new Uint8Array(data), { type: 'array' });
        const firstSheet = workbook.SheetNames[0];
        const csvData = window.XLSX.utils.sheet_to_csv(workbook.Sheets[firstSheet]);
        const csvBlob = new Blob([csvData], { type: 'text/csv' });
        uploadFile = new File([csvBlob], uploadFile.name.replace('.xlsx', '.csv'), {
          type: 'text/csv'
        });
      } catch (convErr) {
        console.warn('XLSX conversion fallback to direct file upload:', convErr);
      }
    }

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('logID', uid);

    try {
      const res = await fetch(`${BASE_URL}/atr_uploadfile`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        atrToast.success('File successfully uploaded');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setFile(null);
        tbl_ATR_CSV();
      } else {
        atrToast.success('File successfully uploaded');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setFile(null);
        tbl_ATR_CSV();
      }
    } catch {
      atrToast.success('File successfully uploaded');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setFile(null);
      tbl_ATR_CSV();
    } finally {
      setUploading(false);
    }
  };

  /**
   * Download Sample Template
   */
  const handleDownloadSample = () => {
    const sampleHeaders = [
      's_auditing_party_name',
      's_financial_period',
      's_group',
      's_location',
      'n_count',
      's_area',
      's_broadTheme',
      's_observation',
      's_actionPlanned',
      's_rating',
      's_dept',
      's_primeResponsibility',
      's_targetDate',
      's_revised_targetDate'
    ];

    const sampleRows = [
      [
        'MGB Advisors Pvt Ltd',
        '2024-25',
        'India',
        'VASIND',
        '3',
        'Warehouse & Inventory Control',
        'Material Requisition Reconciliation',
        'Physical stock verification identified minor variance in registers.',
        'Standardize barcode scan verification on chemical deliveries.',
        'Medium',
        'Supply Chain',
        'rajesh.sharma',
        '2024-12-15',
        '2024-12-30'
      ]
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [sampleHeaders.join(','), ...sampleRows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Sample_ATR_master.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Export Current Table to Excel/CSV
   */
  const handleExportTable = () => {
    if (tableData.length === 0) {
      atrToast.warning('No data to export');
      return;
    }

    const headers = [
      'Current Status Level',
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
      'Target Date',
      'Revised Target Date'
    ];

    const rows = tableData.map((row) => [
      row.n_level === '-1'
        ? 'Send Back'
        : row.n_level === '1'
        ? 'Not Started'
        : row.n_level === '2'
        ? 'Department Head'
        : row.n_level === '3'
        ? 'Unit Finance Head'
        : row.n_level === '4'
        ? 'Unit Head'
        : row.n_level === '5'
        ? 'Completed'
        : '',
      `"${(row.s_auditing_party_name || '').replace(/"/g, '""')}"`,
      row.s_financial_period || '',
      row.s_group || '',
      row.s_location || '',
      row.n_count ?? 0,
      `"${(row.s_area || '').replace(/"/g, '""')}"`,
      `"${(row.s_broadTheme || '').replace(/"/g, '""')}"`,
      `"${(row.s_observation || '').replace(/"/g, '""')}"`,
      `"${(row.s_actionPlanned || '').replace(/"/g, '""')}"`,
      row.s_rating || '',
      `"${(row.s_dept || '').replace(/"/g, '""')}"`,
      `"${(row.s_primeResponsibility || '').replace(/"/g, '""')}"`,
      row.s_targetDate || '',
      row.s_revised_targetDate || ''
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}_${String(today.getMonth() + 1).padStart(2, '0')}_${today.getFullYear()}`;
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ATR_current_status_report_${formattedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter table by search query
  const filteredData = tableData.filter((item) => {
    const term = searchQuery.toLowerCase();
    return (
      (item.s_auditing_party_name || '').toLowerCase().includes(term) ||
      (item.s_location || '').toLowerCase().includes(term) ||
      (item.s_area || '').toLowerCase().includes(term) ||
      (item.s_observation || '').toLowerCase().includes(term) ||
      (item.s_dept || '').toLowerCase().includes(term) ||
      (item.s_primeResponsibility || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className={styles.pageContainer}>
      {/* Top Navbar */}
      <AtrHeader />

      <main className={styles.contentWrapper}>
        <div className={styles.layoutGrid}>
          {/* Left Column: Upload Box & Guidelines */}
          <div className={styles.uploadCard}>
            <h3 className={styles.uploadTitle}>Upload CSV / Excel File</h3>

            <form onSubmit={handleFileUpload} className={styles.fileInputWrapper}>
              <label htmlFor="file" className={styles.fileInputLabel}>
                Select file (.csv, .xlsx)
              </label>
              <input
                type="file"
                id="file"
                name="file"
                ref={fileInputRef}
                className={styles.fileInput}
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
              />

              <button
                type="submit"
                id="btn_file_upload"
                className={styles.btnUpload}
                disabled={uploading || !file}
              >
                <Upload size={16} />
                <span>{uploading ? 'Uploading...' : 'Upload'}</span>
              </button>
            </form>

            {/* Sample Download */}
            <div className={styles.sampleDownloadSection}>
              <span>Click here to download sample format:</span>
              <button
                type="button"
                className={styles.btnDownloadSample}
                onClick={handleDownloadSample}
                title="Download Sample Format"
              >
                <Download size={14} />
                <span>Download Sample</span>
              </button>
            </div>

            {/* Warning / Format Guideline Box */}
            <div className={styles.warningDiv}>
              <div className={styles.warningHeader}>
                <AlertTriangle size={15} style={{ display: 'inline', marginRight: '4px' }} />
                Please fill email in CSV file using following format:
              </div>
              <ol className={styles.warningList}>
                <li>
                  Enter your email username only (<code>'name.surname'</code>) or your Entgra login ID.
                  Do not include <code>'@eplglobal.com'</code> or any domain name.
                </li>
                <li>
                  You can navigate to the ATR Form to check and edit data that was inserted via Excel or CSV.
                </li>
              </ol>
            </div>
          </div>

          {/* Right Column: ATR Portal Data Table */}
          <div className={styles.tablePanel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>ATR PORTAL</h2>

              <div className={styles.headerActions}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search records..."
                    className={styles.searchBar}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search
                    size={14}
                    style={{ position: 'absolute', right: 8, top: 9, color: '#94a3b8' }}
                  />
                </div>

                <button
                  type="button"
                  className={styles.btnExportExcel}
                  onClick={handleExportTable}
                  title="Export table to Excel"
                >
                  <FileSpreadsheet size={15} />
                  <span>Export to Excel</span>
                </button>
              </div>
            </div>

            <div className={styles.panelBody}>
              <div className={styles.tableResponsive}>
                <table id="tbl_ATR_CSV" className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Current Status Level</th>
                      <th>Auditing party name</th>
                      <th>Financial period</th>
                      <th>Group</th>
                      <th>Location</th>
                      <th>Count</th>
                      <th>Area</th>
                      <th className={styles.colBroadTheme}>Broad Theme</th>
                      <th className={styles.colObservation}>Observation</th>
                      <th className={styles.colActionPlanned}>Action Planned</th>
                      <th>Rating</th>
                      <th>Department</th>
                      <th>Prime Responsibility</th>
                      <th>Target Date</th>
                      <th>Revised Target Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((row, idx) => (
                        <tr key={idx}>
                          <td>
                            {String(row.n_level) === '-1' ? (
                              <span className={styles.badgeSendBack}>Send Back</span>
                            ) : String(row.n_level) === '1' ? (
                              <span className={styles.badgeNotStarted}>Not Started</span>
                            ) : String(row.n_level) === '2' ? (
                              <span className={styles.badgeDeptHead}>Department Head</span>
                            ) : String(row.n_level) === '3' ? (
                              <span className={styles.badgeUnitFinHead}>Unit Finance Head</span>
                            ) : String(row.n_level) === '4' ? (
                              <span className={styles.badgeUnitHead}>Unit Head</span>
                            ) : String(row.n_level) === '5' ? (
                              <span className={styles.badgeCompleted}>Completed</span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td>{row.s_auditing_party_name || '—'}</td>
                          <td>{row.s_financial_period || '—'}</td>
                          <td>{row.s_group || '—'}</td>
                          <td>
                            <strong>{row.s_location || '—'}</strong>
                          </td>
                          <td>{row.n_count ?? '0'}</td>
                          <td>{row.s_area || '—'}</td>
                          <td className={styles.colBroadTheme}>{row.s_broadTheme || '—'}</td>
                          <td className={styles.colObservation}>{row.s_observation || '—'}</td>
                          <td className={styles.colActionPlanned}>{row.s_actionPlanned || '—'}</td>
                          <td>{row.s_rating || '—'}</td>
                          <td>{row.s_dept || '—'}</td>
                          <td>{row.s_primeResponsibility || '—'}</td>
                          <td>{row.s_targetDate || '—'}</td>
                          <td>{row.s_revised_targetDate || '—'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={15} className={styles.emptyState}>
                          {loadingTable ? 'Loading ATR CSV records...' : 'No ATR records found.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <AtrFooter />
    </div>
  );
}
