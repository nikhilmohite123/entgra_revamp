import React, { useEffect } from 'react';
import { Paperclip } from 'lucide-react';
import styles from '../styles/SampleModals.module.css';
import { buildSampleRefNo, esc } from '../constants/samplePortalConstants';

export default function DetailModal({ isOpen, onClose, requestData, onOpenAttachment }) {
  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !requestData) return null;

  const row = requestData;
  const issued = row.d_created_at ? String(row.d_created_at).slice(0, 10) : '—';
  const deliv = row.d_tentative_delivery ? String(row.d_tentative_delivery).slice(0, 10) : '—';
  const statusClass =
    row.s_status === 'Closed' ? styles.statusClosed : styles.statusOpen;

  const tubeTypeDisplay = row.s_tube_type_laminated_input
    ? `Laminated - ${row.s_tube_type_laminated_input}`
    : row.s_laminated || '—';

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div>
            <div className={styles.modalBadge}>Request Details</div>
            <h2 className={styles.modalTitle}>
              Sample Request {buildSampleRefNo(row.n_id)}
            </h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {/* Body Content */}
        <div className={styles.modalBody}>
          {/* Request Info */}
          <div className={styles.detailSectionTitle}>Request Info</div>
          <div className={styles.detailGrid}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Ref No.</span>
              <span className={styles.detailVal}>{buildSampleRefNo(row.n_id)}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Status</span>
              <span className={styles.detailVal}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 10px',
                    borderRadius: '100px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: row.s_status === 'Closed' ? '#f1f5f9' : '#eff6ff',
                    color: row.s_status === 'Closed' ? '#475569' : '#1e40af',
                    border: `1px solid ${row.s_status === 'Closed' ? '#cbd5e1' : '#93c5fd'}`,
                  }}
                  className={statusClass}
                >
                  {esc(row.s_status)}
                </span>
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Requested Date</span>
              <span className={styles.detailVal}>{issued}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Applicant</span>
              <span className={styles.detailVal}>{esc(row.s_applicant_name)}</span>
            </div>
            <div className={`${styles.detailRow} ${styles.full}`}>
              <span className={styles.detailLabel}>EPL Location</span>
              <span className={styles.detailVal}>{esc(row.s_epl_location || '—')}</span>
            </div>
          </div>

          {/* Section 1 — Tube Specification */}
          <div className={styles.detailSectionTitle}>Section 1 — Tube Specification</div>
          <div className={styles.detailGrid}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Type</span>
              <span className={styles.detailVal}>{esc(row.s_type || '—')}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Category</span>
              <span className={styles.detailVal}>{esc(row.s_category || '—')}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Print Type</span>
              <span className={styles.detailVal}>{esc(row.s_print_type || '—')}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Tube Diameter (mm)</span>
              <span className={styles.detailVal}>{row.n_tube_diameter ?? '—'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Printed Length (mm)</span>
              <span className={styles.detailVal}>{row.n_printed_length ?? '—'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Commercial Length (mm)</span>
              <span className={styles.detailVal}>{row.n_commercial_length ?? '—'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Web Type</span>
              <span className={styles.detailVal}>{esc(row.s_web_type || '—')}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Tube Type</span>
              <span className={styles.detailVal}>{tubeTypeDisplay}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Tube Shape</span>
              <span className={styles.detailVal}>{esc(row.s_tube_shape || '—')}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Shoulder Color</span>
              <span className={styles.detailVal}>{esc(row.s_shoulder_color || '—')}</span>
            </div>
            <div className={`${styles.detailRow} ${styles.full}`}>
              <span className={styles.detailLabel}>Thread Type</span>
              <span className={styles.detailVal}>{esc(row.s_thread_type || '—')}</span>
            </div>
          </div>

          {/* Section 2 — Seal & Orifice */}
          <div className={styles.detailSectionTitle}>Section 2 — Seal &amp; Orifice</div>
          <div className={styles.detailGrid}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Orifice (mm)</span>
              <span className={styles.detailVal}>{row.n_orifice ?? '—'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Top Seal</span>
              <span className={styles.detailVal}>{esc(row.s_top_seal || '—')}</span>
            </div>
          </div>

          {/* Section 3 — Cap & Transportation */}
          <div className={styles.detailSectionTitle}>Section 3 — Cap &amp; Transportation</div>
          <div className={styles.detailGrid}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Cap Type</span>
              <span className={styles.detailVal}>{esc(row.s_cap_code || '—')}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Cap Orientation</span>
              <span className={styles.detailVal}>{esc(row.s_cap_orientation || '—')}</span>
            </div>
            <div className={`${styles.detailRow} ${styles.full}`}>
              <span className={styles.detailLabel}>Transportation</span>
              <span className={styles.detailVal}>{esc(row.s_transportation || '—')}</span>
            </div>
          </div>

          {/* Section 4 — Quantity & Remarks */}
          <div className={styles.detailSectionTitle}>Section 4 — Quantity &amp; Remarks</div>
          <div className={styles.detailGrid}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Quantity</span>
              <span className={styles.detailVal}>{row.n_quantity ?? '—'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Attachment</span>
              <span className={styles.detailVal}>
                {row.s_attachment ? (
                  <button
                    type="button"
                    className={styles.attachLink}
                    onClick={() => onOpenAttachment(row.s_attachment)}
                    style={{ background: 'none', border: 'none', padding: 0 }}
                  >
                    <Paperclip size={14} />
                    <span>View Attachment</span>
                  </button>
                ) : (
                  '—'
                )}
              </span>
            </div>
            <div className={`${styles.detailRow} ${styles.full}`}>
              <span className={styles.detailLabel}>Special Remarks</span>
              <span className={styles.detailVal}>{esc(row.s_special_remarks || '—')}</span>
            </div>
          </div>

          {/* Workflow Response */}
          <div className={styles.detailSectionTitle}>Workflow Response</div>
          <div className={styles.detailGrid}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Doable</span>
              <span className={styles.detailVal}>{esc(row.s_doable || '—')}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Tentative Delivery</span>
              <span className={styles.detailVal}>{deliv}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Cost (INR)</span>
              <span className={styles.detailVal}>
                {row.n_tentative_cost != null
                  ? `₹${parseFloat(row.n_tentative_cost).toFixed(2)}`
                  : '—'}
              </span>
            </div>
            <div className={`${styles.detailRow} ${styles.full}`}>
              <span className={styles.detailLabel}>Remark</span>
              <span className={styles.detailVal}>{esc(row.s_remark || '—')}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
