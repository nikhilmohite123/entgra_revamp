import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/npdTrack.module.css';
import NpdConfirmModal from './NpdConfirmModal';
import { npdToast } from './NpdToast';
import { BASE_URL } from '../constants/npdConstants';

export default function NpdForm({
  formData,
  setFormData,
  isEditMode,
  onSubmit,
  onCancel,
  contactList,
  onUploadFileClick,
  attachments,
  onDeleteFile
}) {
  const [countries, setCountries] = useState([]);
  const [expectedComDisplay, setExpectedComDisplay] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loadingProjectNo, setLoadingProjectNo] = useState(false);
  const projectNoReqIdRef = useRef(0);
  const baseUrl = BASE_URL;

  // Calculate current financial year code (e.g. 2425)
  const getCurrentFinancialYearCode = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0 = Jan, 3 = April
    let startYear, endYear;
    if (month >= 3) {
      startYear = year;
      endYear = year + 1;
    } else {
      startYear = year - 1;
      endYear = year;
    }
    return String(startYear).slice(2) + String(endYear).slice(2);
  };

  // Handle Region change
  const handleRegionChange = (regionVal) => {
    setFormData((prev) => ({
      ...prev,
      s_region: regionVal,
      s_country: '',
      s_project_no: isEditMode ? prev.s_project_no : '',
    }));
    if (!regionVal) {
      setCountries([]);
    }
  };

  // Handle Country change
  const handleCountryChange = (countryVal) => {
    setFormData((prev) => ({
      ...prev,
      s_country: countryVal,
      s_project_no: countryVal ? prev.s_project_no : (isEditMode ? prev.s_project_no : ''),
    }));
  };

  // Fetch countries when region changes (or on mount for edit mode)
  useEffect(() => {
    if (!formData.s_region) return;

    const reg = formData.s_region === 'EU' ? 'EUROPE' : formData.s_region;
    let isSubscribed = true;

    const fetchCountries = async () => {
      try {
        const response = await fetch(`${baseUrl}/npd/getcountry`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ s_region: reg }),
        });
        const result = await response.json();
        if (isSubscribed && result && Array.isArray(result.data)) {
          setCountries(result.data.map((c) => c.s_country));
        }
      } catch (err) {
        console.error('Error fetching countries:', err);
      }
    };

    fetchCountries();

    return () => {
      isSubscribed = false;
    };
  }, [formData.s_region]);

  // Dynamically recalculate project number whenever Region or Country changes
  useEffect(() => {
    // In edit mode, do not overwrite the existing assigned project number
    if (isEditMode) return;

    const region = formData.s_region;
    const country = formData.s_country;

    // Only generate when both region and country are selected
    if (!region || !country) return;

    // Race condition protection: increment request id
    const currentReqId = ++projectNoReqIdRef.current;
    setLoadingProjectNo(true);

    const fyear = getCurrentFinancialYearCode();
    let countryCode = country.slice(0, 2).toUpperCase();
    if (countryCode === 'UN') countryCode = 'US';

    const fetchProjectNo = async () => {
      try {
        const response = await fetch(`${baseUrl}/npd/autogenarated_project_number?fyear=${fyear}&region=${region}`);
        const result = await response.json();

        // Stale response check: discard if a newer region/country selection was made
        if (currentReqId !== projectNoReqIdRef.current) return;

        let numWithIncrement = 1;
        if (result && result.data && result.data.length > 0) {
          numWithIncrement = Number(result.data[0].auto_no || 0) + 1;
        }

        const genNo = '00' + numWithIncrement + countryCode + fyear;
        const finalGen = genNo.slice(-9);

        setFormData((prev) => ({
          ...prev,
          s_project_no: finalGen,
        }));
      } catch (err) {
        console.error('Error autogenerating project no:', err);
        if (currentReqId === projectNoReqIdRef.current) {
          npdToast.error('Failed to generate project number. Please try selecting the Country again.');
        }
      } finally {
        if (currentReqId === projectNoReqIdRef.current) {
          setLoadingProjectNo(false);
        }
      }
    };

    fetchProjectNo();
  }, [formData.s_region, formData.s_country, isEditMode, setFormData]);

  // Stage change sync
  const handleStageChange = (stageVal) => {
    let aliveStatus = formData.s_project_alive_status || 'ALIVE';
    if (stageVal === 'Stage 5') {
      aliveStatus = 'COMMERCIAL';
    } else {
      aliveStatus = 'ALIVE';
    }
    setFormData({
      ...formData,
      s_status: stageVal,
      s_project_alive_status: aliveStatus,
    });
  };

  // Calculate Quarter display from Expected Commercialisation
  useEffect(() => {
    const value = formData.s_expected_com;
    if (!value) {
      setExpectedComDisplay('');
      return;
    }
    const parts = value.split('-');
    if (parts.length < 2) return;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    let quarter = '';
    let fyStart, fyEnd;

    if (month >= 4 && month <= 6) {
      quarter = 'Q1'; fyStart = year; fyEnd = year + 1;
    } else if (month >= 7 && month <= 9) {
      quarter = 'Q2'; fyStart = year; fyEnd = year + 1;
    } else if (month >= 10 && month <= 12) {
      quarter = 'Q3'; fyStart = year; fyEnd = year + 1;
    } else if (month >= 1 && month <= 3) {
      quarter = 'Q4'; fyStart = year - 1; fyEnd = year;
    }

    const fyDisplay = String(fyStart).slice(-2) + String(fyEnd).slice(-2);
    setExpectedComDisplay(`${quarter} ${fyDisplay}`);
  }, [formData.s_expected_com]);

  // Fetch email when contact person is selected
  const fetchContactEmail = async (contactName, emailField) => {
    if (!contactName) return;
    try {
      const response = await fetch(`${baseUrl}/npd/get_email_contact_per?contact_per_name=${encodeURIComponent(contactName)}`);
      const result = await response.json();
      if (result && result.data && result.data.length > 0 && result.data[0].S_EMAIL_ID) {
        const email = result.data[0].S_EMAIL_ID + '@eplglobal.com';
        setFormData((prev) => ({ ...prev, [emailField]: email }));
      }
    } catch (err) {
      console.error('Error fetching contact email:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setConfirmOpen(false);
    setSaving(true);
    try {
      await onSubmit(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.npdFormWrapper} id="npd-form123">
      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="row">
          {/* Project Number */}
          <div className={`col-md-4 ${styles.formGroup}`}>
            <label className={styles.formLabel}>
              Project Number
              {loadingProjectNo && (
                <span
                  className="spinner-border spinner-border-sm text-primary ms-2"
                  role="status"
                  style={{ width: '0.85rem', height: '0.85rem', verticalAlign: 'middle' }}
                >
                  <span className="visually-hidden">Generating...</span>
                </span>
              )}
            </label>
            <input
              type="text"
              name="s_project_no"
              value={loadingProjectNo ? 'Generating...' : (formData.s_project_no || '')}
              placeholder={!formData.s_region || !formData.s_country ? 'Auto-generated on Region & Country' : ''}
              disabled
              className={styles.formControl}
              style={{
                backgroundColor: loadingProjectNo ? '#f8fafc' : undefined,
                fontWeight: formData.s_project_no ? 600 : 'normal',
                color: formData.s_project_no ? '#003c96' : undefined,
              }}
            />
          </div>

          {/* Region */}
          <div className={`col-md-4 ${styles.formGroup}`}>
            <label className={styles.formLabel}>Region</label>
            <select
              name="s_region"
              value={formData.s_region || ''}
              onChange={(e) => handleRegionChange(e.target.value)}
              className={styles.formControl}
              required
            >
              <option value="">Select Region</option>
              <option value="AMESA">AMESA</option>
              <option value="AMERICAS">AMERICAS</option>
              <option value="EU">EUROPE</option>
              <option value="EAP">EAP</option>
            </select>
          </div>

          {/* Project Name */}
          <div className={`col-md-4 ${styles.formGroup}`}>
            <label className={styles.formLabel}>Project Name</label>
            <input
              type="text"
              name="s_project_name"
              value={formData.s_project_name || ''}
              onChange={(e) => handleInputChange('s_project_name', e.target.value)}
              className={styles.formControl}
              required
            />
          </div>

          {/* Business Background */}
          <div className={`col-md-4 ${styles.formGroup}`}>
            <label className={styles.formLabel}>Business Background</label>
            <textarea
              name="s_business_back"
              value={formData.s_business_back || ''}
              onChange={(e) => handleInputChange('s_business_back', e.target.value)}
              className={styles.formControl}
              rows={2}
            />
          </div>

          {/* Country */}
          <div className={`col-md-4 ${styles.formGroup}`}>
            <label className={styles.formLabel}>Country</label>
            <select
              name="s_country"
              value={formData.s_country || ''}
              onChange={(e) => handleCountryChange(e.target.value)}
              className={styles.formControl}
              required
            >
              <option value="">Select Country</option>
              {countries.map((c, idx) => (
                <option key={idx} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Component */}
          <div className={`col-md-4 ${styles.formGroup}`}>
            <label className={styles.formLabel}>Component</label>
            <select
              name="s_component"
              value={formData.s_component || ''}
              onChange={(e) => handleInputChange('s_component', e.target.value)}
              className={styles.formControl}
            >
              <option value="">Select Component</option>
              <option value="CAP">CAP</option>
              <option value="SHOULDER">SHOULDER</option>
              <option value="SLEEVE">SLEEVE</option>
              <option value="SHOULDER & CAP">SHOULDER & CAP</option>
              <option value="PRINTING & DECORATION">PRINTING & DECORATION</option>
              <option value="APPLICATOR / DISPENSER">APPLICATOR / DISPENSER</option>
              <option value="SHOULDER & APPLICATOR & CAP">SHOULDER & APPLICATOR & CAP</option>
            </select>
          </div>

          {/* Overall tube weight */}
          <div className={`col-md-4 ${styles.formGroup}`}>
            <label className={styles.formLabel}>Overall tube weight</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                step="any"
                name="s_weight"
                value={formData.s_weight || ''}
                onChange={(e) => handleInputChange('s_weight', e.target.value)}
                className={styles.formControl}
              />
              <span className={styles.inputSuffix}>g</span>
            </div>
          </div>

          {/* Technical Contact */}
          <div className={`col-md-4 ${styles.formGroup}`}>
            <label className={styles.formLabel}>Technical Contact</label>
            <input
              type="text"
              name="s_owner"
              list="contactList"
              value={formData.s_owner || ''}
              onChange={(e) => {
                handleInputChange('s_owner', e.target.value);
                fetchContactEmail(e.target.value, 'bindemail_technical_con');
              }}
              className={styles.formControl}
              placeholder="Search contact..."
            />
            {formData.bindemail_technical_con && (
              <small className="text-muted d-block mt-1">{formData.bindemail_technical_con}</small>
            )}
          </div>

          {/* Business Contact */}
          <div className={`col-md-4 ${styles.formGroup}`}>
            <label className={styles.formLabel}>Business Contact</label>
            <input
              type="text"
              name="s_business_contact"
              list="contactList"
              value={formData.s_business_contact || ''}
              onChange={(e) => {
                handleInputChange('s_business_contact', e.target.value);
                fetchContactEmail(e.target.value, 'bindemail_business_con');
              }}
              className={styles.formControl}
              placeholder="Search contact..."
            />
            {formData.bindemail_business_con && (
              <small className="text-muted d-block mt-1">{formData.bindemail_business_con}</small>
            )}
          </div>

          {/* Contact datalist */}
          <datalist id="contactList">
            {contactList?.map((contact, idx) => (
              <option key={idx} value={contact.S_EMP_NAME} />
            ))}
          </datalist>

          {/* Tube Spec */}
          <div className={`col-md-4 ${styles.formGroup}`}>
            <label className={styles.formLabel}>Tube Spec.</label>
            <input
              type="text"
              name="s_tube_spec"
              value={formData.s_tube_spec || ''}
              onChange={(e) => handleInputChange('s_tube_spec', e.target.value)}
              className={styles.formControl}
            />
          </div>

          {/* Segment */}
          <div className={`col-md-4 ${styles.formGroup}`}>
            <label className={styles.formLabel}>Segment</label>
            <input
              type="text"
              name="s_segment"
              value={formData.s_segment || ''}
              onChange={(e) => handleInputChange('s_segment', e.target.value)}
              className={styles.formControl}
            />
          </div>

          {/* Targeted Customer */}
          <div className={`col-md-4 ${styles.formGroup}`}>
            <label className={styles.formLabel}>Targeted Customer</label>
            <input
              type="text"
              name="s_targated_customer"
              value={formData.s_targated_customer || ''}
              onChange={(e) => handleInputChange('s_targated_customer', e.target.value)}
              className={styles.formControl}
            />
          </div>

          {/* Potential volume */}
          <div className={`col-md-4 ${styles.formGroup}`}>
            <label className={styles.formLabel}>Potential volume (millions tubes/yr)</label>
            <input
              type="number"
              step="any"
              name="s_value"
              value={formData.s_value || ''}
              onChange={(e) => handleInputChange('s_value', e.target.value)}
              className={styles.formControl}
            />
          </div>

          {/* Stage */}
          <div className={`col-md-4 ${styles.formGroup}`}>
            <label className={styles.formLabel}>Stage</label>
            <select
              name="s_status"
              value={formData.s_status || ''}
              onChange={(e) => handleStageChange(e.target.value)}
              className={styles.formControl}
            >
              <option value="">Select Status</option>
              <option value="Stage 1">Business Case Approval (Stage 1)</option>
              <option value="Stage 2">Mould Development (Stage 2)</option>
              <option value="Stage 3">Mould/Sample Approval (Stage 3)</option>
              <option value="Stage 4">Proto-Commercial (Stage 4)</option>
              <option value="Stage 5">Commercial/COMPLETED (Stage 5)</option>
            </select>
          </div>

          {/* Tool Investment Details */}
          <div className={`col-md-4 ${styles.formGroup}`}>
            <label className={styles.formLabel}>Tool Investment Details</label>
            <select
              name="s_tool_inv_detail"
              value={formData.s_tool_inv_detail || ''}
              onChange={(e) => handleInputChange('s_tool_inv_detail', e.target.value)}
              className={styles.formControl}
            >
              <option value="">Select Details</option>
              <option value="EPL INVESTED">EPL INVESTED</option>
              <option value="CUSTOMER INVESTED">CUSTOMER INVESTED</option>
              <option value="VENDOR INVESTED">VENDOR INVESTED</option>
              <option value="COLLABORATIVE INVESTED">COLLABORATIVE INVESTED</option>
              <option value="NOT YET DECIDED">NOT YET DECIDED</option>
            </select>
          </div>

          {/* Expected Commercialisation */}
          <div className={`col-md-4 ${styles.formGroup}`}>
            <label className={styles.formLabel}>Expected Commercialisation</label>
            <input
              type="month"
              name="s_expected_com"
              value={formData.s_expected_com || ''}
              onChange={(e) => handleInputChange('s_expected_com', e.target.value)}
              className={styles.formControl}
            />
            {expectedComDisplay && (
              <small className="text-primary fw-bold d-block mt-1">{expectedComDisplay}</small>
            )}
          </div>

          {/* Capex No */}
          <div className={`col-md-4 ${styles.formGroup}`}>
            <label className={styles.formLabel}>Capex No</label>
            <input
              type="text"
              name="s_capex_no"
              value={formData.s_capex_no || ''}
              onChange={(e) => handleInputChange('s_capex_no', e.target.value)}
              className={styles.formControl}
            />
          </div>

          {/* Remark */}
          <div className={`col-md-4 ${styles.formGroup}`}>
            <label className={styles.formLabel}>Remark</label>
            <textarea
              name="s_value_propotion"
              value={formData.s_value_propotion || ''}
              onChange={(e) => handleInputChange('s_value_propotion', e.target.value)}
              className={styles.formControl}
              rows={2}
            />
          </div>

          {/* Capex Approved Amount */}
          <div className={`col-md-4 ${styles.formGroup}`}>
            <label className={styles.formLabel}>Capex Approved Amount (USD '000)</label>
            <input
              type="number"
              step="any"
              name="s_capex_app_amount"
              value={formData.s_capex_app_amount || ''}
              onChange={(e) => handleInputChange('s_capex_app_amount', e.target.value)}
              className={styles.formControl}
            />
          </div>

          {/* Capex Utilized Amount */}
          <div className={`col-md-4 ${styles.formGroup}`}>
            <label className={styles.formLabel}>Capex Utilized Amount</label>
            <input
              type="number"
              step="any"
              name="s_capex_util_amount"
              value={formData.s_capex_util_amount || ''}
              onChange={(e) => handleInputChange('s_capex_util_amount', e.target.value)}
              className={styles.formControl}
            />
          </div>

          {/* Cap DIA */}
          <div className={`col-md-4 ${styles.formGroup}`}>
            <label className={styles.formLabel}>Cap DIA</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                step="any"
                name="s_cap_dia"
                value={formData.s_cap_dia || ''}
                onChange={(e) => handleInputChange('s_cap_dia', e.target.value)}
                className={styles.formControl}
              />
              <span className={styles.inputSuffix}>mm</span>
            </div>
          </div>

          {/* Sleeve Length */}
          <div className={`col-md-4 ${styles.formGroup}`}>
            <label className={styles.formLabel}>Sleeve Length</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                step="any"
                name="s_sleeve_lenght"
                value={formData.s_sleeve_lenght || ''}
                onChange={(e) => handleInputChange('s_sleeve_lenght', e.target.value)}
                className={styles.formControl}
              />
              <span className={styles.inputSuffix}>mm</span>
            </div>
          </div>

          {/* Shoulder weight */}
          <div className={`col-md-4 ${styles.formGroup}`}>
            <label className={styles.formLabel}>Shoulder weight</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                step="any"
                name="s_shoulder_weight"
                value={formData.s_shoulder_weight || ''}
                onChange={(e) => handleInputChange('s_shoulder_weight', e.target.value)}
                className={styles.formControl}
              />
              <span className={styles.inputSuffix}>g</span>
            </div>
          </div>

          {/* Cap weight */}
          <div className={`col-md-4 ${styles.formGroup}`}>
            <label className={styles.formLabel}>Cap weight</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                step="any"
                name="s_cap_weight"
                value={formData.s_cap_weight || ''}
                onChange={(e) => handleInputChange('s_cap_weight', e.target.value)}
                className={styles.formControl}
              />
              <span className={styles.inputSuffix}>g</span>
            </div>
          </div>

          {/* Sleeve laminate */}
          <div className={`col-md-4 ${styles.formGroup}`}>
            <label className={styles.formLabel}>Sleeve laminate</label>
            <input
              type="text"
              name="s_sleeve_laminate"
              value={formData.s_sleeve_laminate || ''}
              onChange={(e) => handleInputChange('s_sleeve_laminate', e.target.value)}
              className={styles.formControl}
            />
          </div>

          {/* Sleeve thickness */}
          <div className={`col-md-4 ${styles.formGroup}`}>
            <label className={styles.formLabel}>Sleeve thickness</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                step="any"
                name="s_sleeve_thickness"
                value={formData.s_sleeve_thickness || ''}
                onChange={(e) => handleInputChange('s_sleeve_thickness', e.target.value)}
                className={styles.formControl}
              />
              <span className={styles.inputSuffix}>microns</span>
            </div>
          </div>

          {/* Project Status */}
          {isEditMode && (
            <div className={`col-md-4 ${styles.formGroup}`}>
              <label className={styles.formLabel}>Project Status</label>
              <select
                name="s_project_alive_status"
                value={formData.s_project_alive_status || 'ALIVE'}
                onChange={(e) => handleInputChange('s_project_alive_status', e.target.value)}
                className={styles.formControl}
              >
                <option value="ALIVE">ALIVE</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="COMMERCIAL">COMMERCIAL/COMPLETED</option>
              </select>
            </div>
          )}
        </div>

        {/* Note */}
        <div className={styles.noteText}>
          <h6>Note: Kindly upload attachment files after saving the project.</h6>
        </div>

        {/* Attachment Card */}
        {isEditMode && (
          <div className={styles.attachmentCard}>
            <h6 className="text-danger mb-2">
              <i className="fas fa-paperclip me-2"></i> File Attachments
            </h6>
            <div className="d-flex align-items-center justify-content-between">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={onUploadFileClick}
              >
                <i className="fas fa-upload me-1"></i> Upload
              </button>
              <span className="text-muted small">
                {attachments && attachments.length > 0
                  ? `${attachments.length} file(s) attached`
                  : 'No file chosen'}
              </span>
            </div>

            {attachments && attachments.length > 0 && (
              <div className="mt-2 text-start">
                {attachments.map((att, idx) => (
                  <div key={idx} className="d-flex align-items-center justify-content-between small text-truncate my-1">
                    <a href={`${att.path}/${att.newName}`} download={att.ogName} className="text-truncate">
                      {att.ogName}
                    </a>
                    {onDeleteFile && (
                      <i
                        className="fa fa-trash text-danger ms-2"
                        style={{ cursor: 'pointer' }}
                        onClick={() => onDeleteFile(att.fileId, att.newName)}
                        title="Delete file"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Submit Buttons */}
        <div className="text-center mt-4 d-flex justify-content-center gap-2">
          {!isEditMode ? (
            <button type="submit" disabled={saving || loadingProjectNo} className={styles.btnSave}>
              <i className="fas fa-save me-1"></i> {saving ? 'Saving...' : loadingProjectNo ? 'Generating No...' : 'SAVE'}
            </button>
          ) : (
            <button type="submit" disabled={saving} className={styles.btnUpdate}>
              <i className="fas fa-edit me-1"></i> {saving ? 'Updating...' : 'Update'}
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary btn-sm rounded-pill px-4"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>

      <NpdConfirmModal
        isOpen={confirmOpen}
        title={isEditMode ? 'Update Project' : 'Save Project'}
        message={`Are you sure you want to ${isEditMode ? 'update' : 'save'} this NPD project?`}
        confirmText={isEditMode ? 'Update' : 'Save'}
        variant="primary"
        loading={saving}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
