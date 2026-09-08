import React, { useState, useEffect } from 'react';
import { Upload, Paperclip } from 'lucide-react';
import styles from '../styles/SampleModals.module.css';
import { CATEGORY_OPTIONS, buildSampleRefNo, esc } from '../constants/samplePortalConstants';
import { ENV } from '../../../config/env';

export default function EditRequestModal({ isOpen, onClose, requestData, onSaved }) {
  const [formData, setFormData] = useState({
    eplLocation: '',
    type: '',
    category: '',
    printType: '',
    tubeDiameter: '',
    printedLength: '',
    commercialLength: '',
    webType: '',
    tubeType: '',
    includedText: '',
    tubeShape: '',
    shoulderColor: '',
    threadType: '',
    orifice: '',
    topSeal: '',
    capCode: '',
    capOrientation: '',
    transportation: '',
    quantity: '',
    remarks: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (requestData) {
      const isIncluded = Boolean(requestData.s_tube_type_laminated_input);
      setFormData({
        eplLocation: requestData.s_epl_location || '',
        type: requestData.s_type || '',
        category: requestData.s_category || '',
        printType: requestData.s_print_type || '',
        tubeDiameter: requestData.n_tube_diameter != null ? String(requestData.n_tube_diameter) : '',
        printedLength: requestData.n_printed_length != null ? String(requestData.n_printed_length) : '',
        commercialLength: requestData.n_commercial_length != null ? String(requestData.n_commercial_length) : '',
        webType: requestData.s_web_type || '',
        tubeType: isIncluded ? 'Included' : requestData.s_laminated || '',
        includedText: requestData.s_tube_type_laminated_input || '',
        tubeShape: requestData.s_tube_shape || '',
        shoulderColor: requestData.s_shoulder_color || '',
        threadType: requestData.s_thread_type || '',
        orifice: requestData.n_orifice != null ? String(requestData.n_orifice) : '',
        topSeal: requestData.s_top_seal || '',
        capCode: requestData.s_cap_code || '',
        capOrientation: requestData.s_cap_orientation || '',
        transportation: requestData.s_transportation || '',
        quantity: requestData.n_quantity != null ? String(requestData.n_quantity) : '',
        remarks: requestData.s_special_remarks || '',
      });
      setSelectedFile(null);
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

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Required validation
    if (
      !formData.eplLocation.trim() ||
      !formData.type.trim() ||
      !formData.category.trim() ||
      !formData.tubeShape.trim() ||
      !formData.quantity
    ) {
      setErrorMsg('Please fill in all required fields marked with *.');
      return;
    }

    if (formData.tubeType === 'Included' && !formData.includedText.trim()) {
      setErrorMsg('Please enter Included tube type (e.g. ABL / PBL / OTHER).');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      const uid = localStorage.getItem('uid') || '';
      const fd = new FormData();
      fd.append('username', uid);
      fd.append('s_epl_location', formData.eplLocation.trim());
      fd.append('s_type', formData.type.trim());
      fd.append('s_category', formData.category.trim());
      fd.append('s_print_type', formData.printType.trim());
      if (formData.tubeDiameter) fd.append('n_tube_diameter', formData.tubeDiameter);
      if (formData.printedLength) fd.append('n_printed_length', formData.printedLength);
      if (formData.commercialLength) fd.append('n_commercial_length', formData.commercialLength);
      fd.append('s_web_type', formData.webType.trim());

      if (formData.tubeType === 'Included') {
        fd.append('s_laminated', 'Included');
        fd.append('s_tube_type_laminated_input', formData.includedText.trim());
      } else {
        fd.append('s_laminated', formData.tubeType);
        fd.append('s_tube_type_laminated_input', '');
      }

      fd.append('s_tube_shape', formData.tubeShape.trim());
      fd.append('s_shoulder_color', formData.shoulderColor.trim());
      fd.append('s_thread_type', formData.threadType.trim());
      if (formData.orifice) fd.append('n_orifice', formData.orifice);
      fd.append('s_top_seal', formData.topSeal.trim());
      fd.append('s_cap_code', formData.capCode.trim());
      fd.append('s_cap_orientation', formData.capOrientation.trim());
      fd.append('s_transportation', formData.transportation.trim());
      fd.append('n_quantity', formData.quantity);
      fd.append('s_special_remarks', formData.remarks.trim());

      if (selectedFile) {
        fd.append('attachment', selectedFile);
      }

      const response = await fetch(`${ENV.API_BASE_URL}/bpmn/api/sample/${requestData.n_id}/edit`, {
        method: 'PUT',
        headers: {
          ...(uid ? { 'X-User-Id': uid } : {}),
        },
        body: fd,
      });

      const res = await response.json();
      if (response.ok && (res?.success !== false)) {
        if (onSaved) onSaved(res.data);
        onClose();
      } else {
        setErrorMsg(res?.message || 'Update failed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Server error while saving request changes.');
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
            <div className={styles.modalBadge}>Edit Request</div>
            <h2 className={styles.modalTitle}>
              Edit Sample Request {buildSampleRefNo(requestData.n_id)}
            </h2>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className={styles.modalBody}>
            {errorMsg && (
              <div style={{ padding: '10px 14px', background: '#fff5f5', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '6px', marginBottom: '14px', fontSize: '13px' }}>
                {errorMsg}
              </div>
            )}

            {/* Current Status Badge */}
            <div style={{ marginBottom: '16px', fontSize: '13px', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Current Status:</span>
              <span
                style={{
                  display: 'inline-block',
                  padding: '2px 10px',
                  borderRadius: '100px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  background: requestData.s_status === 'Closed' ? '#f1f5f9' : '#eff6ff',
                  color: requestData.s_status === 'Closed' ? '#475569' : '#1e40af',
                  border: `1px solid ${requestData.s_status === 'Closed' ? '#cbd5e1' : '#93c5fd'}`,
                }}
              >
                {esc(requestData.s_status)}
              </span>
            </div>

            {/* EPL Location & Type */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>
                  EPL Location <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. China"
                  value={formData.eplLocation}
                  onChange={(e) => handleChange('eplLocation', e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  Type <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Sample Tube"
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Category & Print Type */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>
                  Category <span className={styles.required}>*</span>
                </label>
                <div className={styles.selectWrap}>
                  <select
                    className={styles.select}
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    required
                  >
                    <option value="" disabled>Select category</option>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <span className={styles.selectArrow}>⌄</span>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Print Type</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. FLEXODIGITAL"
                  value={formData.printType}
                  onChange={(e) => handleChange('printType', e.target.value)}
                />
              </div>
            </div>

            {/* Tube Diameter & Printed Length */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Tube Diameter (mm)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className={styles.input}
                  value={formData.tubeDiameter}
                  onChange={(e) => handleChange('tubeDiameter', e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Printed Length (mm)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className={styles.input}
                  value={formData.printedLength}
                  onChange={(e) => handleChange('printedLength', e.target.value)}
                />
              </div>
            </div>

            {/* Commercial Length & Web Type */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Commercial Length (mm)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className={styles.input}
                  value={formData.commercialLength}
                  onChange={(e) => handleChange('commercialLength', e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Web Type</label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.webType}
                  onChange={(e) => handleChange('webType', e.target.value)}
                />
              </div>
            </div>

            {/* Tube Type (Laminated with Included Text condition) & Tube Shape */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Tube Type</label>
                <div className={styles.selectWrap}>
                  <select
                    className={styles.select}
                    value={formData.tubeType}
                    onChange={(e) => handleChange('tubeType', e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Extruded">Extruded</option>
                    <option value="Included">Laminated</option>
                  </select>
                  <span className={styles.selectArrow}>⌄</span>
                </div>

                {formData.tubeType === 'Included' && (
                  <div style={{ marginTop: '8px' }}>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="ABL / PBL / OTHER"
                      value={formData.includedText}
                      onChange={(e) => handleChange('includedText', e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>
                  Tube Shape <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. ROUND"
                  value={formData.tubeShape}
                  onChange={(e) => handleChange('tubeShape', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Shoulder Color & Thread Type */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Shoulder Color (Pantone Shade)</label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.shoulderColor}
                  onChange={(e) => handleChange('shoulderColor', e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Thread Type</label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.threadType}
                  onChange={(e) => handleChange('threadType', e.target.value)}
                />
              </div>
            </div>

            {/* Orifice & Top Seal */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Orifice (mm)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className={styles.input}
                  value={formData.orifice}
                  onChange={(e) => handleChange('orifice', e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Top Seal</label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.topSeal}
                  onChange={(e) => handleChange('topSeal', e.target.value)}
                />
              </div>
            </div>

            {/* Cap Type & Cap Orientation */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Cap Type</label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.capCode}
                  onChange={(e) => handleChange('capCode', e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Cap Orientation</label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.capOrientation}
                  onChange={(e) => handleChange('capOrientation', e.target.value)}
                />
              </div>
            </div>

            {/* Transportation & Quantity */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Transportation</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Land / Air / Sea"
                  value={formData.transportation}
                  onChange={(e) => handleChange('transportation', e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  Quantity <span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  className={styles.input}
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Special Remarks */}
            <div className={styles.formGroup}>
              <label>Special Remarks</label>
              <textarea
                className={styles.textarea}
                rows={3}
                value={formData.remarks}
                onChange={(e) => handleChange('remarks', e.target.value)}
              />
            </div>

            {/* Attachment Replacement */}
            <div className={styles.formGroup}>
              <label>Replace Attachment <span className={styles.optional}>(Optional)</span></label>
              <label className={styles.fileLabel} htmlFor="erAttachmentInput">
                <Upload size={16} />
                <span>{selectedFile ? selectedFile.name : 'Choose new file…'}</span>
                <input
                  id="erAttachmentInput"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp"
                />
              </label>
              {requestData.s_attachment && !selectedFile && (
                <div style={{ marginTop: '6px', fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Paperclip size={12} />
                  <span>Current attachment: {requestData.s_attachment.split('/').pop()}</span>
                </div>
              )}
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
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
