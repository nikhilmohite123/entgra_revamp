import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  PlusCircle,
  FileSpreadsheet,
  Database,
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
} from 'lucide-react';
import styles from '../styles/overtime.module.css';
import { BASE_URL, get12hrsformat } from '../constants/overtimeConstants';
import OtAuditTrailModal from '../components/OtAuditTrailModal';
import OtRejectModal from '../components/OtRejectModal';

export default function OvertimeIndexPage() {
  // Authentication & Roles
  const [userType, setUserType] = useState('');
  const uid = localStorage.getItem('uid') || '';

  // Data lists
  const [approvalList, setApprovalList] = useState([]);
  const [pendingList, setPendingList] = useState([]);
  const [loadingApproval, setLoadingApproval] = useState(false);
  const [loadingPending, setLoadingPending] = useState(false);

  // Search queries
  const [searchApproval, setSearchApproval] = useState('');
  const [searchPending, setSearchPending] = useState('');

  // Accordion panels collapse states
  const [collapseApproval, setCollapseApproval] = useState(false);
  const [collapsePending, setCollapsePending] = useState(false);

  // Modal 1: Audit Trail / Details Modal
  const [isTrailOpen, setIsTrailOpen] = useState(false);
  const [trailDetails, setTrailDetails] = useState(null);
  const [trailList, setTrailList] = useState([]);
  const [loadingTrail, setLoadingTrail] = useState(false);

  // Modal 2: Reject Modal
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectModalData, setRejectModalData] = useState(null);
  const [submittingReject, setSubmittingReject] = useState(false);

  // 1. Fetch Pending List
  const fetchPendingList = useCallback(async () => {
    setLoadingPending(true);
    try {
      const response = await fetch(`${BASE_URL}/otPro/get_pending_list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ uid }).toString(),
      });
      if (response.ok) {
        const result = await response.json();
        setPendingList(Array.isArray(result) ? result : []);
      }
    } catch (error) {
      console.error('Error fetching pending list:', error);
    } finally {
      setLoadingPending(false);
    }
  }, [uid]);

  // 2. Fetch Approval List (My Created)
  const fetchApprovalList = useCallback(async () => {
    setLoadingApproval(true);
    try {
      const response = await fetch(`${BASE_URL}/otPro/get_approval_list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ uid }).toString(),
      });
      if (response.ok) {
        const result = await response.json();
        setApprovalList(Array.isArray(result) ? result : []);
      }
    } catch (error) {
      console.error('Error fetching approval list:', error);
    } finally {
      setLoadingApproval(false);
      // As in original code: complete callback calls pending_list()
      fetchPendingList();
    }
  }, [uid, fetchPendingList]);

  // 3. Fetch Auth & Init
  const fetchAuth = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/otPro/getAuth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ uid }).toString(),
      });
      if (response.ok) {
        const result = await response.json();
        if (result && result.length > 0) {
          const type = result[0].s_type;
          setUserType(type);
        }
      }
    } catch (error) {
      console.error('Error fetching auth:', error);
    } finally {
      fetchApprovalList();
    }
  }, [uid, fetchApprovalList]);

  useEffect(() => {
    fetchAuth();
  }, [fetchAuth]);

  // 4. Trail View Modal: approval_process_detail & OtTrail
  const handleApprovalProcessDetail = async (n_child_id, n_emp_id, deptandplant) => {
    setIsTrailOpen(true);
    setLoadingTrail(true);
    setTrailDetails(null);
    setTrailList([]);

    try {
      const [dept, plant] = (deptandplant || '').split('||');
      const payload = {
        n_child_id,
        n_emp_id,
        dept: dept || '',
        plant: plant || '',
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

        // Chain to OtTrail call with the returned data
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
      console.error('Error fetching process details & trail:', err);
    } finally {
      setLoadingTrail(false);
    }
  };

  // 5. Cancel Record: remove_emp_data
  const handleRemoveEmpData = async (childId) => {
    if (!window.confirm('Are you sure you want to cancel this record?')) return;
    try {
      const response = await fetch(`${BASE_URL}/otPro/remove_emp_data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id: childId }).toString(),
      });
      const result = await response.json();
      if (result.message === 'Success') {
        alert('Record cancelled....');
      }
    } catch (err) {
      console.error('Error removing emp data:', err);
    } finally {
      fetchApprovalList();
    }
  };

  // 6. Accept OT: accept_ot
  const handleAcceptOt = async (headrid, childid, plantId) => {
    try {
      const wfRes = await fetch(`${BASE_URL}/otPro/get_employee_process_workflow_data1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ headrid, childid }).toString(),
      });

      if (!wfRes.ok) throw new Error('Workflow query failed');
      const result = await wfRes.json();

      const index = result.findIndex(
        (el) => el.s_name && el.s_name.includes(uid) && (el.n_status == null || el.n_level_wise_sts == null)
      );

      if (index === -1) {
        return alert('something happened');
      }

      const level = result[index].n_level;

      switch (level) {
        case 'HOD': {
          const approveRes = await fetch(`${BASE_URL}/otPro/approve_ot_process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              headrid,
              childid,
              level: 'HOD',
              sts: 1,
              unitid: plantId,
              uid,
            }).toString(),
          });
          if (approveRes.ok) {
            alert('approved');
            fetchPendingList();
          }
          break;
        }
        case 'Unit Head': {
          const lvl = result.findIndex(
            (el) => el.n_level === 'HOD' && el.n_status === 1 && el.n_level_wise_sts === 1
          );
          if (lvl === -1) {
            return alert('you are not yet allowed to approve.... HOD not approve yet ....');
          }
          const approveRes = await fetch(`${BASE_URL}/otPro/approve_ot_process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              headrid,
              childid,
              level: 'Unit Head',
              sts: 1,
              unitid: plantId,
              uid,
            }).toString(),
          });
          if (approveRes.ok) {
            alert('approved');
            fetchPendingList();
          }
          break;
        }
        case 'Unit HR': {
          const lvl = result.findIndex(
            (el) => el.n_level === 'Unit Head' && el.n_status === 1 && el.n_level_wise_sts === 1
          );
          if (lvl === -1) {
            return alert('you are not yet allowed to approve.... unithead not approve yet ....');
          }
          const approveRes = await fetch(`${BASE_URL}/otPro/approve_ot_process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              headrid,
              childid,
              level: 'Unit HR',
              sts: 1,
              child_sts: 1,
              unitid: plantId,
              uid,
            }).toString(),
          });
          if (approveRes.ok) {
            alert('approved');
            fetchPendingList();
          }
          break;
        }
        default:
          break;
      }
    } catch (err) {
      console.error('Error accepting OT:', err);
    }
  };

  // 7. Reject OT: open modal & reject()
  const handleOpenRejectModal = (HId, CId, empName, plantId) => {
    setRejectModalData({
      headrid: HId,
      childid: CId,
      s_emp_name: empName,
      plantid: plantId,
    });
    setIsRejectOpen(true);
  };

  const handleConfirmReject = async (reason) => {
    if (!rejectModalData) return;
    const { headrid, childid, plantid } = rejectModalData;
    setSubmittingReject(true);

    try {
      const wfRes = await fetch(`${BASE_URL}/otPro/get_employee_process_workflow_data1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          headrid,
          childid,
          unitid: plantid,
        }).toString(),
      });

      if (!wfRes.ok) throw new Error('Workflow query failed');
      const result = await wfRes.json();

      const index = result.findIndex(
        (el) => el.s_name && el.s_name.includes(uid) && (el.n_status == null || el.n_level_wise_sts == null)
      );

      if (index === -1) {
        alert('something happened');
        return;
      }

      const level = result[index].n_level;

      switch (level) {
        case 'HOD': {
          const res = await fetch(`${BASE_URL}/otPro/reject_ot_process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              headrid,
              childid,
              level: 'HOD;Unit Head;Unit HR',
              sts: 0,
              child_sts: 0,
              s_reject_reason: reason,
              uid,
              unitid: plantid,
            }).toString(),
          });
          if (res.ok) {
            alert('rejected');
            setIsRejectOpen(false);
            fetchPendingList();
          }
          break;
        }
        case 'Unit Head': {
          const lvl = result.findIndex(
            (el) => el.n_level === 'HOD' && el.n_status === 1 && el.n_level_wise_sts === 1
          );
          if (lvl === -1) {
            alert('you are not yet allowed to approve.... HOD not approve yet ....');
            return;
          }
          const res = await fetch(`${BASE_URL}/otPro/reject_ot_process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              headrid,
              childid,
              level: 'Unit Head;Unit HR',
              sts: 0,
              child_sts: 0,
              s_reject_reason: reason,
              uid,
              unitid: plantid,
            }).toString(),
          });
          if (res.ok) {
            alert('rejected');
            setIsRejectOpen(false);
            fetchPendingList();
          }
          break;
        }
        case 'Unit HR': {
          const lvl = result.findIndex(
            (el) => el.n_level === 'Unit Head' && el.n_status === 1 && el.n_level_wise_sts === 1
          );
          if (lvl === -1) {
            alert('you are not yet allowed to approve.... unithead not approve yet ....');
            return;
          }
          const res = await fetch(`${BASE_URL}/otPro/reject_ot_process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              headrid,
              childid,
              level: 'Unit HR',
              sts: 0,
              child_sts: 0,
              s_reject_reason: reason,
              uid,
              unitid: plantid,
            }).toString(),
          });
          if (res.ok) {
            alert('rejected');
            setIsRejectOpen(false);
            fetchPendingList();
          }
          break;
        }
        default:
          break;
      }
    } catch (err) {
      console.error('Error rejecting OT:', err);
    } finally {
      setSubmittingReject(false);
    }
  };

  // Filtered approval list (Search)
  const filteredApprovalList = useMemo(() => {
    if (!searchApproval.trim()) return approvalList;
    const q = searchApproval.toLowerCase();
    return approvalList.filter((row) => {
      const otId = `${row.n_application_id || ''}-${row.n_child_id || ''}`.toLowerCase();
      const plant = (row.s_plant_name || '').toLowerCase();
      const empName = (row.s_emp_name || '').toLowerCase();
      const dept = (row.s_emp_dept || '').toLowerCase();
      const otDate = (row.s_OT_date || '').toLowerCase();
      return (
        otId.includes(q) ||
        plant.includes(q) ||
        empName.includes(q) ||
        dept.includes(q) ||
        otDate.includes(q)
      );
    });
  }, [approvalList, searchApproval]);

  // Filtered pending list (Search)
  const filteredPendingList = useMemo(() => {
    if (!searchPending.trim()) return pendingList;
    const q = searchPending.toLowerCase();
    return pendingList.filter((row) => {
      const otId = `${row.appli_id || ''}-${row.n_child_id || ''}`.toLowerCase();
      const plant = (row.s_plant_name || '').toLowerCase();
      const empName = (row.s_emp_name || '').toLowerCase();
      const dept = (row.s_emp_dept || '').toLowerCase();
      const reason = (row.s_OT_reason || '').toLowerCase();
      return (
        otId.includes(q) ||
        plant.includes(q) ||
        empName.includes(q) ||
        dept.includes(q) ||
        reason.includes(q)
      );
    });
  }, [pendingList, searchPending]);

  return (
    <div className={styles.pageContainer}>
      {/* Top Header & Actions Bar */}
      <div className={styles.topBar}>
        <div className={styles.titleArea}>
          <h1>
            <Clock size={26} color="#0284c7" />
            Overtime Portal
          </h1>
          <p>Manage and track your overtime requisitions and approvals</p>
        </div>

        <div className={styles.actionButtons}>
          <Link
            to="/overtime/ot_requisition"
            className={`${styles.btnAction} ${styles.btnApply}`}
            id="btnCreateNBD"
          >
            <PlusCircle size={15} />
            Apply For OT
          </Link>

          {userType === 's_admin' && (
            <Link
              to="/overtime/ot_fixour_data"
              className={`${styles.btnAction} ${styles.btnHourMaster}`}
              id="btnfixhourmaster"
            >
              <Clock size={15} />
              OT Hour Master
            </Link>
          )}

          <Link
            to="/overtime/ot_report"
            className={`${styles.btnAction} ${styles.btnReport}`}
            id="btnreport"
          >
            <FileSpreadsheet size={15} />
            Report
          </Link>

          <Link
            to="/overtime/ot_master"
            className={`${styles.btnAction} ${styles.btnMasterData}`}
            id="btnmaster"
          >
            <Database size={15} />
            Master Data
          </Link>
        </div>
      </div>

      {/* Panel 1: My Created (Approval List) */}
      <div className={styles.panelCard}>
        <div
          className={styles.panelHeader}
          onClick={() => setCollapseApproval(!collapseApproval)}
        >
          <div className={styles.panelHeaderTitle}>
            {collapseApproval ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            My Created
          </div>
          <span className={styles.badgeCount} id="toal_approval_count">
            {approvalList.length}
          </span>
        </div>

        {!collapseApproval && (
          <div className={styles.panelBody}>
            <div className={styles.tableToolbar}>
              <div className={styles.searchBox}>
                <Search size={16} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search My Created records..."
                  value={searchApproval}
                  onChange={(e) => setSearchApproval(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.otTable} id="approal_list">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>OT ID</th>
                    <th>Unit Name</th>
                    <th>Apply Date</th>
                    <th>Claimed Date</th>
                    <th>Emp Name</th>
                    <th>Emp Dept</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingApproval ? (
                    <tr>
                      <td colSpan="10" className={styles.emptyState}>
                        Loading your created OT records...
                      </td>
                    </tr>
                  ) : filteredApprovalList.length === 0 ? (
                    <tr>
                      <td colSpan="10" className={styles.emptyState}>
                        No records found
                      </td>
                    </tr>
                  ) : (
                    filteredApprovalList.map((row, idx) => {
                      const deptandplant = `${row.s_emp_dept || ''}||${row.n_plant_id || ''}`;
                      const otId = `${row.n_application_id || ''}-${row.n_child_id || ''}`;
                      const applyDate = (row.d_created_date || '').split(' ')[0] || '-';

                      let statusBadge = (
                        <span className={`${styles.statusBadge} ${styles.statusOpen}`}>
                          Open
                        </span>
                      );
                      if (row.n_child_status === 0) {
                        statusBadge = (
                          <span className={`${styles.statusBadge} ${styles.statusRejected}`}>
                            Rejected
                          </span>
                        );
                      } else if (row.n_child_status === 1) {
                        statusBadge = (
                          <span className={`${styles.statusBadge} ${styles.statusApproved}`}>
                            Approved
                          </span>
                        );
                      }

                      return (
                        <tr key={row.n_child_id || idx}>
                          <td>
                            <div className={styles.cellActions}>
                              <button
                                type="button"
                                className={styles.btnTrail}
                                onClick={() =>
                                  handleApprovalProcessDetail(
                                    row.n_child_id,
                                    row.n_emp_id,
                                    deptandplant
                                  )
                                }
                              >
                                Trail View
                              </button>
                              <button
                                type="button"
                                className={styles.btnCancel}
                                title="Cancel Record"
                                onClick={() => handleRemoveEmpData(row.n_child_id)}
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                          <td><strong>{otId}</strong></td>
                          <td>{row.s_plant_name || '-'}</td>
                          <td>{applyDate}</td>
                          <td>{row.s_OT_date || '-'}</td>
                          <td>{row.s_emp_name || '-'}</td>
                          <td>{row.s_emp_dept || '-'}</td>
                          <td>{get12hrsformat(row.d_start_time)}</td>
                          <td>{get12hrsformat(row.d_end_time)}</td>
                          <td>{statusBadge}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Panel 2: Pending for Approval */}
      <div className={styles.panelCard}>
        <div
          className={styles.panelHeader}
          onClick={() => setCollapsePending(!collapsePending)}
        >
          <div className={styles.panelHeaderTitle}>
            {collapsePending ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            Pending for Approval
          </div>
          <span className={styles.badgeCount} id="toal_pending_count">
            {pendingList.length}
          </span>
        </div>

        {!collapsePending && (
          <div className={styles.panelBody}>
            <div className={styles.tableToolbar}>
              <div className={styles.searchBox}>
                <Search size={16} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search pending approval records..."
                  value={searchPending}
                  onChange={(e) => setSearchPending(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.otTable} id="pending_list">
                <thead>
                  <tr>
                    <th>Actions</th>
                    <th>View</th>
                    <th>OT ID</th>
                    <th>Unit Name</th>
                    <th>Apply Date</th>
                    <th>Claimed Date</th>
                    <th>Emp Name</th>
                    <th>Emp Dept</th>
                    <th>OT Reason</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPending ? (
                    <tr>
                      <td colSpan="12" className={styles.emptyState}>
                        Loading pending approval records...
                      </td>
                    </tr>
                  ) : filteredPendingList.length === 0 ? (
                    <tr>
                      <td colSpan="12" className={styles.emptyState}>
                        No pending records found
                      </td>
                    </tr>
                  ) : (
                    filteredPendingList.map((row, idx) => {
                      const deptandplant = `${row.s_department || row.s_emp_dept || ''}||${
                        row.n_plant_id || ''
                      }`;
                      const otId = `${row.appli_id || row.n_OT_header_id || ''}-${
                        row.n_child_id || ''
                      }`;
                      const applyDate = (row.d_created_date || '').split(' ')[0] || '-';

                      let statusBadge = (
                        <span className={`${styles.statusBadge} ${styles.statusOpen}`}>
                          Open
                        </span>
                      );
                      if (row.n_status === 0) {
                        statusBadge = (
                          <span className={`${styles.statusBadge} ${styles.statusRejected}`}>
                            Rejected
                          </span>
                        );
                      } else if (row.n_status === 1) {
                        statusBadge = (
                          <span className={`${styles.statusBadge} ${styles.statusApproved}`}>
                            Approved
                          </span>
                        );
                      }

                      return (
                        <tr key={row.n_child_id || idx}>
                          <td>
                            <div className={styles.cellActions}>
                              <button
                                type="button"
                                className={styles.btnAccept}
                                title="Accept Record"
                                onClick={() =>
                                  handleAcceptOt(
                                    row.n_OT_header_id,
                                    row.n_child_id,
                                    row.n_plant_id
                                  )
                                }
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                className={styles.btnReject}
                                title="Reject Record"
                                onClick={() =>
                                  handleOpenRejectModal(
                                    row.n_OT_header_id,
                                    row.n_child_id,
                                    row.s_emp_name,
                                    row.n_plant_id
                                  )
                                }
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                          <td>
                            <button
                              type="button"
                              className={styles.btnTrail}
                              onClick={() =>
                                handleApprovalProcessDetail(
                                  row.n_child_id,
                                  row.n_emp_id,
                                  deptandplant
                                )
                              }
                            >
                              Trail View
                            </button>
                          </td>
                          <td><strong>{otId}</strong></td>
                          <td>{row.s_plant_name || '-'}</td>
                          <td>{applyDate}</td>
                          <td>{row.s_OT_date || '-'}</td>
                          <td>{row.s_emp_name || '-'}</td>
                          <td>{row.s_emp_dept || '-'}</td>
                          <td>{row.s_OT_reason || '-'}</td>
                          <td>{get12hrsformat(row.d_start_time)}</td>
                          <td>{get12hrsformat(row.d_end_time)}</td>
                          <td>{statusBadge}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal 1: Audit Trail / Details */}
      <OtAuditTrailModal
        isOpen={isTrailOpen}
        onClose={() => setIsTrailOpen(false)}
        details={trailDetails}
        trailList={trailList}
        loading={loadingTrail}
      />

      {/* Modal 2: Reject Reason */}
      <OtRejectModal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        rejectData={rejectModalData}
        onConfirmReject={handleConfirmReject}
        loading={submittingReject}
      />
    </div>
  );
}
