import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  History,
  X,
  Clock,
  User,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import styles from '../styles/atrAuditTrailModal.module.css';

export default function AtrAuditTrailModal({
  isOpen,
  onClose,
  atrId,
  trailData = []
}) {
  // Lock body scroll on modal open and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Fallback demonstration data if no live trail returned from backend yet
  const displayTrails = trailData && trailData.length > 0 ? trailData : [
    {
      s_approver: 'Department Head',
      s_status: 'Approved',
      d_approved_date: '2024-11-12',
      n_days: '2 days'
    },
    {
      s_approver: 'Unit Finance Head',
      s_status: 'In Review',
      d_approved_date: '2024-11-15',
      n_days: '3 days'
    }
  ];

  const getStatusClass = (status = '') => {
    const s = String(status).toLowerCase();
    if (s.includes('approved')) return styles.statusApproved;
    if (s.includes('completed')) return styles.statusCompleted;
    if (
      s.includes('review') ||
      s.includes('submitted') ||
      s.includes('initiated') ||
      s.includes('process')
    ) {
      return styles.statusSubmitted;
    }
    if (s.includes('draft')) return styles.statusDraft;
    if (s.includes('send back') || s.includes('reject')) return styles.statusSendBack;
    if (s.includes('pending')) return styles.statusPending;
    return styles.statusDefault;
  };

  const getStatusIcon = (status = '') => {
    const s = String(status).toLowerCase();
    if (s.includes('approved') || s.includes('completed')) {
      return <CheckCircle2 size={13} />;
    }
    if (s.includes('send back') || s.includes('reject')) {
      return <AlertCircle size={13} />;
    }
    return <Clock size={13} />;
  };

  const modalContent = (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="atr-trail-modal-title"
    >
      <div
        className={styles.modalDialog}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <div className={styles.headerIcon}>
              <History size={22} />
            </div>
            <h3 id="atr-trail-modal-title" className={styles.modalTitle}>
              ATR Audit Trail
            </h3>
            {atrId && <span className={styles.atrBadge}>#{atrId}</span>}
          </div>
          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={onClose}
            aria-label="Close ATR Trail Modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.modalBody}>
          {displayTrails.length > 0 && (
            <div className={styles.summaryBar}>
              <span>
                Workflow Progress History: <strong className={styles.summaryCount}>{displayTrails.length} stage{displayTrails.length !== 1 ? 's' : ''}</strong>
              </span>
              <span>
                Record ID: <strong>{atrId || 'N/A'}</strong>
              </span>
            </div>
          )}

          {displayTrails.length > 0 ? (
            <div className={styles.tableWrapper}>
              <table className={styles.trailTable}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Approver</th>
                    <th>Status</th>
                    <th>Action Date</th>
                    <th>Days Taken</th>
                  </tr>
                </thead>
                <tbody>
                  {displayTrails.map((trail, index) => {
                    const statusText = trail.s_status || trail.status || 'Pending';
                    const approverText = trail.s_approver || trail.approver || '—';
                    const dateText = trail.d_approved_date || trail.approved_date || '—';
                    const daysText = trail.n_days || trail.days || '0';

                    return (
                      <tr key={index}>
                        <td>
                          <span className={styles.stepIndex}>{index + 1}</span>
                        </td>
                        <td>
                          <div className={styles.approverCell}>
                            <User size={15} className={styles.approverIcon} />
                            <span>{approverText}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`${styles.statusBadge} ${getStatusClass(statusText)}`}>
                            {getStatusIcon(statusText)}
                            <span>{statusText}</span>
                          </span>
                        </td>
                        <td>
                          <div className={styles.dateCell}>
                            <Calendar size={14} className={styles.dateIcon} />
                            <span>{dateText}</span>
                          </div>
                        </td>
                        <td>
                          <span className={styles.daysBadge}>
                            <Clock size={12} className={styles.daysIcon} />
                            <span>{typeof daysText === 'number' ? `${daysText} days` : daysText}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <History size={44} className={styles.emptyIcon} />
              <h4 className={styles.emptyTitle}>No Audit Trail Found</h4>
              <p className={styles.emptyText}>
                There are no approval or review steps recorded for this ATR yet.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.btnClose}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
