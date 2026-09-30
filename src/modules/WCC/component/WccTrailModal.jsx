import React, { useState, useEffect } from 'react';
import { X, GitCommit, Clock, CheckCircle2 } from 'lucide-react';
import styles from '../styles/WccModals.module.css';
import tableStyles from '../styles/WccTables.module.css';
import { BASE_URL, formatName } from '../constants/wccConstants';

export default function WccTrailModal({ isOpen, onClose, requestId }) {
  const [trailData, setTrailData] = useState([]);
  const [activeLevel, setActiveLevel] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !requestId) return;

    let isMounted = true;
    setLoading(true);

    fetch(`${BASE_URL}/workcompletionRoute/get_work_trail?n_id=${encodeURIComponent(requestId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        const list = Array.isArray(data) ? data : [];
        setTrailData(list);

        // Find active level
        const pendingStep = list.find((item) => String(item.s_activity) === '0');
        if (pendingStep) {
          setActiveLevel(Number(pendingStep.trail_level));
        } else {
          setActiveLevel(null);
        }
      })
      .catch((err) => {
        console.error('Error fetching work trail:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, requestId]);

  if (!isOpen) return null;

  const getStatusText = (item) => {
    const act = String(item.s_activity);
    const lvl = Number(item.trail_level);

    if (act === '-1') return 'Send Back';
    if (lvl === 1 && act === '1') return 'Initiated';
    if (lvl === 1 && act === '2') return 'In Draft';
    if (lvl === 1 && act === '0') return 'Pending';
    if ((lvl === 2 || lvl === 3 || lvl > 5) && act === '1') return 'Approved';
    if ((lvl === 2 || lvl === 3 || lvl === 4) && act === '0') return 'Pending';
    if ((lvl === 5 || lvl > 5) && act === '0') return '- -';
    if (lvl === 4 && act === '1') return 'Completed';
    return '-';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
      });
    } catch {
      return '';
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modalContent} ${styles.lg}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            <GitCommit size={20} color="#062b67" />
            Work Completion Trail (Request #{requestId})
          </h3>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Stepper Progress */}
          <div className={styles.trailContainer}>
            <div className={styles.trailLine}></div>
            <div className={styles.trailPoints}>
              {[1, 2, 3, 4, 5].map((lvl) => (
                <div
                  key={lvl}
                  className={`${styles.trailPoint} ${activeLevel === lvl ? styles.active : ''}`}
                >
                  {lvl}
                </div>
              ))}
            </div>
          </div>

          {/* Trail Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              Loading audit trail...
            </div>
          ) : (
            <div className={tableStyles.tableResponsive}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Action Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Remark</th>
                    <th>Forwarded To</th>
                  </tr>
                </thead>
                <tbody>
                  {trailData.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8' }}>
                        No audit records found.
                      </td>
                    </tr>
                  ) : (
                    trailData.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{formatName(item.s_approver)}</td>
                        <td>{formatDate(item.d_updated_date)}</td>
                        <td>{formatTime(item.d_updated_date)}</td>
                        <td>
                          <span
                            className={`${tableStyles.badge} ${
                              getStatusText(item).includes('Approved') ||
                              getStatusText(item).includes('Completed')
                                ? tableStyles.badgeCompleted
                                : getStatusText(item).includes('Pending')
                                ? tableStyles.badgePending
                                : getStatusText(item).includes('Send Back')
                                ? tableStyles.badgeRejected
                                : tableStyles.badgeInProcess
                            }`}
                          >
                            {getStatusText(item)}
                          </span>
                        </td>
                        <td>{item.remark || '—'}</td>
                        <td>{item.forwarded_to || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={tableStyles.pageBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
