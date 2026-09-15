import React, { useState, useEffect } from 'react';
import styles from '../styles/SampleModals.module.css';
import { DOABLE_OPTIONS, esc } from '../constants/samplePortalConstants';
import { ENV } from '../../../config/env';

export default function WorkflowModal({ isOpen, onClose, requestData, onSaved }) {
  const [doable, setDoable] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [cost, setCost] = useState('');
  const [remark, setRemark] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Populate data when requestData changes
  useEffect(() => {
    if (requestData) {
      setDoable(requestData.s_doable || '');
      setDeliveryDate(
        requestData.d_tentative_delivery
          ? String(requestData.d_tentative_delivery).slice(0, 10)
          : ''
      );
      setCost(
        requestData.n_tentative_cost != null ? String(requestData.n_tentative_cost) : ''
      );
      setRemark(requestData.s_remark || '');
      setErrorMsg('');
    }
  }, [requestData]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, saving, onClose]);

  if (!isOpen || !requestData) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    try {
      const payload = {
        s_doable: doable,
        d_tentative_delivery: deliveryDate || null,
        n_tentative_cost: cost ? parseFloat(cost) : null,
        s_remark: remark,
      };

      const uid = localStorage.getItem('uid') || '';
      const response = await fetch(`${ENV.API_BASE_URL}/bpmn/api/sample/${requestData.n_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(uid ? { 'X-User-Id': uid } : {}),
        },
        body: JSON.stringify(payload),
      });

      const res = await response.json();
      if (response.ok && (res?.success !== false)) {
        if (onSaved) onSaved(res.data || { ...requestData, ...payload, s_status: 'Closed' });
        onClose();
      } else {
        setErrorMsg(res?.message || 'Workflow update failed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Server error while saving workflow.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={() => !saving && onClose()}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div>
            <div className={styles.modalBadge}>Workflow Update</div>
            <h2 className={styles.modalTitle}>Update Sample Request</h2>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className={styles.modalBody}>
            {errorMsg && (
              <div style={{ padding: '10px 14px', background: '#fff5f5', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '6px', marginBottom: '14px', fontSize: '13px' }}>
                {errorMsg}
              </div>
            )}

            {/* Request Summary Strip */}
            <div className={styles.wfSummary}>
              <span>
                <strong>Applicant:</strong> {esc(requestData.s_applicant_name)}
              </span>
              <span>
                <strong>Category:</strong> {esc(requestData.s_category || '—')}
              </span>
              <span>
                <strong>Type:</strong> {esc(requestData.s_type || '—')}
              </span>
            </div>

            {/* Doable & Auto-Status */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="wfDoable">Doable</label>
                <div className={styles.selectWrap}>
                  <select
                    id="wfDoable"
                    className={styles.select}
                    value={doable}
                    onChange={(e) => setDoable(e.target.value)}
                  >
                    {DOABLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <span className={styles.selectArrow}>⌄</span>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Status</label>
                <div className={styles.autoStatusInfo}>
                  Will be set to <strong>Closed</strong> automatically on save
                </div>
              </div>
            </div>

            {/* Delivery Date & Cost */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="wfDelivery">Tentative Delivery Date</label>
                <input
                  type="date"
                  id="wfDelivery"
                  className={styles.input}
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="wfCost">Tentative Cost (INR)</label>
                <input
                  type="number"
                  id="wfCost"
                  className={styles.input}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                />
              </div>
            </div>

            {/* Remark */}
            <div className={styles.formGroup}>
              <label htmlFor="wfRemark">Remark</label>
              <textarea
                id="wfRemark"
                className={styles.textarea}
                rows={3}
                placeholder="Enter notes or comments…"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className={styles.btnSave} disabled={saving}>
              {saving ? (
                <>
                  <div className={styles.btnLoaderSm} />
                  <span>Saving…</span>
                </>
              ) : (
                <span>Save Workflow</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
