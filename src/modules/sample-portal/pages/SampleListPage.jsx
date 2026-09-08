import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import styles from '../styles/SampleList.module.css';
import SamplePortalHeader from '../component/SamplePortalHeader';
import SamplePortalFooter from '../component/SamplePortalFooter';
import DetailModal from '../component/DetailModal';
import WorkflowModal from '../component/WorkflowModal';
import EditRequestModal from '../component/EditRequestModal';
import AttachmentPreviewModal from '../component/AttachmentPreviewModal';
import Toast from '../component/Toast';
import { TableSkeleton } from '../../../components/common/Skeleton/InstagramSkeleton';
import StateFeedback from '../../../components/common/Feedback/StateFeedback';
import { useSamplePortal } from '../context/useSamplePortal';
import {
  STATUS_TABS,
  buildSampleRefNo,
  esc,
} from '../constants/samplePortalConstants';

export default function SampleListPage() {
  const navigate = useNavigate();
  const {
    requests,
    setRequests,
    loading,
    error,
    currentTab,
    setCurrentTab,
    searchTerm,
    setSearchTerm,
    isAdmin,
    fetchRequests,
  } = useSamplePortal();

  // Modal states
  const [detailRow, setDetailRow] = useState(null);
  const [workflowRow, setWorkflowRow] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [previewFilePath, setPreviewFilePath] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Filtered requests based on active tab and search query
  const filteredRows = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();

    return requests.filter((r) => {
      // Tab filter
      if (currentTab !== 'All' && r.s_status !== currentTab) {
        return false;
      }

      // Search query filter
      if (q) {
        const haystack = [
          r.s_applicant_name,
          r.s_epl_location,
          r.s_type,
          r.s_category,
          r.s_created_by,
          r.s_remark,
          r.s_special_remarks,
          buildSampleRefNo(r.n_id),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [requests, currentTab, searchTerm]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts = { Open: 0, Closed: 0, All: requests.length };
    requests.forEach((r) => {
      if (r.s_status === 'Open') counts.Open += 1;
      else if (r.s_status === 'Closed') counts.Closed += 1;
    });
    return counts;
  }, [requests]);

  // Handlers for updated items
  const handleWorkflowSaved = (updatedRow) => {
    setRequests((prev) =>
      prev.map((r) => (r.n_id === updatedRow.n_id ? updatedRow : r))
    );
    showToast('Workflow saved & request Closed successfully!', 'success');
  };

  const handleEditSaved = (updatedRow) => {
    setRequests((prev) =>
      prev.map((r) => (r.n_id === updatedRow.n_id ? updatedRow : r))
    );
    showToast('Request updated successfully!', 'success');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <SamplePortalHeader />

      <main className={styles.tableMain}>
        {/* Top bar */}
        <div className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <div className={styles.pill}>SAMPLE</div>
            <h1 className={styles.pageTitle}>
              {isAdmin ? 'All Sample Requests' : 'Sample Requests'}
            </h1>
            {isAdmin && <span className={styles.adminBadge}>Admin View</span>}
          </div>

          <div className={styles.topbarRight}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>
                <Search size={16} />
              </span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search requests…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search requests"
              />
            </div>
            <div className={styles.recordCount}>
              {filteredRows.length} {filteredRows.length === 1 ? 'request' : 'requests'}
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className={styles.statusTabs}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tabBtn} ${currentTab === tab.id ? styles.active : ''}`}
              onClick={() => setCurrentTab(tab.id)}
            >
              <span>{tab.label}</span>
              <span className={styles.tabCount}>{tabCounts[tab.id] || 0}</span>
            </button>
          ))}
        </div>

        {/* Table Content & States */}
        {loading ? (
          /* 1. Loading State: Instagram Shimmer Skeleton */
          <div className={styles.tableWrapper}>
            <TableSkeleton rows={7} />
          </div>
        ) : error ? (
          /* 2. Error State with Retry */
          <StateFeedback
            type="error"
            title="Failed to Load Sample Requests"
            message={error}
            actionLabel="Retry"
            onAction={fetchRequests}
          />
        ) : filteredRows.length === 0 ? (
          /* 3. Empty State */
          <StateFeedback
            type="empty"
            title={searchTerm ? 'No matching requests found' : 'No sample requests yet'}
            message={
              searchTerm
                ? 'Try adjusting your search criteria or switching status tabs.'
                : 'Click + New Request to submit your first trial sample request.'
            }
            actionLabel={!isAdmin && !searchTerm ? '+ New Request' : undefined}
            onAction={!isAdmin && !searchTerm ? () => navigate('/sample_portal') : undefined}
          />
        ) : (
          /* 4. Success State: Interactive Table */
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th style={{ minWidth: '110px' }}>Ref No.</th>
                  <th style={{ minWidth: '130px' }}>Requested Date</th>
                  <th style={{ minWidth: '150px' }}>Applicant</th>
                  <th style={{ minWidth: '120px' }}>Location</th>
                  <th style={{ minWidth: '130px' }}>Type</th>
                  <th style={{ minWidth: '140px' }}>Category</th>
                  <th style={{ minWidth: '80px' }}>Qty</th>
                  <th style={{ minWidth: '110px' }}>Status</th>
                  <th style={{ minWidth: '140px' }}>{isAdmin ? 'Actions' : 'Action'}</th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((row) => {
                  const issued = row.d_created_at ? String(row.d_created_at).slice(0, 10) : '—';
                  const isClosed = row.s_status === 'Closed';

                  return (
                    <tr key={row.n_id}>
                      {/* Ref No (Click to View) */}
                      <td>
                        <span
                          className={styles.cellRef}
                          onClick={() => setDetailRow(row)}
                          title="Click to view request details"
                        >
                          {buildSampleRefNo(row.n_id)}
                        </span>
                      </td>

                      {/* Requested Date */}
                      <td>{esc(issued)}</td>

                      {/* Applicant */}
                      <td>
                        <span style={{ fontWeight: 500, color: '#0f172a' }}>
                          {esc(row.s_applicant_name)}
                        </span>
                      </td>

                      {/* Location */}
                      <td>{esc(row.s_epl_location || '—')}</td>

                      {/* Type */}
                      <td>{esc(row.s_type || '—')}</td>

                      {/* Category */}
                      <td>
                        <span className={styles.categoryBadge}>
                          {esc(row.s_category || '—')}
                        </span>
                      </td>

                      {/* Qty */}
                      <td>
                        <strong>{row.n_quantity ?? '—'}</strong>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            isClosed ? styles.statusClosed : styles.statusOpen
                          }`}
                        >
                          {esc(row.s_status || 'Open')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className={styles.actionGroup}>
                          <button
                            className={styles.btnView}
                            onClick={() => setDetailRow(row)}
                            title="View full request details"
                          >
                            View
                          </button>

                          {/* Admin: Workflow button on Open requests */}
                          {isAdmin && !isClosed && (
                            <button
                              className={styles.btnWorkflow}
                              onClick={() => setWorkflowRow(row)}
                              title="Update workflow status & details"
                            >
                              Workflow
                            </button>
                          )}

                          {/* Normal User: Edit button on Open requests */}
                          {!isAdmin && !isClosed && (
                            <button
                              className={styles.btnEdit}
                              onClick={() => setEditRow(row)}
                              title="Edit request details"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <SamplePortalFooter />

      {/* Modals */}
      {detailRow && (
        <DetailModal
          isOpen={Boolean(detailRow)}
          onClose={() => setDetailRow(null)}
          requestData={detailRow}
          onOpenAttachment={(path) => setPreviewFilePath(path)}
        />
      )}

      {workflowRow && (
        <WorkflowModal
          isOpen={Boolean(workflowRow)}
          onClose={() => setWorkflowRow(null)}
          requestData={workflowRow}
          onSaved={handleWorkflowSaved}
        />
      )}

      {editRow && (
        <EditRequestModal
          isOpen={Boolean(editRow)}
          onClose={() => setEditRow(null)}
          requestData={editRow}
          onSaved={handleEditSaved}
        />
      )}

      {previewFilePath && (
        <AttachmentPreviewModal
          isOpen={Boolean(previewFilePath)}
          onClose={() => setPreviewFilePath('')}
          filePath={previewFilePath}
        />
      )}

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
