import React, { useEffect } from 'react';
import styles from '../styles/viewModal.module.css';
import { MODULE_LABELS, buildRefNo, esc } from '../constants/ideaHubConstants';

export default function ViewModal({ row, onClose, onOpenLightbox }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!row) return null;

  const cfg = MODULE_LABELS[row.s_module_type] || { label: row.s_module_type || 'Idea' };
  const files = Array.isArray(row.files) ? row.files : [];
  const contacts = Array.isArray(row.contacts) ? row.contacts : [];
  const isOthers = row.s_module_type === 'others';
  const isCommercial = (row.s_main_module || '').toLowerCase().includes('commercialised');
  const date = row.d_created_at
    ? new Date(row.d_created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.editModal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.editModalHeader}>
          <div>
            <div className={styles.editModalBadge}>{cfg.label}</div>
            <h2 className={styles.editModalTitle}>Innovation Entry Details</h2>
          </div>
          <button className={styles.editCloseBtn} onClick={onClose} aria-label="Close details">
            ×
          </button>
        </div>

        {/* Body */}
        <div className={styles.editModalBody}>
          <div className={styles.viewRow}>
            <div className={styles.viewLabel}>Reference No.</div>
            <div className={styles.viewValue}>
              <span className={styles.cellRef}>{buildRefNo(row)}</span>
            </div>
          </div>

          <div className={styles.viewRow}>
            <div className={styles.viewLabel}>Team Member</div>
            <div className={styles.viewValue}>{esc(row.s_team_member)}</div>
          </div>

          {!isOthers ? (
            <>
              {row.t_feature && (
                <div className={styles.viewRow}>
                  <div className={styles.viewLabel}>Feature</div>
                  <div className={styles.viewValue}>{row.t_feature}</div>
                </div>
              )}
              {row.t_benifit && (
                <div className={styles.viewRow}>
                  <div className={styles.viewLabel}>Benefit</div>
                  <div className={styles.viewValue}>{row.t_benifit}</div>
                </div>
              )}
              {row.t_application && (
                <div className={styles.viewRow}>
                  <div className={styles.viewLabel}>Application</div>
                  <div className={styles.viewValue}>{row.t_application}</div>
                </div>
              )}
            </>
          ) : (
            <>
              {row.s_innovation_details && (
                <div className={styles.viewRow}>
                  <div className={styles.viewLabel}>Innovation Details</div>
                  <div className={styles.viewValue}>{row.s_innovation_details}</div>
                </div>
              )}
              {row.s_comments && (
                <div className={styles.viewRow}>
                  <div className={styles.viewLabel}>Comments</div>
                  <div className={styles.viewValue}>{row.s_comments}</div>
                </div>
              )}
            </>
          )}

          {files.length > 0 && (
            <div className={styles.viewRow}>
              <div className={styles.viewLabel}>Images</div>
              <div className={styles.viewValue}>
                <div className={styles.cellImages}>
                  {files.map((f, idx) => (
                    <img
                      key={f.n_file_id || idx}
                      className={styles.cellImgThumb}
                      style={{ width: '70px', height: '70px' }}
                      src={`/bpmn${f.s_file_path}`}
                      alt="Thumbnail"
                      onClick={() => onOpenLightbox(`/bpmn${f.s_file_path}`)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className={styles.viewRow}>
            <div className={styles.viewLabel}>Company</div>
            <div className={styles.viewValue}>{esc(row.s_company_name)}</div>
          </div>

          <div className={styles.viewRow}>
            <div className={styles.viewLabel}>Country</div>
            <div className={styles.viewValue}>
              <span className={styles.countryBadge}>{esc(row.s_country)}</span>
            </div>
          </div>

          <div className={styles.viewRow}>
            <div className={styles.viewLabel}>Location</div>
            <div className={styles.viewValue}>{esc(row.s_location)}</div>
          </div>

          {row.s_links && (
            <div className={styles.viewRow}>
              <div className={styles.viewLabel}>Links</div>
              <div className={styles.viewValue}>
                <a href={row.s_links} target="_blank" rel="noopener noreferrer">
                  {row.s_links}
                </a>
              </div>
            </div>
          )}

          {isCommercial && (
            <>
              {row.s_specification && (
                <div className={styles.viewRow}>
                  <div className={styles.viewLabel}>Specification</div>
                  <div className={styles.viewValue}>{row.s_specification}</div>
                </div>
              )}
              {row.s_production_unit && (
                <div className={styles.viewRow}>
                  <div className={styles.viewLabel}>Production Unit</div>
                  <div className={styles.viewValue}>{row.s_production_unit}</div>
                </div>
              )}
              {row.n_price_per_1000 != null && (
                <div className={styles.viewRow}>
                  <div className={styles.viewLabel}>Price / 1000 (USD)</div>
                  <div className={styles.viewValue}>
                    <span className={styles.cellPrice}>
                      ${parseFloat(row.n_price_per_1000).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {contacts.length > 0 && (
            <div className={styles.viewRow}>
              <div className={styles.viewLabel}>Contacts</div>
              <div className={styles.viewValue}>
                {contacts.map((c, i) => (
                  <div key={c.n_cont_id || i} className={styles.viewContactCard}>
                    {contacts.length > 1 && (
                      <div className={styles.viewContactIdx}>Contact {i + 1}</div>
                    )}
                    <div className={styles.viewContactField}>
                      <span className={styles.vcLabel}>Name:</span>
                      <span className={styles.vcVal}>{c.s_contact_name || '—'}</span>
                    </div>
                    <div className={styles.viewContactField}>
                      <span className={styles.vcLabel}>Email:</span>
                      <span className={styles.vcVal}>
                        {c.s_email ? (
                          <a href={`mailto:${c.s_email}`}>{c.s_email}</a>
                        ) : (
                          '—'
                        )}
                      </span>
                    </div>
                    <div className={styles.viewContactField}>
                      <span className={styles.vcLabel}>Phone:</span>
                      <span className={styles.vcVal}>{c.s_phone || '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.viewRow}>
            <div className={styles.viewLabel}>Submitted On</div>
            <div className={styles.viewValue}>{date}</div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.editModalFooter}>
          <button className={styles.btnCancel} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
