import React from 'react';
import { X } from 'lucide-react';
import styles from '../styles/overtime.module.css';
import { get12hrsformat } from '../constants/overtimeConstants';

export default function OtAuditTrailModal({ isOpen, onClose, details, trailList, loading }) {
  if (!isOpen) return null;

  const empName = details?.s_emp_name
    ? details.s_emp_name.split('--')[0]
    : details?.empname || '-';

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className={styles.modalHeader}>
          <h3>Approval Process Details</h3>
          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {loading ? (
            <div className={styles.loadingSpinner}>Loading details...</div>
          ) : (
            <>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Employee Code:</span>
                  <span className={styles.detailValue}>{details?.n_emp_id || '-'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Employee Name:</span>
                  <span className={styles.detailValue}>{empName}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Reason for OT:</span>
                  <span className={styles.detailValue}>{details?.s_OT_reason || '-'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Claim OT Date:</span>
                  <span className={styles.detailValue}>{details?.s_OT_date || '-'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>OT Start Time:</span>
                  <span className={styles.detailValue}>
                    {get12hrsformat(details?.d_start_time)}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>OT End Time:</span>
                  <span className={styles.detailValue}>
                    {get12hrsformat(details?.d_end_time)}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Total No of OT Used (In min):</span>
                  <span className={styles.detailValue}>{details?.total_ot || '-'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Fixed OT (In min):</span>
                  <span className={styles.detailValue}>{details?.n_allow_ot_hr || '-'}</span>
                </div>
              </div>

              <h4 className={styles.auditSectionTitle}>Audit Trail</h4>
              <div className={styles.tableWrapper}>
                <table className={styles.otTable}>
                  <thead>
                    <tr>
                      <th>Level</th>
                      <th>Approval Name</th>
                      <th>Status</th>
                      <th>Responded Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trailList && trailList.length > 0 ? (
                      trailList.map((item, idx) => {
                        const sts =
                          item.n_status === 0
                            ? 'Rejected'
                            : item.n_status === 1
                            ? 'Approved'
                            : 'Pending';
                        const resDate = item.d_date || '-';

                        let statusClass = styles.statusOpen;
                        if (item.n_status === 1) statusClass = styles.statusApproved;
                        else if (item.n_status === 0) statusClass = styles.statusRejected;

                        return (
                          <tr key={idx}>
                            <td>{item.n_level || '-'}</td>
                            <td>{item.s_name || '-'}</td>
                            <td>
                              <span className={`${styles.statusBadge} ${statusClass}`}>
                                {sts}
                              </span>
                            </td>
                            <td>{resDate}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="4" className={styles.emptyState}>
                          No audit trail records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            className={`${styles.btnAction} ${styles.btnApply}`}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
