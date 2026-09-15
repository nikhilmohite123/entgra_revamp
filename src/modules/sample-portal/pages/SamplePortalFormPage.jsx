import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, AlertCircle } from 'lucide-react';
import styles from '../styles/SampleForm.module.css';
import SamplePortalHeader from '../component/SamplePortalHeader';
import SamplePortalFooter from '../component/SamplePortalFooter';
import Toast from '../component/Toast';
import { useSamplePortal } from '../context/useSamplePortal';
import {
  CATEGORY_OPTIONS,
  TUBE_SHAPE_OPTIONS,
} from '../constants/samplePortalConstants';
import { ENV } from '../../../config/env';

export default function SamplePortalFormPage() {
  const navigate = useNavigate();
  const { userProfile, fetchRequests } = useSamplePortal();

  // Helper for today's date formatted YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Form State
  const [issueDate] = useState(getTodayDate);
  const [eplLocation, setEplLocation] = useState('');
  const [sType, setSType] = useState('');
  const [sCategory, setSCategory] = useState('');
  const [sPrintType, setSPrintType] = useState('');
  const [nTubeDiameter, setNTubeDiameter] = useState('');
  const [nPrintedLength, setNPrintedLength] = useState('');
  const [nCommercialLength, setNCommercialLength] = useState('');
  const [sWebType, setSWebType] = useState('');
  const [sLaminated, setSLaminated] = useState('');
  const [includedText, setIncludedText] = useState('');
  const [sTubeShape, setSTubeShape] = useState('');
  const [sShoulderColor, setSShoulderColor] = useState('');
  const [sThreadType, setSThreadType] = useState('');
  const [nOrifice, setNOrifice] = useState('');
  const [sTopSeal, setSTopSeal] = useState('');
  const [sCapCode, setSCapCode] = useState('');
  const [sCapOrientation, setSCapOrientation] = useState('');
  const [sTransportation, setSTransportation] = useState('');
  const [nQuantity, setNQuantity] = useState('');
  const [sSpecialRemarks, setSSpecialRemarks] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Status & UI States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const resetForm = () => {
    setEplLocation('');
    setSType('');
    setSCategory('');
    setSPrintType('');
    setNTubeDiameter('');
    setNPrintedLength('');
    setNCommercialLength('');
    setSWebType('');
    setSLaminated('');
    setIncludedText('');
    setSTubeShape('');
    setSShoulderColor('');
    setSThreadType('');
    setNOrifice('');
    setSTopSeal('');
    setSCapCode('');
    setSCapOrientation('');
    setSTransportation('');
    setNQuantity('');
    setSSpecialRemarks('');
    setSelectedFile(null);
    setErrorMsg('');
    setShowSuccessModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Required field validation
    if (
      !eplLocation.trim() ||
      !sType.trim() ||
      !sCategory.trim() ||
      !sTubeShape.trim() ||
      !nQuantity
    ) {
      const msg = 'Please fill in all required fields marked with *.';
      setErrorMsg(msg);
      showToast(msg, 'error');
      return;
    }

    if (sLaminated === 'Included' && !includedText.trim()) {
      const msg = 'Please enter Included tube type (e.g. ABL / PBL / OTHER).';
      setErrorMsg(msg);
      showToast(msg, 'error');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const uid = localStorage.getItem('uid') || 'anonymous';
      const fd = new FormData();

      fd.append('d_issue_date', issueDate);
      fd.append('s_created_by', uid);
      fd.append('s_applicant_name', userProfile.name || uid);
      fd.append('s_epl_location', eplLocation.trim());
      fd.append('s_type', sType.trim());
      fd.append('s_category', sCategory.trim());
      fd.append('s_print_type', sPrintType.trim());
      if (nTubeDiameter) fd.append('n_tube_diameter', nTubeDiameter);
      if (nPrintedLength) fd.append('n_printed_length', nPrintedLength);
      if (nCommercialLength) fd.append('n_commercial_length', nCommercialLength);
      fd.append('s_web_type', sWebType.trim());

      let laminatedVal = sLaminated;
      if (sLaminated === 'Included') {
        laminatedVal = 'Included';
        fd.append('s_tube_type_laminated_input', includedText.trim());
      } else {
        fd.append('s_tube_type_laminated_input', '');
      }
      fd.append('s_laminated', laminatedVal || '');

      fd.append('s_tube_shape', sTubeShape.trim());
      fd.append('s_shoulder_color', sShoulderColor.trim());
      fd.append('s_thread_type', sThreadType.trim());
      if (nOrifice) fd.append('n_orifice', nOrifice);
      fd.append('s_top_seal', sTopSeal.trim());
      fd.append('s_cap_code', sCapCode.trim());
      fd.append('s_cap_orientation', sCapOrientation.trim());
      fd.append('s_transportation', sTransportation.trim());
      fd.append('n_quantity', nQuantity);
      fd.append('s_special_remarks', sSpecialRemarks.trim());

      if (selectedFile) {
        fd.append('attachment', selectedFile);
      }

      const response = await fetch(`${ENV.API_BASE_URL}/bpmn/api/sample/addSample`, {
        method: 'POST',
        body: fd,
      });

      const res = await response.json();
      if (response.ok && res && res.success) {
        setShowSuccessModal(true);
        // Refresh requests cache in background
        fetchRequests();
      } else {
        const err = res?.message || 'Submission failed. Please check form values.';
        setErrorMsg(err);
        showToast(err, 'error');
      }
    } catch (err) {
      console.error('Submission error:', err);
      const errTxt = err.message || 'Server error occurred while submitting request.';
      setErrorMsg(errTxt);
      showToast(errTxt, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <SamplePortalHeader />

      <main className={styles.formMain}>
        {/* Back Button */}
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate('/sample_list')}
        >
          <ArrowLeft size={16} />
          <span>Back to Requests List</span>
        </button>

        <div className={styles.formContainer}>
          {/* Header */}
          <div className={styles.formHeader}>
            <div className={styles.moduleBadge}>Sample Request</div>
            <h1 className={styles.formTitle}>Sample Request Form</h1>
            <p className={styles.formSubtitle}>
              Complete all sections — our team will respond within 2 business days
            </p>
          </div>

          {/* Form Body */}
          <div className={styles.formBody}>
            <form onSubmit={handleSubmit} noValidate>
              {/* Auto Readonly Header Row */}
              <div className={styles.autoRow}>
                <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                  <label htmlFor="issueDate">Requested Date</label>
                  <input
                    type="date"
                    id="issueDate"
                    className={`${styles.input} ${styles.readonlyInput}`}
                    value={issueDate}
                    readOnly
                  />
                </div>
                <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                  <label htmlFor="applicantName">Applicant Name</label>
                  <input
                    type="text"
                    id="applicantName"
                    className={`${styles.input} ${styles.readonlyInput}`}
                    value={userProfile.name}
                    readOnly
                  />
                </div>
              </div>

              {/* EPL Location */}
              <div className={styles.formGroup}>
                <label htmlFor="eplLocation">
                  EPL Location <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="eplLocation"
                  className={styles.input}
                  placeholder="e.g. China, India, Poland…"
                  value={eplLocation}
                  onChange={(e) => setEplLocation(e.target.value)}
                  required
                />
              </div>

              {/* SECTION 1 — Tube Specification */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNum}>Section 1</span>
                  <span className={styles.sectionTitle}>Tube Specification</span>
                </div>
                <div className={styles.sectionBody}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="sType">
                        Type <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="text"
                        id="sType"
                        className={styles.input}
                        placeholder="e.g. Sample Tube"
                        value={sType}
                        onChange={(e) => setSType(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="sCategory">
                        Category <span className={styles.required}>*</span>
                      </label>
                      <div className={styles.selectWrap}>
                        <select
                          id="sCategory"
                          className={styles.select}
                          value={sCategory}
                          onChange={(e) => setSCategory(e.target.value)}
                          required
                        >
                          <option value="" disabled>
                            Select category
                          </option>
                          {CATEGORY_OPTIONS.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <span className={styles.selectArrow}>⌄</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="sPrintType">Print Type</label>
                      <input
                        type="text"
                        id="sPrintType"
                        className={styles.input}
                        placeholder="e.g. FLEXODIGITAL"
                        value={sPrintType}
                        onChange={(e) => setSPrintType(e.target.value)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="nTubeDiameter">Tube Diameter (mm)</label>
                      <input
                        type="number"
                        id="nTubeDiameter"
                        className={styles.input}
                        placeholder="e.g. 40"
                        min="0"
                        step="0.1"
                        value={nTubeDiameter}
                        onChange={(e) => setNTubeDiameter(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="nPrintedLength">Printed Length (mm)</label>
                      <input
                        type="number"
                        id="nPrintedLength"
                        className={styles.input}
                        placeholder="e.g. 151.3"
                        min="0"
                        step="0.1"
                        value={nPrintedLength}
                        onChange={(e) => setNPrintedLength(e.target.value)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="nCommercialLength">Commercial Length (mm)</label>
                      <input
                        type="number"
                        id="nCommercialLength"
                        className={styles.input}
                        placeholder="e.g. 149.8"
                        min="0"
                        step="0.1"
                        value={nCommercialLength}
                        onChange={(e) => setNCommercialLength(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="sWebType">Web Type</label>
                      <input
                        type="text"
                        id="sWebType"
                        className={styles.input}
                        placeholder="e.g. EP-3909CN_WHITE"
                        value={sWebType}
                        onChange={(e) => setSWebType(e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="sLaminated">Tube Type</label>
                      <div className={styles.selectWrap}>
                        <select
                          id="sLaminated"
                          className={styles.select}
                          value={sLaminated}
                          onChange={(e) => setSLaminated(e.target.value)}
                        >
                          <option value="">Select tube type</option>
                          <option value="Extruded">Extruded</option>
                          <option value="Included">Laminated</option>
                        </select>
                        <span className={styles.selectArrow}>⌄</span>
                      </div>

                      {/* Dynamic Included input */}
                      {sLaminated === 'Included' && (
                        <div style={{ marginTop: '10px' }}>
                          <input
                            type="text"
                            id="includedText"
                            className={styles.input}
                            placeholder="ABL / PBL / OTHER"
                            value={includedText}
                            onChange={(e) => setIncludedText(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    {/* Tube Shape */}
                    <div className={styles.formGroup}>
                      <label htmlFor="sTubeShape">
                        Tube Shape <span className={styles.required}>*</span>
                      </label>
                      <div className={styles.selectWrap}>
                        <select
                          id="sTubeShape"
                          className={styles.select}
                          value={sTubeShape}
                          onChange={(e) => setSTubeShape(e.target.value)}
                          required
                        >
                          {TUBE_SHAPE_OPTIONS.map((shp) => (
                            <option key={shp.value} value={shp.value}>
                              {shp.label}
                            </option>
                          ))}
                        </select>
                        <span className={styles.selectArrow}>⌄</span>
                      </div>
                    </div>

                    {/* Shoulder Color */}
                    <div className={styles.formGroup}>
                      <label htmlFor="sShoulderColor">
                        Shoulder Color (Pantone Shade)
                      </label>
                      <input
                        type="text"
                        id="sShoulderColor"
                        className={styles.input}
                        placeholder="e.g. Normal White W6482E"
                        value={sShoulderColor}
                        onChange={(e) => setSShoulderColor(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup} style={{ maxWidth: '340px' }}>
                    <label htmlFor="sThreadType">Thread Type</label>
                    <input
                      type="text"
                      id="sThreadType"
                      className={styles.input}
                      placeholder="e.g. B22_WITH_STOPPER"
                      value={sThreadType}
                      onChange={(e) => setSThreadType(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2 — Seal & Orifice */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNum}>Section 2</span>
                  <span className={styles.sectionTitle}>Seal &amp; Orifice</span>
                </div>
                <div className={styles.sectionBody}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="nOrifice">Orifice (mm)</label>
                      <input
                        type="number"
                        id="nOrifice"
                        className={styles.input}
                        placeholder="e.g. 8"
                        min="0"
                        step="0.1"
                        value={nOrifice}
                        onChange={(e) => setNOrifice(e.target.value)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="sTopSeal">Top Seal</label>
                      <input
                        type="text"
                        id="sTopSeal"
                        className={styles.input}
                        placeholder="e.g. No"
                        value={sTopSeal}
                        onChange={(e) => setSTopSeal(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3 — Cap & Transportation */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNum}>Section 3</span>
                  <span className={styles.sectionTitle}>Cap &amp; Transportation</span>
                </div>
                <div className={styles.sectionBody}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="sCapCode">Cap Type</label>
                      <input
                        type="text"
                        id="sCapCode"
                        className={styles.input}
                        placeholder="e.g. Without Cap"
                        value={sCapCode}
                        onChange={(e) => setSCapCode(e.target.value)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="sCapOrientation">Cap Orientation</label>
                      <input
                        type="text"
                        id="sCapOrientation"
                        className={styles.input}
                        placeholder="e.g. Yes"
                        value={sCapOrientation}
                        onChange={(e) => setSCapOrientation(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup} style={{ maxWidth: '340px' }}>
                    <label htmlFor="sTransportation">Transportation (Land / Air / Sea)</label>
                    <input
                      type="text"
                      id="sTransportation"
                      className={styles.input}
                      placeholder="e.g. Land"
                      value={sTransportation}
                      onChange={(e) => setSTransportation(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4 — Quantity, Remarks & Attachment */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNum}>Section 4</span>
                  <span className={styles.sectionTitle}>Quantity, Remarks &amp; Attachment</span>
                </div>
                <div className={styles.sectionBody}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="nQuantity">
                        Quantity <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="number"
                        id="nQuantity"
                        className={styles.input}
                        placeholder="e.g. 100"
                        min="1"
                        value={nQuantity}
                        onChange={(e) => setNQuantity(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="sSpecialRemarks">Special Requirements / Remarks</label>
                    <textarea
                      id="sSpecialRemarks"
                      className={styles.textarea}
                      rows={3}
                      placeholder="Any special instructions…"
                      value={sSpecialRemarks}
                      onChange={(e) => setSSpecialRemarks(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="attachmentInput">
                      Attachment <span className={styles.optional}>(Optional — PDF, DOC, Image)</span>
                    </label>
                    <label className={styles.fileLabel} htmlFor="attachmentInput">
                      <Upload size={16} />
                      <span>{selectedFile ? selectedFile.name : 'Choose file…'}</span>
                      <input
                        type="file"
                        id="attachmentInput"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className={styles.errorBanner} role="alert">
                  <AlertCircle size={18} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <div style={{ marginTop: '10px' }}>
                <button
                  type="submit"
                  id="submitBtn"
                  className={styles.submitBtn}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className={styles.btnLoader} />
                      <span>Submitting Request…</span>
                    </>
                  ) : (
                    <span>Submit Sample Request</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <SamplePortalFooter />

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.successModal}>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.successTitle}>Request Submitted!</h2>
            <p className={styles.successDesc}>
              Your sample request has been submitted successfully.
              <br />
              Shweta Gala has been notified and will respond within 2 business days.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.btnActionCancel}
                onClick={resetForm}
              >
                Submit Another
              </button>
              <button
                type="button"
                className={styles.btnActionSave}
                onClick={() => navigate('/sample_list')}
              >
                View My Requests
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
