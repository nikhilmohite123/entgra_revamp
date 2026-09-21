import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  Calendar,
  Send,
  RefreshCw,
  Search,
  ShieldCheck,
  Info,
} from 'lucide-react';
import styles from '../styles/overtime.module.css';
import { BASE_URL, get12hrsformat } from '../constants/overtimeConstants';
import OtAuditTrailModal from '../components/OtAuditTrailModal';
import OtRejectModal from '../components/OtRejectModal';

export default function OtApprovalProcessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const uid = localStorage.getItem('uid') || '';

  // Application ID from URL query (?id=... or ?n_application_id=...)
  const initialAppId =
    searchParams.get('id') ||
    searchParams.get('n_application_id') ||
    '';

  const [applicationId, setApplicationId] = useState(initialAppId);
  const [inputAppId, setInputAppId] = useState(initialAppId);

  // Application data
  const [childData, setChildData] = useState([]);
  const [wrkflwData, setWrkflwData] = useState([]);
  const [currentLevel, setCurrentLevel] = useState('');
  const [showSubmitBtn, setShowSubmitBtn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submittingNextLevel, setSubmittingNextLevel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Audit Trail Modal State
  const [isTrailOpen, setIsTrailOpen] = useState(false);
  const [trailDetails, setTrailDetails] = useState(null);
  const [trailList, setTrailList] = useState([]);
  const [loadingTrail, setLoadingTrail] = useState(false);

  // Reject Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejecting, setRejecting] = useState(false);

  // 1. Fetch Level-Wise Process Data
  const fetchLevelWiseData = useCallback(
    async (appId) => {
      if (!appId) return;
      setLoading(true);
      try {
        const formData = new URLSearchParams();
        formData.append('n_application_id', appId);
        formData.append('s_name', uid);

        const res = await fetch(`${BASE_URL}/otPro/get_employee_process_data_level_wise`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString(),
        });

        if (res.ok) {
          const data = await res.json();
          const children = data.child_data || [];
          const workflow = data.wrkflw_data || [];

          setChildData(children);
          setWrkflwData(workflow);

          // Find current user's level in workflow
          const userIdx = workflow.findIndex(
            (e) => e.s_name === uid && (e.n_status === null || e.n_level_wise_sts === null)
          );
          const lvl = userIdx !== -1 ? workflow[userIdx].n_level : workflow[0]?.n_level || '';
          setCurrentLevel(lvl);

          // Submit button condition: hide if already submitted for this level
          const alreadySubmitted =
            workflow.findIndex(
              (e) => e.n_level === lvl && e.n_status !== null && e.n_level_wise_sts !== null
            ) !== -1;

          setShowSubmitBtn(!alreadySubmitted);
        } else {
          console.error('Failed to fetch level wise data:', res.status);
        }
      } catch (err) {
        console.error('Error fetching employee process data:', err);
      } finally {
        setLoading(false);
      }
    },
    [uid]
  );

  useEffect(() => {
    if (applicationId) {
      fetchLevelWiseData(applicationId);
    }
  }, [applicationId, fetchLevelWiseData]);

  // Handle manual ID lookup
  const handleSearchAppId = (e) => {
    e.preventDefault();
    if (!inputAppId.trim()) return;
    setApplicationId(inputAppId.trim());
    navigate(`?id=${encodeURIComponent(inputAppId.trim())}`, { replace: true });
  };

  // 2. Accept Action
  const handleAccept = async (headerId, childId) => {
    try {
      const res = await fetch(`${BASE_URL}/otPro/get_employee_process_workflow_data1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ headrid: String(headerId), childid: String(childId) }).toString(),
      });

      if (!res.ok) {
        alert('Failed to verify workflow authorization.');
        return;
      }

      const wrkflowList = await res.json();
      const userIdx = wrkflowList.findIndex(
        (e) => e.s_name === uid && (e.n_status === null || e.n_level_wise_sts === null)
      );

      if (userIdx === -1) {
        alert('something happened');
        return;
      }

      const userLevel = wrkflowList[userIdx].n_level;

      if (userLevel === 'HOD') {
        const approveRes = await fetch(`${BASE_URL}/otPro/approve_ot_process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            headrid: String(headerId),
            childid: String(childId),
            level: 'HOD',
            sts: '1',
          }).toString(),
        });
        if (approveRes.ok) {
          alert('approved');
          fetchLevelWiseData(applicationId);
        }
      } else if (userLevel === 'Unit Head') {
        const hodApproved =
          wrkflowList.findIndex(
            (e) => e.n_level === 'HOD' && e.n_status == 1 && e.n_level_wise_sts == 1
          ) !== -1;

        if (!hodApproved) {
          alert('you are not yet allowed to approve.... HOD not approve yet ....');
          return;
        }

        const approveRes = await fetch(`${BASE_URL}/otPro/approve_ot_process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            headrid: String(headerId),
            childid: String(childId),
            level: 'Unit Head',
            sts: '1',
          }).toString(),
        });
        if (approveRes.ok) {
          alert('approved');
          fetchLevelWiseData(applicationId);
        }
      } else if (userLevel === 'Unit HR') {
        const unitHeadApproved =
          wrkflowList.findIndex(
            (e) => e.n_level === 'Unit Head' && e.n_status == 1 && e.n_level_wise_sts == 1
          ) !== -1;

        if (!unitHeadApproved) {
          alert('you are not yet allowed to approve.... unithead not approve yet ....');
          return;
        }

        const approveRes = await fetch(`${BASE_URL}/otPro/approve_ot_process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            headrid: String(headerId),
            childid: String(childId),
            level: 'Unit HR',
            sts: '1',
            child_sts: '1',
          }).toString(),
        });
        if (approveRes.ok) {
          alert('approved');
          fetchLevelWiseData(applicationId);
        }
      }
    } catch (err) {
      console.error('Error accepting record:', err);
      alert('Error processing approval.');
    }
  };

  // 3. Open Reject Modal
  const handleOpenRejectModal = (headerId, childId, empName) => {
    setRejectTarget({ headerId, childId, s_emp_name: empName });
    setIsRejectModalOpen(true);
  };

  // 4. Confirm Reject Action
  const handleConfirmReject = async (reason) => {
    if (!rejectTarget) return;
    setRejecting(true);
    const { headerId, childId } = rejectTarget;

    try {
      const res = await fetch(`${BASE_URL}/otPro/get_employee_process_workflow_data1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ headrid: String(headerId), childid: String(childId) }).toString(),
      });

      if (!res.ok) {
        alert('Failed to verify workflow authorization.');
        return;
      }

      const wrkflowList = await res.json();
      const userIdx = wrkflowList.findIndex(
        (e) => e.s_name === uid && (e.n_status === null || e.n_level_wise_sts === null)
      );

      if (userIdx === -1) {
        alert('something happened');
        return;
      }

      const userLevel = wrkflowList[userIdx].n_level;

      if (userLevel === 'HOD') {
        const rejectRes = await fetch(`${BASE_URL}/otPro/reject_ot_process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            headrid: String(headerId),
            childid: String(childId),
            level: 'HOD;Unit Head;Unit HR',
            sts: '0',
            child_sts: '0',
            s_reject_reason: reason,
            uid,
          }).toString(),
        });
        if (rejectRes.ok) {
          alert('rejected');
          setIsRejectModalOpen(false);
          fetchLevelWiseData(applicationId);
        }
      } else if (userLevel === 'Unit Head') {
        const hodApproved =
          wrkflowList.findIndex(
            (e) => e.n_level === 'HOD' && e.n_status == 1 && e.n_level_wise_sts == 1
          ) !== -1;

        if (!hodApproved) {
          alert('you are not yet allowed to approve.... HOD not approve yet ....');
          return;
        }

        const rejectRes = await fetch(`${BASE_URL}/otPro/reject_ot_process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            headrid: String(headerId),
            childid: String(childId),
            level: 'Unit Head;Unit HR',
            sts: '0',
            child_sts: '0',
            s_reject_reason: reason,
            uid,
          }).toString(),
        });
        if (rejectRes.ok) {
          alert('rejected');
          setIsRejectModalOpen(false);
          fetchLevelWiseData(applicationId);
        }
      } else if (userLevel === 'Unit HR') {
        const unitHeadApproved =
          wrkflowList.findIndex(
            (e) => e.n_level === 'Unit Head' && e.n_status == 1 && e.n_level_wise_sts == 1
          ) !== -1;

        if (!unitHeadApproved) {
          alert('you are not yet allowed to approve.... unithead not approve yet ....');
          return;
        }

        const rejectRes = await fetch(`${BASE_URL}/otPro/reject_ot_process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            headrid: String(headerId),
            childid: String(childId),
            level: 'Unit HR',
            sts: '0',
            child_sts: '0',
            s_reject_reason: reason,
            uid,
          }).toString(),
        });
        if (rejectRes.ok) {
          alert('rejected');
          setIsRejectModalOpen(false);
          fetchLevelWiseData(applicationId);
        }
      }
    } catch (err) {
      console.error('Error rejecting record:', err);
      alert('Error processing rejection.');
    } finally {
      setRejecting(false);
    }
  };

  // 5. Submit to Next Level Action
  const handleSubmitNextLevel = async () => {
    setSubmittingNextLevel(true);
    try {
      const payload = {
        n_application_id: applicationId,
        s_name: uid,
        level: currentLevel,
        hdr_data: childData,
      };

      let res = await fetch(`${BASE_URL}/otPro/sbmt_to_next_level`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Fallback urlencoded
        const params = new URLSearchParams();
        params.append('n_application_id', applicationId);
        params.append('s_name', uid);
        params.append('level', currentLevel);
        params.append('hdr_data', JSON.stringify(childData));

        res = await fetch(`${BASE_URL}/otPro/sbmt_to_next_level`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        });
      }

      const result = await res.json();
      alert(result.message || 'Submitted to next level successfully.');
      navigate('/overtime/ot_main');
    } catch (err) {
      console.error('Error submitting to next level:', err);
      alert('Error submitting to next level.');
    } finally {
      setSubmittingNextLevel(false);
    }
  };

  // 6. Approval Process Details (Modal)
  const handleOpenAuditTrail = async (child) => {
    setIsTrailOpen(true);
    setLoadingTrail(true);
    setTrailDetails(null);
    setTrailList([]);

    const dept = child.s_department || '';
    const plant = child.n_plant_id || '';

    try {
      const payload = {
        n_child_id: child.n_child_id,
        n_emp_id: child.n_emp_id,
        dept,
        plant,
      };

      const detailRes = await fetch(`${BASE_URL}/otPro/get_approval_process_detail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (detailRes.ok) {
        const result = await detailRes.json();
        const data = result?.[0];
        setTrailDetails(data);

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
      console.error('Error opening audit trail:', err);
    } finally {
      setLoadingTrail(false);
    }
  };

  // Filtered rows for in-table search
  const filteredRows = childData.filter((row) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      String(row.n_emp_id || '').toLowerCase().includes(q) ||
      String(row.s_emp_name || '').toLowerCase().includes(q)
    );
  });

  const headerItem = childData[0];

  return (
    <div className={styles.pageContainer}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.titleArea}>
          <h1>
            <ShieldCheck size={26} color="#0284c7" />
            Employee Approval Process
          </h1>
          <p>Review, accept, or reject overtime applications at your authorization level</p>
        </div>

        <div className={styles.actionButtons}>
          <Link to="/overtime" className={`${styles.btnAction} ${styles.btnApply}`}>
            <ArrowLeft size={16} />
            Back to Overtime Portal
          </Link>
        </div>
      </div>

      {/* Main Approval Card */}
      <div className={styles.panelCard}>
        <div className={styles.panelHeader}>
          <div className={styles.panelHeaderTitle}>
            <Building size={18} />
            Application Overview &amp; Authorization Level
            {currentLevel && (
              <span
                style={{
                  marginLeft: '10px',
                  fontSize: '12px',
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 600,
                }}
              >
                Level: {currentLevel}
              </span>
            )}
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
          {headerItem ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                padding: '16px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                marginBottom: '20px',
              }}
            >
              <div>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block', fontWeight: 500 }}>
                  Unit Name:
                </span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                  {headerItem.s_plant_name || '-'}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block', fontWeight: 500 }}>
                  Department:
                </span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                  {headerItem.s_department || '-'}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block', fontWeight: 500 }}>
                  OT Date:
                </span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                  {headerItem.s_OT_date || '-'}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block', fontWeight: 500 }}>
                  Application ID:
                </span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0284c7' }}>
                  #{applicationId}
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
                  'No pending approval records found for this application.'
                )
              ) : (
                'Please enter an Application ID above to load pending approvals.'
              )}
            </div>
          )}

          {/* Table Toolbar */}
          {childData.length > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '14px',
              }}
            >
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                Showing <strong>{filteredRows.length}</strong> employee request(s)
              </div>

              <div style={{ position: 'relative', width: '220px' }}>
                <Search
                  size={14}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  className={styles.formInput}
                  style={{ height: '32px', paddingLeft: '28px', fontSize: '12px' }}
                  placeholder="Filter employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Employees Table */}
          <div className={styles.tableResponsive} style={{ overflowX: 'auto', minHeight: '220px' }}>
            <table className={styles.dataTable} id="optable">
              <thead>
                <tr>
                  <th style={{ minWidth: '130px' }}>Employee Code</th>
                  <th style={{ minWidth: '180px' }}>Employee Name</th>
                  <th style={{ minWidth: '120px' }}>OT Start Time</th>
                  <th style={{ minWidth: '120px' }}>OT End Time</th>
                  <th style={{ minWidth: '160px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                      <RefreshCw size={24} className={styles.spin} style={{ marginBottom: '8px' }} />
                      <div>Loading Employee Approvals...</div>
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                      {applicationId
                        ? 'No employee approval records found for this application.'
                        : 'No application selected.'}
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row, idx) => {
                    // Check if actionable for this user's current level
                    const isActionable =
                      wrkflwData.findIndex(
                        (e) =>
                          e.n_child_id === row.n_child_id &&
                          e.n_level === currentLevel &&
                          e.n_status === null
                      ) !== -1;

                    return (
                      <tr key={row.n_child_id || idx}>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleOpenAuditTrail(row)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#0284c7',
                              fontWeight: 600,
                              cursor: 'pointer',
                              padding: 0,
                              textDecoration: 'underline',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            title="Click to view audit trail & details"
                          >
                            <Info size={13} />
                            {row.n_emp_id}
                          </button>
                        </td>
                        <td style={{ fontWeight: 500 }}>{row.s_emp_name}</td>
                        <td>{get12hrsformat(row.d_start_time)}</td>
                        <td>{get12hrsformat(row.d_end_time)}</td>
                        <td style={{ textAlign: 'center' }}>
                          {isActionable ? (
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button
                                type="button"
                                className={`${styles.btnAction} ${styles.btnApply}`}
                                style={{ padding: '4px 10px', fontSize: '12px' }}
                                onClick={() => handleAccept(row.n_OT_header_id, row.n_child_id)}
                                title="Accept Overtime"
                              >
                                <CheckCircle size={13} />
                                Accept
                              </button>
                              <button
                                type="button"
                                className={`${styles.btnAction} ${styles.btnHourMaster}`}
                                style={{ padding: '4px 10px', fontSize: '12px' }}
                                onClick={() =>
                                  handleOpenRejectModal(
                                    row.n_OT_header_id,
                                    row.n_child_id,
                                    row.s_emp_name
                                  )
                                }
                                title="Reject Overtime"
                              >
                                <XCircle size={13} />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                              Completed / Inactive
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Submit To Next Level Button */}
          {showSubmitBtn && childData.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '28px' }}>
              <button
                type="button"
                id="btn_sbmt"
                className={`${styles.btnAction} ${styles.btnReport}`}
                style={{
                  padding: '10px 32px',
                  fontSize: '14px',
                  fontWeight: 700,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
                onClick={handleSubmitNextLevel}
                disabled={submittingNextLevel}
              >
                {submittingNextLevel ? (
                  <>
                    <RefreshCw size={16} className={styles.spin} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit to Next Level
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Audit Trail Details Modal */}
      <OtAuditTrailModal
        isOpen={isTrailOpen}
        onClose={() => setIsTrailOpen(false)}
        details={trailDetails}
        trailList={trailList}
        loading={loadingTrail}
      />

      {/* Rejection Reason Modal */}
      <OtRejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        rejectData={rejectTarget}
        onConfirmReject={handleConfirmReject}
        loading={rejecting}
      />
    </div>
  );
}
