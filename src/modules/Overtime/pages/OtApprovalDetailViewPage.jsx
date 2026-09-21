import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  Search,
  RefreshCw,
  Info,
  ShieldCheck,
} from 'lucide-react';
import styles from '../styles/overtime.module.css';
import { BASE_URL, get12hrsformat } from '../constants/overtimeConstants';
import OtAuditTrailModal from '../components/OtAuditTrailModal';

export default function OtApprovalDetailViewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL parameters (supports ?id= or ?n_application_id= or ?app_id=)
  const initialAppId =
    searchParams.get('id') ||
    searchParams.get('n_application_id') ||
    searchParams.get('app_id') ||
    '';

  const [applicationId, setApplicationId] = useState(initialAppId);
  const [inputAppId, setInputAppId] = useState(initialAppId);

  // Application header info & process list
  const [headerData, setHeaderData] = useState(null);
  const [processList, setProcessList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Audit Trail Modal State
  const [isTrailOpen, setIsTrailOpen] = useState(false);
  const [trailDetails, setTrailDetails] = useState(null);
  const [trailList, setTrailList] = useState([]);
  const [loadingTrail, setLoadingTrail] = useState(false);

  // 1. Fetch Employee Process Data for the given application ID
  const fetchEmployeeProcessData = useCallback(async (appId) => {
    if (!appId) return;

    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('n_application_id', appId);

      const res = await fetch(`${BASE_URL}/otPro/get_employee_process_data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setProcessList(list);

        if (list.length > 0) {
          const first = list[0];
          setHeaderData({
            application_id: first.n_application_id,
            plant_name: first.s_plant_name,
            department: first.s_department,
            ot_date: first.s_OT_date,
            status: first.n_status,
          });
        } else {
          setHeaderData(null);
        }
      }
    } catch (err) {
      console.error('Error fetching employee process data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger fetch on application ID change or mount
  useEffect(() => {
    if (applicationId) {
      fetchEmployeeProcessData(applicationId);
    }
  }, [applicationId, fetchEmployeeProcessData]);

  // Handle manual ID lookup
  const handleSearchAppId = (e) => {
    e.preventDefault();
    if (!inputAppId.trim()) return;
    setApplicationId(inputAppId.trim());
    navigate(`?id=${encodeURIComponent(inputAppId.trim())}`, { replace: true });
  };

  // 2. Open Audit Trail Modal & Fetch Process Details
  const handleOpenApprovalDetail = async (row) => {
    setIsTrailOpen(true);
    setLoadingTrail(true);
    setTrailDetails(null);
    setTrailList([]);

    const dept = row.s_department || row.s_emp_dept || '';
    const plant = row.n_plant_id || '';

    const payload = {
      n_child_id: row.n_child_id,
      n_emp_id: row.n_emp_id,
      dept,
      plant,
    };

    try {
      const detailRes = await fetch(`${BASE_URL}/otPro/get_approval_process_detail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (detailRes.ok) {
        const result = await detailRes.json();
        const data = result?.[0];
        setTrailDetails(data);

        // Fetch OtTrail using the returned process detail
        if (data) {
          const trailRes = await fetch(`${BASE_URL}/otPro/OtTrail`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(data).toString(),
          });

          if (trailRes.ok) {
            const trailData = await trailRes.json();
            setTrailList(Array.isArray(trailData) ? trailData : []);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching approval process details & trail:', err);
    } finally {
      setLoadingTrail(false);
    }
  };

  // Filtered rows by search
  const filteredList = processList.filter((row) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      String(row.s_emp_name || '').toLowerCase().includes(q) ||
      String(row.s_emp_dept || row.s_department || '').toLowerCase().includes(q) ||
      String(row.n_emp_id || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className={styles.pageContainer}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.titleArea}>
          <h1>
            <FileText size={26} color="#0284c7" />
            Overtime Approval Detail View
          </h1>
          <p>Inspect application details, employee overtime entries, and approval audit trail</p>
        </div>

        <div className={styles.actionButtons}>
          <Link to="/overtime" className={`${styles.btnAction} ${styles.btnApply}`}>
            <ArrowLeft size={16} />
            Back to Overtime Portal
          </Link>
        </div>
      </div>

      {/* Application Lookup & Summary Card */}
      <div className={styles.panelCard}>
        <div className={styles.panelHeader}>
          <div className={styles.panelHeaderTitle}>
            <Building size={18} />
            Application Overview
          </div>
          <form onSubmit={handleSearchAppId} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              className={styles.formInput}
              style={{ width: '180px', height: '32px', fontSize: '12px' }}
              placeholder="Application ID..."
              value={inputAppId}
              onChange={(e) => setInputAppId(e.target.value)}
            />
            <button
              type="submit"
              className={`${styles.btnAction} ${styles.btnApply}`}
              style={{ padding: '4px 10px', height: '32px', fontSize: '12px' }}
            >
              <Search size={13} />
              Load
            </button>
          </form>
        </div>

        <div className={styles.panelBody}>
          {headerData ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                padding: '16px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block', fontWeight: 500 }}>
                  Application No:
                </span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#0369a1' }}>
                  #{headerData.application_id}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block', fontWeight: 500 }}>
                  Unit Name:
                </span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                  {headerData.plant_name || '-'}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block', fontWeight: 500 }}>
                  OT Date:
                </span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                  {headerData.ot_date || '-'}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block', fontWeight: 500 }}>
                  Status:
                </span>
                <span
                  className={`${styles.statusBadge} ${
                    headerData.status === 1 ? styles.statusApproved : styles.statusOpen
                  }`}
                  style={{ marginTop: '2px' }}
                >
                  {headerData.status === 0 ? 'Opened' : 'Closed'}
                </span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px', color: '#64748b', fontSize: '13px' }}>
              {applicationId ? (
                loading ? (
                  <>
                    <RefreshCw size={16} className={styles.spin} style={{ marginRight: '6px' }} />
                    Loading application information...
                  </>
                ) : (
                  'No details found for the specified Application ID.'
                )
              ) : (
                'Please enter an Application ID above to view details.'
              )}
            </div>
          )}
        </div>
      </div>

      {/* Employees Overtime Table Card */}
      <div className={styles.panelCard} style={{ marginTop: '20px' }}>
        <div className={styles.panelHeader}>
          <div className={styles.panelHeaderTitle}>
            <Clock size={18} />
            Employee Overtime Breakdown
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={14}
                color="#94a3b8"
                style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                className={styles.formInput}
                style={{ width: '200px', height: '32px', paddingLeft: '28px', fontSize: '12px' }}
                placeholder="Search employee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <span className={styles.badgeCount}>{filteredList.length}</span>
          </div>
        </div>

        <div className={styles.panelBody}>
          <div className={styles.tableResponsive} style={{ overflowX: 'auto', minHeight: '220px' }}>
            <table className={styles.dataTable} id="optable">
              <thead>
                <tr>
                  <th style={{ minWidth: '60px', textAlign: 'center' }}>Sr.No</th>
                  <th style={{ minWidth: '180px' }}>Employee Name</th>
                  <th style={{ minWidth: '160px' }}>Employee Department</th>
                  <th style={{ minWidth: '120px' }}>OT Start Time</th>
                  <th style={{ minWidth: '120px' }}>OT End Time</th>
                  <th style={{ minWidth: '120px' }}>Status</th>
                  <th style={{ minWidth: '110px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                      <RefreshCw size={24} className={styles.spin} style={{ marginBottom: '8px' }} />
                      <div>Loading Employee Overtime Entries...</div>
                    </td>
                  </tr>
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                      {applicationId
                        ? 'No employee overtime records found for this application.'
                        : 'No application selected.'}
                    </td>
                  </tr>
                ) : (
                  filteredList.map((row, idx) => {
                    const statusText =
                      row.n_child_status === 1
                        ? 'Approved'
                        : row.n_child_status === 0
                        ? 'Rejected'
                        : 'Pending';

                    let statusClass = styles.statusOpen;
                    if (row.n_child_status === 1) statusClass = styles.statusApproved;
                    else if (row.n_child_status === 0) statusClass = styles.statusRejected;

                    return (
                      <tr key={row.n_child_id || idx}>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{idx + 1}</td>
                        <td style={{ fontWeight: 500 }}>{row.s_emp_name}</td>
                        <td>{row.s_emp_dept || row.s_department || '-'}</td>
                        <td>{get12hrsformat(row.d_start_time)}</td>
                        <td>{get12hrsformat(row.d_end_time)}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${statusClass}`}>{statusText}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className={`${styles.btnAction} ${styles.btnApply}`}
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                            onClick={() => handleOpenApprovalDetail(row)}
                            title="View Approval Process Details"
                          >
                            <Info size={13} />
                            Details
                          </button>
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

      {/* Audit Trail Modal */}
      <OtAuditTrailModal
        isOpen={isTrailOpen}
        onClose={() => setIsTrailOpen(false)}
        details={trailDetails}
        trailList={trailList}
        loading={loadingTrail}
      />
    </div>
  );
}
