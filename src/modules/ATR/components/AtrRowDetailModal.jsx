import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  FileText,
  Building2,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  ShieldCheck,
  Layers,
  Activity,
  Edit,
  ClipboardList,
  MapPin,
  Briefcase,
  AlertTriangle,
  MessageSquare,
  Copy,
  Check,
  History,
  LayoutGrid,
  Loader2,
  Table
} from 'lucide-react';
import styles from '../styles/atrRowDetailModal.module.css';

// Case-insensitive & format-resilient field extractor
const getField = (obj, ...keys) => {
  if (!obj || typeof obj !== 'object') return '';
  // 1. Exact match search
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && String(obj[k]).trim() !== '') {
      return String(obj[k]).trim();
    }
  }
  // 2. Normalized search (ignoring case, underscores, spaces, dashes)
  const clean = (str) => String(str).toLowerCase().replace(/[^a-z0-9]/g, '');
  const targetNorms = keys.map(clean);
  for (const prop of Object.keys(obj)) {
    const propNorm = clean(prop);
    if (targetNorms.includes(propNorm)) {
      const val = obj[prop];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        return String(val).trim();
      }
    }
  }
  return '';
};

// Key beautifier for complete raw fields table
const formatKeyLabel = (key) => {
  return String(key)
    .replace(/^s_|^n_|^d_/i, '')
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
};

export default function AtrRowDetailModal({
  isOpen,
  onClose,
  data,
  onViewTrail,
  onEdit
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [copiedField, setCopiedField] = useState(null);

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

  if (!isOpen || !data) return null;

  const row = data;

  // Comprehensive field extraction using case-insensitive getter
  const atrId = getField(row, 'n_Atr_id', 'n_atr_id', 'id', 'atr_id', 'n_id') || '—';
  const auditingParty = getField(row, 's_auditing_party_name', 'auditing_party_name', 'auditingParty', 's_auditingParty') || '—';
  const financialPeriod = getField(row, 's_financial_period', 'financial_period', 'financialPeriod', 's_financialYear') || '2024-25';
  const group = getField(row, 's_group', 'group') || '—';
  const location = getField(row, 's_location', 'location', 's_plant_name', 'plant_name', 'S_LOCATION') || '—';
  const count = getField(row, 'n_count', 'count') !== '' ? getField(row, 'n_count', 'count') : 0;
  const area = getField(row, 's_area', 'area') || '—';
  const broadTheme = getField(row, 's_broadTheme', 'broadTheme', 'broad_theme', 's_broad_theme', 'theme') || '—';
  const observation = getField(row, 's_observation', 'observation', 's_obs', 'obs') || '';
  const actionPlanned = getField(row, 's_actionPlanned', 'actionPlanned', 'action_planned', 's_action_planned', 'action') || '';
  const rating = getField(row, 's_rating', 'rating') || 'Medium';
  const dept = getField(row, 's_dept', 'department', 's_department', 'dept') || '—';
  const primeResp = getField(row, 's_primeResponsibility', 'primeResponsibility', 'prime_responsibility', 's_prime_responsibility', 's_emp_name', 'emp_name') || '—';
  const targetDate = getField(row, 's_targetDate', 'targetDate', 'target_date', 's_target_date', 'd_target_date') || '—';
  const revisedTargetDate = getField(row, 's_revised_targetDate', 'revised_targetDate', 'revised_target_date', 's_revised_target_date', 'd_revised_target_date') || '—';
  const status = getField(row, 's_status', 'status', 's_sts') || 'Pending';
  const approver = getField(row, 's_approver', 'approver') || '—';
  const role = getField(row, 'role', 's_role', 's_role_display') || '—';
  const level = getField(row, 'lvl_trail', 'n_level', 'level') || '1';
  const deptRemarks = getField(row, 's_remarks', 's_dept_remarks', 'remarks', 'dept_remarks') || '';
  const unitFinRemarks = getField(row, 's_unit_fin_remarks', 'unit_fin_remarks', 'unit_finance_head_remark') || '';
  const unitHeadRemarks = getField(row, 's_unit_head_remark', 'unit_head_remark', 'unithead_remark') || '';
  const attachment = getField(row, 'attachmentName', 'files', 's_attachment', 'attachment', 'file_name') || '';
  const createdDate = getField(row, 'd_created_date', 'created_date', 'created_at', 'd_created_at') || '';
  const updatedDate = getField(row, 'd_updated_date', 'updated_date', 'updated_at', 'd_updated_at') || '';
  const createdBy = getField(row, 's_created_by', 'created_by') || '';
  const trail = Array.isArray(row.trail) ? row.trail : [];
  const isLoading = Boolean(row.loadingFullDetails);

  // Copy to clipboard helper
  const handleCopy = (text, fieldKey) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 1800);
  };

  // Level mapping
  const getLevelLabel = (lvl) => {
    const sLvl = String(lvl || '');
    if (sLvl === '-1') return 'Send Back';
    if (sLvl === '1') return 'Initiated (Level 1)';
    if (sLvl === '2') return 'Department Head (Level 2)';
    if (sLvl === '3') return 'Unit Finance Head (Level 3)';
    if (sLvl === '4') return 'Unit Head (Level 4)';
    if (sLvl === '5') return 'Completed (Level 5)';
    return sLvl ? `Level ${sLvl}` : '—';
  };

  // Status Styling
  const getStatusBadge = (st = '') => {
    const s = String(st).toLowerCase();
    if (s.includes('completed')) {
      return (
        <span className={`${styles.statusBadge} ${styles.statusCompleted}`}>
          <CheckCircle2 size={13} /> Completed
        </span>
      );
    }
    if (s.includes('send back') || s.includes('reject')) {
      return (
        <span className={`${styles.statusBadge} ${styles.statusSendBack}`}>
          <AlertCircle size={13} /> Send Back
        </span>
      );
    }
    if (s.includes('process') || s.includes('review') || s.includes('draft')) {
      return (
        <span className={`${styles.statusBadge} ${styles.statusProcess}`}>
          <Activity size={13} /> {st || 'In Process'}
        </span>
      );
    }
    return (
      <span className={`${styles.statusBadge} ${styles.statusPending}`}>
        <Clock size={13} /> {st || 'Pending'}
      </span>
    );
  };

  // Rating Badge
  const getRatingBadge = (r = '') => {
    const s = String(r).toLowerCase();
    if (s === 'high') {
      return <span className={styles.ratingHigh}>High</span>;
    }
    if (s === 'low') {
      return <span className={styles.ratingLow}>Low</span>;
    }
    return <span className={styles.ratingMedium}>{r || 'Medium'}</span>;
  };

  const modalContent = (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="atr-detail-modal-title"
    >
      <div
        className={styles.modalDialog}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <div className={styles.headerIconWrap}>
              <FileText size={22} />
            </div>
            <div className={styles.modalTitleGroup}>
              <h2 id="atr-detail-modal-title" className={styles.modalTitle}>
                ATR Record Details
                {atrId !== '—' && (
                  <span className={styles.idBadge}>#{atrId}</span>
                )}
              </h2>
              <span className={styles.modalSubtitle}>
                {auditingParty} • Financial Period: {financialPeriod}
              </span>
            </div>
          </div>
          <div className={styles.modalHeaderRight}>
            {getStatusBadge(status)}
            <button
              type="button"
              className={styles.modalCloseBtn}
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs inside modal */}
        <div className={styles.modalNavTabs}>
          <button
            type="button"
            className={`${styles.tabItem} ${activeTab === 'all' ? styles.tabItemActive : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <LayoutGrid size={14} />
            <span>All Details</span>
          </button>
          <button
            type="button"
            className={`${styles.tabItem} ${activeTab === 'findings' ? styles.tabItemActive : ''}`}
            onClick={() => setActiveTab('findings')}
          >
            <ShieldCheck size={14} />
            <span>Findings &amp; Action Plan</span>
          </button>
          <button
            type="button"
            className={`${styles.tabItem} ${activeTab === 'entity' ? styles.tabItemActive : ''}`}
            onClick={() => setActiveTab('entity')}
          >
            <Building2 size={14} />
            <span>Entity &amp; Timeline</span>
          </button>
          <button
            type="button"
            className={`${styles.tabItem} ${activeTab === 'remarks' ? styles.tabItemActive : ''}`}
            onClick={() => setActiveTab('remarks')}
          >
            <MessageSquare size={14} />
            <span>Reviewer Remarks</span>
          </button>
          {trail.length > 0 && (
            <button
              type="button"
              className={`${styles.tabItem} ${activeTab === 'trail' ? styles.tabItemActive : ''}`}
              onClick={() => setActiveTab('trail')}
            >
              <History size={14} />
              <span>Audit Trail ({trail.length})</span>
            </button>
          )}
          <button
            type="button"
            className={`${styles.tabItem} ${activeTab === 'raw' ? styles.tabItemActive : ''}`}
            onClick={() => setActiveTab('raw')}
          >
            <Table size={14} />
            <span>Raw Field Values</span>
          </button>
        </div>

        {/* Modal Body with vertical scroll */}
        <div className={styles.modalBody}>
          {/* Subtle loading indicator if async data is fetching */}
          {isLoading && (
            <div className={styles.loadingBanner}>
              <Loader2 size={15} className="animate-spin" />
              <span>Fetching latest complete database records &amp; audit history...</span>
            </div>
          )}

          {/* Top Summary Strip (always visible) */}
          <div className={styles.topSummaryStrip}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>
                <Building2 size={11} /> Auditing Party
              </span>
              <span className={styles.summaryVal}>{auditingParty}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>
                <MapPin size={11} /> Location / Plant
              </span>
              <span className={styles.summaryVal} style={{ color: '#003c96' }}>
                {location}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>
                <Briefcase size={11} /> Department
              </span>
              <span className={styles.summaryVal}>{dept}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>
                <Activity size={11} /> Workflow Level
              </span>
              <span className={styles.summaryVal}>{getLevelLabel(level)}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Rating</span>
              <div>{getRatingBadge(rating)}</div>
            </div>
          </div>

          {/* Section 1: Observation & Action Planned */}
          {(activeTab === 'all' || activeTab === 'findings') && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionHeaderTitle}>
                  <ShieldCheck size={18} className={styles.sectionIcon} />
                  <span>Audit Findings &amp; Action Plan</span>
                </div>
              </div>
              <div className={styles.sectionBody}>
                <div className={styles.dataGrid2Col} style={{ marginBottom: '1.25rem' }}>
                  <div className={styles.dataField}>
                    <span className={styles.fieldLabel}>Area</span>
                    <span className={styles.fieldValueStrong}>{area}</span>
                  </div>
                  <div className={styles.dataField}>
                    <span className={styles.fieldLabel}>Broad Theme</span>
                    <span className={styles.fieldValueStrong}>{broadTheme}</span>
                  </div>
                </div>

                {/* Observation Block */}
                <div className={styles.richTextCard}>
                  <div className={styles.richTextHeader}>
                    <div className={styles.richTextLabel}>
                      <AlertTriangle size={16} color="#003c96" />
                      <span>Observation</span>
                    </div>
                    {observation && (
                      <button
                        type="button"
                        className={styles.copyBtn}
                        onClick={() => handleCopy(observation, 'obs')}
                        title="Copy Observation"
                      >
                        {copiedField === 'obs' ? <Check size={12} color="#15803d" /> : <Copy size={12} />}
                        <span>{copiedField === 'obs' ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                  <div className={styles.richTextContent}>
                    {observation || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No detailed observation recorded.</span>}
                  </div>
                </div>

                {/* Action Planned Block */}
                <div className={styles.richTextCardPlanned}>
                  <div className={styles.richTextHeader}>
                    <div className={`${styles.richTextLabel} ${styles.richTextLabelPlanned}`}>
                      <CheckCircle2 size={16} color="#436e0d" />
                      <span>Action Planned</span>
                    </div>
                    {actionPlanned && (
                      <button
                        type="button"
                        className={styles.copyBtn}
                        onClick={() => handleCopy(actionPlanned, 'action')}
                        title="Copy Action Planned"
                      >
                        {copiedField === 'action' ? <Check size={12} color="#15803d" /> : <Copy size={12} />}
                        <span>{copiedField === 'action' ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                  <div className={styles.richTextContent}>
                    {actionPlanned || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No action plan recorded.</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Entity & Timeline Details */}
          {(activeTab === 'all' || activeTab === 'entity') && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionHeaderTitle}>
                  <Building2 size={18} className={styles.sectionIcon} />
                  <span>Entity &amp; Governance Timeline</span>
                </div>
              </div>
              <div className={styles.sectionBody}>
                <div className={styles.dataGrid}>
                  <div className={styles.dataField}>
                    <span className={styles.fieldLabel}>
                      <MapPin size={12} /> Group
                    </span>
                    <span className={styles.fieldValue}>{group}</span>
                  </div>
                  <div className={styles.dataField}>
                    <span className={styles.fieldLabel}>
                      <Building2 size={12} /> Location / Plant
                    </span>
                    <span className={styles.fieldValue}>{location}</span>
                  </div>
                  <div className={styles.dataField}>
                    <span className={styles.fieldLabel}>
                      <Layers size={12} /> Count
                    </span>
                    <span className={styles.fieldValue}>{count}</span>
                  </div>

                  <div className={styles.dataField}>
                    <span className={styles.fieldLabel}>
                      <Briefcase size={12} /> Department
                    </span>
                    <span className={styles.fieldValue}>{dept}</span>
                  </div>
                  <div className={styles.dataField}>
                    <span className={styles.fieldLabel}>
                      <User size={12} /> Prime Responsibility
                    </span>
                    <span className={styles.fieldValueStrong}>{primeResp}</span>
                  </div>
                  <div className={styles.dataField}>
                    <span className={styles.fieldLabel}>
                      <Calendar size={12} /> Financial Period
                    </span>
                    <span className={styles.fieldValue}>{financialPeriod}</span>
                  </div>

                  <div className={styles.dataField}>
                    <span className={styles.fieldLabel}>
                      <Calendar size={12} /> Target Date
                    </span>
                    <span className={styles.fieldValue}>{targetDate}</span>
                  </div>
                  <div className={styles.dataField}>
                    <span className={styles.fieldLabel}>
                      <Calendar size={12} /> Revised Target Date
                    </span>
                    <span className={styles.fieldValue}>{revisedTargetDate}</span>
                  </div>
                  <div className={styles.dataField}>
                    <span className={styles.fieldLabel}>
                      <User size={12} /> Current Approver
                    </span>
                    <span className={styles.fieldValue}>{approver}</span>
                  </div>

                  <div className={styles.dataField}>
                    <span className={styles.fieldLabel}>
                      <User size={12} /> Approver Role
                    </span>
                    <span className={styles.fieldValue}>{role}</span>
                  </div>

                  {createdDate && (
                    <div className={styles.dataField}>
                      <span className={styles.fieldLabel}>
                        <Calendar size={12} /> Created Date
                      </span>
                      <span className={styles.fieldValue}>{createdDate}</span>
                    </div>
                  )}

                  {updatedDate && (
                    <div className={styles.dataField}>
                      <span className={styles.fieldLabel}>
                        <Clock size={12} /> Last Updated
                      </span>
                      <span className={styles.fieldValue}>{updatedDate}</span>
                    </div>
                  )}

                  {createdBy && (
                    <div className={styles.dataField}>
                      <span className={styles.fieldLabel}>
                        <User size={12} /> Created By
                      </span>
                      <span className={styles.fieldValue}>{createdBy}</span>
                    </div>
                  )}

                  {attachment && (
                    <div className={`${styles.dataField} ${styles.fieldFull}`}>
                      <span className={styles.fieldLabel}>
                        <Paperclip size={12} /> Attachment Document
                      </span>
                      <div>
                        <span className={styles.attachmentPill}>
                          <Paperclip size={14} />
                          <span>{attachment}</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Review Remarks */}
          {(activeTab === 'all' || activeTab === 'remarks') && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionHeaderTitle}>
                  <MessageSquare size={18} className={styles.sectionIcon} />
                  <span>Reviewer &amp; Approver Remarks</span>
                </div>
              </div>
              <div className={styles.sectionBody}>
                <div className={styles.remarksGrid}>
                  {/* Department Head Remarks */}
                  <div className={styles.remarkCard}>
                    <span className={styles.remarkRole}>
                      <User size={13} /> Department Head Remarks
                    </span>
                    <div className={styles.remarkText}>
                      {deptRemarks || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No remarks recorded</span>}
                    </div>
                  </div>

                  {/* Unit Finance Head Remarks */}
                  <div className={styles.remarkCard}>
                    <span className={styles.remarkRole}>
                      <User size={13} /> Unit Finance Head Remarks
                    </span>
                    <div className={styles.remarkText}>
                      {unitFinRemarks || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No remarks recorded</span>}
                    </div>
                  </div>

                  {/* Unit Head Remarks */}
                  <div className={styles.remarkCard}>
                    <span className={styles.remarkRole}>
                      <User size={13} /> Unit Head Remarks
                    </span>
                    <div className={styles.remarkText}>
                      {unitHeadRemarks || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No remarks recorded</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Integrated Audit Trail Timeline */}
          {(activeTab === 'all' || activeTab === 'trail') && trail.length > 0 && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionHeaderTitle}>
                  <History size={18} className={styles.sectionIcon} />
                  <span>Audit Trail Workflow History ({trail.length} Stages)</span>
                </div>
              </div>
              <div className={styles.sectionBody}>
                <div className={styles.trailTimeline}>
                  {trail.map((step, idx) => (
                    <div key={idx} className={styles.trailStep}>
                      <div className={styles.trailStepIcon}>{idx + 1}</div>
                      <div className={styles.trailStepContent}>
                        <div>
                          <div className={styles.trailApprover}>
                            {step.s_approver || step.approver || 'Approver'}
                          </div>
                          <div className={styles.trailMeta}>
                            <span>
                              <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                              {step.d_approved_date || step.approved_date || '—'}
                            </span>
                            <span>
                              <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                              {step.n_days || step.days || '0 days'}
                            </span>
                          </div>
                        </div>
                        <div>{getStatusBadge(step.s_status || step.status)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Complete Raw Field Values Table */}
          {activeTab === 'raw' && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionHeaderTitle}>
                  <Table size={18} className={styles.sectionIcon} />
                  <span>Complete Record Field Values ({Object.keys(row).filter((k) => !['loadingFullDetails', 'trail'].includes(k)).length} Properties)</span>
                </div>
              </div>
              <div className={styles.sectionBody} style={{ padding: 0 }}>
                <table className={styles.allFieldsTable}>
                  <tbody>
                    {Object.entries(row)
                      .filter(([k]) => !['loadingFullDetails', 'trail'].includes(k))
                      .map(([k, v], i) => (
                        <tr key={i} className={i % 2 === 0 ? styles.allFieldsRowEven : ''}>
                          <td className={styles.allFieldsKey}>{formatKeyLabel(k)}</td>
                          <td className={styles.allFieldsVal}>
                            {typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v ?? '—')}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          <div className={styles.modalFooterLeft}>
            {onViewTrail && (
              <button
                type="button"
                className={styles.btnActionTrail}
                onClick={() => {
                  onClose();
                  onViewTrail(atrId, trail);
                }}
              >
                <ClipboardList size={15} />
                <span>Full Audit Trail Modal</span>
              </button>
            )}
            {onEdit && String(level) !== '5' && (
              <button
                type="button"
                className={styles.btnActionEdit}
                onClick={() => {
                  onClose();
                  onEdit(atrId);
                }}
              >
                <Edit size={15} />
                <span>Edit Record</span>
              </button>
            )}
          </div>
          <div className={styles.modalFooterRight}>
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
    </div>
  );

  return createPortal(modalContent, document.body);
}
