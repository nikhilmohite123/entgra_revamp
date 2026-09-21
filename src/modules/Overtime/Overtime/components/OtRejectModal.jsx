import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import styles from '../styles/overtime.module.css';

export default function OtRejectModal({
  isOpen,
  onClose,
  rejectData,
  onConfirmReject,
  loading = false,
}) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReason('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please Specify the reason for rejection....');
      return;
    }
    onConfirmReject(reason);
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{ maxWidth: '480px' }}
      >
        <div className={styles.modalHeader}>
          <h3>Reject Overtime Request</h3>
          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div style={{ marginBottom: '12px', fontSize: '14px', color: '#1e293b' }}>
              <strong>Specify reason for rejecting overtime of </strong>
              <span style={{ color: '#e11d48', fontWeight: 600 }}>
                {rejectData?.s_emp_name || 'Employee'}
              </span>
            </div>

            <textarea
              className={styles.textareaField}
              id="s_reject_reason"
              name="s_reject_reason"
              placeholder="Enter rejection reason here..."
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              autoFocus
            />
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={`${styles.btnAction}`}
              style={{ backgroundColor: '#e2e8f0', color: '#475569' }}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.btnAction} ${styles.btnHourMaster}`}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
