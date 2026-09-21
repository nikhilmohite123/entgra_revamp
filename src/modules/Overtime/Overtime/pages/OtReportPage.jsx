import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileSpreadsheet,
  Copy,
  Check,
  Search,
  Calendar,
  Filter,
  ChevronDown,
  ChevronUp,
  Clock,
  Building,
  RefreshCw,
  FileText,
} from 'lucide-react';
import styles from '../styles/overtime.module.css';
import { BASE_URL, get12hrsformat } from '../constants/overtimeConstants';

// Helper to safely parse approval dates from semicolon-separated string
// Format: "hod=2023-01-01 10:00:00;unit_head=...;unit_hr=..."
function parseApprovalDate(details, index) {
  if (!details || typeof details !== 'string') return null;
  try {
    const parts = details.split(';');
    if (parts[index] !== undefined) {
      const eqParts = parts[index].split('=');
      if (eqParts[1]) {
        const datePart = eqParts[1].trim().split(' ')[0];
        return datePart || null;
      }
    }
  } catch (err) {
    console.error('Error parsing approval date:', err);
  }
  return null;
}

export default function OtReportPage() {
  const uid = localStorage.getItem('uid') || '';

  // Filter criteria
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userType, setUserType] = useState('');

  // OT Master data for employee details lookup
  const [otMasterList, setOtMasterList] = useState([]);
  const [loadingMaster, setLoadingMaster] = useState(false);

  // Main Report data
  const [reportList, setReportList] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Table controls
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [copied, setCopied] = useState(false);

  // Collapsible Plantwise OT Section
  const [isPlantwiseOpen, setIsPlantwiseOpen] = useState(false);
  const [unitList, setUnitList] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [plantwiseData, setPlantwiseData] = useState([]);
  const [loadingPlantwise, setLoadingPlantwise] = useState(false);

  // 1. Fetch user authorization / type
  const fetchAuth = useCallback(async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('uid', uid);

      const res = await fetch(`${BASE_URL}/otPro/getAuth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data[0]?.s_type) {
          setUserType(data[0].s_type);
          return data[0].s_type;
        }
      }
    } catch (err) {
      console.error('Error fetching auth:', err);
    }
    return '';
  }, [uid]);

  // 2. Fetch OT Master List for lookups
  const fetchOtMaster = useCallback(async () => {
    setLoadingMaster(true);
    try {
      const res = await fetch(`${BASE_URL}/otPro/get_otmaster`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setOtMasterList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching OT master:', err);
    } finally {
      setLoadingMaster(false);
    }
  }, []);

  // Quick lookup map for fast rendering: empCode -> employee details
  const otMasterMap = useMemo(() => {
    const map = new Map();
    for (const item of otMasterList) {
      if (item && item.n_emp_id !== undefined) {
        map.set(String(item.n_emp_id), item);
      }
    }
    return map;
  }, [otMasterList]);

  // 3. Fetch OT Report
  const fetchOtReport = useCallback(
    async (flag = 1, currentType = userType) => {
      if (flag === 1) {
        if (!startDate || !endDate) {
          alert('Please select Both Date.');
          return;
        }
      }

      setLoadingReport(true);
      try {
        const formData = new URLSearchParams();
        formData.append('uid', uid);
        formData.append('startDate', startDate);
        formData.append('endDate', endDate);
        formData.append('flag', String(flag));
        formData.append('type', currentType);

        const res = await fetch(`${BASE_URL}/otPro/ot_report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString(),
        });

        if (res.ok) {
          const data = await res.json();
          setReportList(Array.isArray(data) ? data : []);
          setHasSearched(true);
          setCurrentPage(1);
        } else {
          console.error('Failed to fetch OT report, status:', res.status);
        }
      } catch (err) {
        console.error('Error fetching OT report:', err);
      } finally {
        setLoadingReport(false);
      }
    },
    [uid, startDate, endDate, userType]
  );

  // Initial mount load
  useEffect(() => {
    fetchOtMaster();
    fetchAuth().then((type) => {
      // Fetch default records if available with flag 0
      fetchOtReport(0, type);
    });
  }, [fetchAuth, fetchOtMaster]);

  // 4. Plantwise section data
  const fetchLocations = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/global/getlocation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const filtered = data
            .filter((item) => item.S_REGION === 'AMESA')
            .map((item) => ({
              id: item.N_LOCATION_ID,
              name: item.S_LOCATION === 'ASSAM' ? 'GUWAHATI' : item.S_LOCATION,
            }));
          setUnitList(filtered);
        }
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  }, []);

  const fetchPlantwiseData = useCallback(async (unitId) => {
    if (!unitId) return;
    setLoadingPlantwise(true);
    try {
      const payload = {
        uid: localStorage.getItem('uid') || '',
        unit: unitId,
      };
      const res = await fetch(`${BASE_URL}/otPro/get_plantwisedata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setPlantwiseData(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching plantwise data:', err);
    } finally {
      setLoadingPlantwise(false);
    }
  }, []);

  useEffect(() => {
    if (isPlantwiseOpen && unitList.length === 0) {
      fetchLocations();
    }
  }, [isPlantwiseOpen, unitList.length, fetchLocations]);

  // Enrich rows with master details and parsed dates
  const enrichedRows = useMemo(() => {
    return reportList.map((row, index) => {
      const emp = otMasterMap.get(String(row.Employee_Code));
      const empName = emp?.s_emp_name || '--';
      const region = emp?.s_region || '--';
      const unit = emp?.s_plant_name || '--';
      const department = emp?.s_department || '--';

      const applyDate = row.d_created_date ? row.d_created_date.split(' ')[0] : '-';
      const claimedDate = row.ot_created_date || '-';
      const startTime = get12hrsformat(row.ot_from);
      const endTime = get12hrsformat(row.ot_to);

      const supervisorDate = parseApprovalDate(row.details, 0);
      const unitHeadDate = parseApprovalDate(row.details, 1);
      const hcManagerDate = parseApprovalDate(row.details, 2);

      return {
        ...row,
        srNo: index + 1,
        resolvedEmpName: empName,
        resolvedRegion: region,
        resolvedUnit: unit,
        resolvedDepartment: department,
        resolvedApplyDate: applyDate,
        resolvedClaimedDate: claimedDate,
        resolvedStartTime: startTime,
        resolvedEndTime: endTime,
        supervisorDate,
        unitHeadDate,
        hcManagerDate,
      };
    });
  }, [reportList, otMasterMap]);

  // Filtered rows based on search
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return enrichedRows;
    const q = searchQuery.toLowerCase().trim();
    return enrichedRows.filter((row) => {
      return (
        String(row.ot_id || '').toLowerCase().includes(q) ||
        String(row.Employee_Code || '').toLowerCase().includes(q) ||
        String(row.resolvedEmpName || '').toLowerCase().includes(q) ||
        String(row.resolvedRegion || '').toLowerCase().includes(q) ||
        String(row.resolvedUnit || '').toLowerCase().includes(q) ||
        String(row.resolvedDepartment || '').toLowerCase().includes(q) ||
        String(row.ot_created_by || '').toLowerCase().includes(q) ||
        String(row.resolvedApplyDate || '').toLowerCase().includes(q) ||
        String(row.resolvedClaimedDate || '').toLowerCase().includes(q) ||
        String(row.s_OT_reason || '').toLowerCase().includes(q) ||
        String(row.description || '').toLowerCase().includes(q)
      );
    });
  }, [enrichedRows, searchQuery]);

  // Paginated rows
  const paginatedRows = useMemo(() => {
    if (pageSize === -1) return filteredRows;
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRows.slice(startIndex, startIndex + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const totalPages = pageSize === -1 ? 1 : Math.max(1, Math.ceil(filteredRows.length / pageSize));

  // Export to Excel / CSV
  const handleExportCsv = () => {
    if (filteredRows.length === 0) {
      alert('No data available to export.');
      return;
    }

    const headers = [
      'Sr.No',
      'OT ID',
      'Employee Code',
      'Employee Name',
      'Region',
      'Unit',
      'Department',
      'OT Creation By',
      'Apply Date',
      'Claimed Date',
      'Start Time',
      'End Time',
      'OT Hours(In Min)',
      'Reason for Overtime',
      'Description',
      'Supervisor OT Approved Date',
      'Unit Head Approved Date',
      'HC Manager Approved Date',
    ];

    const csvRows = [headers.join(',')];

    filteredRows.forEach((row, i) => {
      const escapeCsv = (val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const line = [
        i + 1,
        escapeCsv(row.ot_id),
        escapeCsv(row.Employee_Code),
        escapeCsv(row.resolvedEmpName),
        escapeCsv(row.resolvedRegion),
        escapeCsv(row.resolvedUnit),
        escapeCsv(row.resolvedDepartment),
        escapeCsv(row.ot_created_by),
        escapeCsv(row.resolvedApplyDate),
        escapeCsv(row.resolvedClaimedDate),
        escapeCsv(row.resolvedStartTime),
        escapeCsv(row.resolvedEndTime),
        escapeCsv(row.OT_Hours),
        escapeCsv(row.s_OT_reason),
        escapeCsv(row.description),
        escapeCsv(row.supervisorDate || 'Pending'),
        escapeCsv(row.unitHeadDate || 'Pending'),
        escapeCsv(row.hcManagerDate || 'Pending'),
      ];

      csvRows.push(line.join(','));
    });

    const csvString = '\uFEFF' + csvRows.join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Overtime_Report_${startDate || 'all'}_to_${endDate || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy table to clipboard (TSV format)
  const handleCopyTable = async () => {
    if (filteredRows.length === 0) {
      alert('No data available to copy.');
      return;
    }

    const headers = [
      'Sr.No',
      'OT ID',
      'Employee Code',
      'Employee Name',
      'Region',
      'Unit',
      'Department',
      'OT Creation By',
      'Apply Date',
      'Claimed Date',
      'Start Time',
      'End Time',
      'OT Hours(In Min)',
      'Reason for Overtime',
      'Description',
      'Supervisor OT Approved Date',
      'Unit Head Approved Date',
      'HC Manager Approved Date',
    ];

    const lines = [headers.join('\t')];

    filteredRows.forEach((row, i) => {
      const line = [
        i + 1,
        row.ot_id || '',
        row.Employee_Code || '',
        row.resolvedEmpName || '',
        row.resolvedRegion || '',
        row.resolvedUnit || '',
        row.resolvedDepartment || '',
        row.ot_created_by || '',
        row.resolvedApplyDate || '',
        row.resolvedClaimedDate || '',
        row.resolvedStartTime || '',
        row.resolvedEndTime || '',
        row.OT_Hours || '',
        row.s_OT_reason || '',
        row.description || '',
        row.supervisorDate || 'Pending',
        row.unitHeadDate || 'Pending',
        row.hcManagerDate || 'Pending',
      ];
      lines.push(line.join('\t'));
    });

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text:', err);
      alert('Failed to copy to clipboard.');
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.titleArea}>
          <h1>
            <FileText size={26} color="#0284c7" />
            Overtime Report
          </h1>
          <p>Generate, filter, and export overtime requisitions and approval records</p>
        </div>

        <div className={styles.actionButtons}>
          <Link to="/overtime" className={`${styles.btnAction} ${styles.btnApply}`}>
            <ArrowLeft size={16} />
            Back to Overtime Portal
          </Link>
        </div>
      </div>

      {/* Main Filter & Report Panel */}
      <div className={styles.panelCard}>
        <div className={styles.panelHeader}>
          <div className={styles.panelHeaderTitle}>
            <Filter size={18} />
            Filter & Report Parameters
          </div>
          {loadingMaster && (
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              <RefreshCw size={12} className={styles.spin} style={{ marginRight: '4px' }} />
              Syncing employee master...
            </span>
          )}
        </div>

        <div className={styles.panelBody}>
          {/* Date Filter Controls */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              alignItems: 'flex-end',
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div className={styles.formGroup} style={{ margin: 0 }}>
              <label className={styles.formLabel}>
                <Calendar size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                Start Date
              </label>
              <input
                type="date"
                id="s_start_date"
                name="s_start_date"
                className={styles.formInput}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className={styles.formGroup} style={{ margin: 0 }}>
              <label className={styles.formLabel}>
                <Calendar size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                End Date
              </label>
              <input
                type="date"
                id="s_end_date"
                name="s_end_date"
                className={styles.formInput}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                id="btnshow"
                className={`${styles.btnAction} ${styles.btnApply}`}
                style={{ height: '38px', minWidth: '100px', justifyContent: 'center' }}
                onClick={() => fetchOtReport(1)}
                disabled={loadingReport}
              >
                {loadingReport ? (
                  <>
                    <RefreshCw size={14} className={styles.spin} />
                    Loading...
                  </>
                ) : (
                  <>
                    <Search size={14} />
                    Show
                  </>
                )}
              </button>

              {(startDate || endDate) && (
                <button
                  type="button"
                  className={`${styles.btnAction}`}
                  style={{ height: '38px', backgroundColor: '#e2e8f0', color: '#334155' }}
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    fetchOtReport(0);
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Table Toolbar: Search, Rows Per Page, Export & Copy */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`${styles.btnAction} ${styles.btnReport}`}
                onClick={handleExportCsv}
                disabled={filteredRows.length === 0}
                title="Export filtered records to CSV"
              >
                <FileSpreadsheet size={15} />
                Excel / CSV
              </button>

              <button
                type="button"
                className={`${styles.btnAction}`}
                style={{
                  backgroundColor: copied ? '#10b981' : '#f1f5f9',
                  color: copied ? '#ffffff' : '#334155',
                  border: '1px solid #cbd5e1',
                }}
                onClick={handleCopyTable}
                disabled={filteredRows.length === 0}
                title="Copy table data to clipboard"
              >
                {copied ? (
                  <>
                    <Check size={15} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={15} />
                    Copy
                  </>
                )}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569' }}>
                <span>Show</span>
                <select
                  className={styles.formInput}
                  style={{ width: 'auto', padding: '4px 8px', height: '32px' }}
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={-1}>All</option>
                </select>
                <span>entries</span>
              </div>
            </div>

            <div style={{ position: 'relative', minWidth: '260px' }}>
              <Search
                size={16}
                color="#94a3b8"
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                className={styles.formInput}
                style={{ paddingLeft: '32px', height: '36px' }}
                placeholder="Search report..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Overtime Report Table */}
          <div className={styles.tableResponsive} style={{ overflowX: 'auto', minHeight: '260px' }}>
            <table className={styles.dataTable} id="OT_report">
              <thead>
                <tr>
                  <th style={{ minWidth: '50px' }}>Sr.No</th>
                  <th style={{ minWidth: '80px' }}>OT ID</th>
                  <th style={{ minWidth: '110px' }}>Employee Code</th>
                  <th style={{ minWidth: '150px' }}>Employee Name</th>
                  <th style={{ minWidth: '100px' }}>Region</th>
                  <th style={{ minWidth: '110px' }}>Unit</th>
                  <th style={{ minWidth: '120px' }}>Department</th>
                  <th style={{ minWidth: '120px' }}>OT Creation By</th>
                  <th style={{ minWidth: '100px' }}>Apply Date</th>
                  <th style={{ minWidth: '100px' }}>Claimed Date</th>
                  <th style={{ minWidth: '95px' }}>Start Time</th>
                  <th style={{ minWidth: '95px' }}>End Time</th>
                  <th style={{ minWidth: '110px' }}>OT Hours (In Min)</th>
                  <th style={{ minWidth: '140px' }}>Reason for Overtime</th>
                  <th style={{ minWidth: '160px' }}>Description</th>
                  <th style={{ minWidth: '140px' }}>Supervisor Approved</th>
                  <th style={{ minWidth: '140px' }}>Unit Head Approved</th>
                  <th style={{ minWidth: '140px' }}>HC Manager Approved</th>
                </tr>
              </thead>
              <tbody>
                {loadingReport ? (
                  <tr>
                    <td colSpan={18} style={{ textAlign: 'center', padding: '36px 0', color: '#64748b' }}>
                      <RefreshCw size={24} className={styles.spin} style={{ marginBottom: '8px' }} />
                      <div>Loading Overtime Report Data...</div>
                    </td>
                  </tr>
                ) : paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={18} style={{ textAlign: 'center', padding: '36px 0', color: '#64748b' }}>
                      {hasSearched
                        ? 'No overtime records found matching the criteria.'
                        : 'Please select Start Date & End Date, then click "Show" to generate the report.'}
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row, idx) => {
                    const rowNumber = pageSize === -1 ? idx + 1 : (currentPage - 1) * pageSize + idx + 1;
                    return (
                      <tr key={row.ot_id || idx}>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{rowNumber}</td>
                        <td style={{ fontWeight: 600, color: '#0369a1' }}>{row.ot_id}</td>
                        <td>{row.Employee_Code}</td>
                        <td style={{ fontWeight: 500 }}>{row.resolvedEmpName}</td>
                        <td>{row.resolvedRegion}</td>
                        <td>{row.resolvedUnit}</td>
                        <td>{row.resolvedDepartment}</td>
                        <td>{row.ot_created_by}</td>
                        <td>{row.resolvedApplyDate}</td>
                        <td>{row.resolvedClaimedDate}</td>
                        <td>{row.resolvedStartTime}</td>
                        <td>{row.resolvedEndTime}</td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{row.OT_Hours}</td>
                        <td>{row.s_OT_reason}</td>
                        <td title={row.description} style={{ maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {row.description || '-'}
                        </td>
                        <td>
                          {row.supervisorDate ? (
                            <span style={{ color: '#0f766e', fontWeight: 500 }}>{row.supervisorDate}</span>
                          ) : (
                            <span style={{ color: '#e11d48', fontWeight: 600 }}>Pending</span>
                          )}
                        </td>
                        <td>
                          {row.unitHeadDate ? (
                            <span style={{ color: '#0f766e', fontWeight: 500 }}>{row.unitHeadDate}</span>
                          ) : (
                            <span style={{ color: '#e11d48', fontWeight: 600 }}>Pending</span>
                          )}
                        </td>
                        <td>
                          {row.hcManagerDate ? (
                            <span style={{ color: '#0f766e', fontWeight: 500 }}>{row.hcManagerDate}</span>
                          ) : (
                            <span style={{ color: '#e11d48', fontWeight: 600 }}>Pending</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredRows.length > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '16px',
                flexWrap: 'wrap',
                gap: '10px',
                fontSize: '13px',
                color: '#64748b',
              }}
            >
              <div>
                Showing {pageSize === -1 ? 1 : Math.min((currentPage - 1) * pageSize + 1, filteredRows.length)} to{' '}
                {pageSize === -1 ? filteredRows.length : Math.min(currentPage * pageSize, filteredRows.length)} of{' '}
                {filteredRows.length} entries
              </div>

              {pageSize !== -1 && totalPages > 1 && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className={styles.btnAction}
                    style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#f1f5f9', color: '#1e293b' }}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>

                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0 12px',
                      fontWeight: 600,
                      color: '#0f172a',
                    }}
                  >
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    className={styles.btnAction}
                    style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#f1f5f9', color: '#1e293b' }}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Optional Collapsible Panel: Plantwise OT Report Data */}
      <div className={styles.panelCard} style={{ marginTop: '24px' }}>
        <div
          className={styles.panelHeader}
          onClick={() => setIsPlantwiseOpen(!isPlantwiseOpen)}
          style={{ cursor: 'pointer' }}
        >
          <div className={styles.panelHeaderTitle}>
            <Building size={18} />
            Plantwise OT Report Summary
          </div>
          <div>{isPlantwiseOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
        </div>

        {isPlantwiseOpen && (
          <div className={styles.panelBody}>
            <div style={{ maxWidth: '320px', marginBottom: '16px' }}>
              <label className={styles.formLabel}>Unit Name</label>
              <select
                className={styles.formInput}
                value={selectedUnit}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedUnit(val);
                  fetchPlantwiseData(val);
                }}
              >
                <option value="">-- Select Location --</option>
                {unitList.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.tableResponsive} style={{ overflowX: 'auto' }}>
              <table className={styles.dataTable} id="plantwise_data">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Unit</th>
                    <th>Department</th>
                    <th>Year</th>
                    <th>Month</th>
                    <th>OT Used (In min)</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPlantwise ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                        <RefreshCw size={20} className={styles.spin} style={{ marginBottom: '6px' }} />
                        <div>Loading Plantwise Data...</div>
                      </td>
                    </tr>
                  ) : plantwiseData.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                        {selectedUnit
                          ? 'No plantwise OT data found for this unit.'
                          : 'Please select a unit to view plantwise overtime data.'}
                      </td>
                    </tr>
                  ) : (
                    plantwiseData.map((pRow, pIdx) => (
                      <tr key={pIdx}>
                        <td>{pRow.n_emp_id}</td>
                        <td>{pRow.location === 'ASSAM' ? 'GUWAHATI' : pRow.location}</td>
                        <td>{pRow.s_department}</td>
                        <td>{pRow.s_year}</td>
                        <td>{pRow.s_month}</td>
                        <td style={{ fontWeight: 600, color: '#0369a1' }}>{pRow.ot_hr}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
