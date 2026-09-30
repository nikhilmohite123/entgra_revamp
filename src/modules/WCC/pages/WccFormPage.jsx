import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  FileText,
  Save,
  Send,
  XCircle,
  RotateCcw,
  Share2,
  Paperclip,
  Printer,
  AlertCircle,
  Building,
  Calendar,
  Layers,
  FileCheck,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import formStyles from '../styles/WccForm.module.css';
import dashboardStyles from '../styles/WccDashboard.module.css';
import WccHeader from '../component/WccHeader';
import WccToast from '../component/WccToast';
import WccCwipTable from '../component/WccCwipTable';
import WccAssetManagementTable from '../component/WccAssetManagementTable';
import WccFileUploadModal from '../component/WccFileUploadModal';
import WccForwardModal from '../component/WccForwardModal';
import WccPdfPreviewModal from '../component/WccPdfPreviewModal';
import {
  BASE_URL,
  INITIAL_FORM_STATE,
  formatName,
  getTodayDate,
} from '../constants/wccConstants';
import { useWcc } from '../context/useWcc';

export default function WccFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isViewMode = location.pathname.includes('/view/');
  const isEditMode = Boolean(id) && !isViewMode;

  const {
    userRole,
    userLevel,
    locations,
    plantCodes,
    departments,
    metaDefaults,
    fetchRequestList,
    fetchUserLevel,
    get_reg_loc_lvl,
    toast,
    hideToast,
    showToast,
    uid,
    loginId,
  } = useWcc();

  // Form State
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [cwipItems, setCwipItems] = useState([]);
  const [hoAssetItems, setHoAssetItems] = useState([]);
  const [attachments, setAttachments] = useState({
    workcompletion_filename1: [],
    work_EPCG_filename1: [],
    sustainabilityAttachment_filename1: [],
    poAttachment_filename1: [],
  });

  // UI / Action States
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isHoVerified, setIsHoVerified] = useState(false);
  const [recordStatus, setRecordStatus] = useState(null); // e.g. -9 (rejected), 16 (forwarded)

  // Modals
  const [uploadModalState, setUploadModalState] = useState({
    isOpen: false,
    fileType: '',
    bindId: '',
  });
  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  // Active level calculation
  const currentLevel = Number(userLevel) || 1;
  const isInitiator =
    userRole === 'Inititior' ||
    userRole === 'In' ||
    currentLevel === 1;

  const isHoAccounts =
    userRole === 'HO accounts' ||
    currentLevel === 4 ||
    (loginId && loginId.toLowerCase() === 'pallav.bhatnagar');

  // Permission logic for editable fields
  const canEditGeneralFields = !isViewMode && isInitiator && !id;
  const canEditRemarksApproval = !isViewMode && currentLevel === 2;
  const canEditRemarksProjectHead = !isViewMode && currentLevel === 3;
  const canEditRemarksHo = !isViewMode && currentLevel === 4;
  const canEditRemarksForwarder = !isViewMode && (recordStatus === '16' || recordStatus === 16);

  // Authenticate user when creating a new request
  useEffect(() => {
    if (!id && !isViewMode) {
      const verifyAuth = async () => {
        let role = userRole;
        let lvl = userLevel;
        if (!role || !lvl) {
          const res = await fetchUserLevel();
          role = res?.userRole || 'In';
          lvl = res?.userLevel || '1';
        }
        const userIsInitiator =
          role === 'Inititior' ||
          role === 'In' ||
          String(lvl) === '1';

        if (!userIsInitiator) {
          showToast('You are not an authorized person; only Initiator can initiate a form.', 'error');
          navigate('/wcc');
        }
      };
      verifyAuth();
    }
  }, [id, isViewMode, userRole, userLevel, fetchUserLevel, navigate]);

  // Load Initial Defaults for New Request via legacy window.get_reg_loc_lvl logic
  useEffect(() => {
    if (!id) {
      let isMounted = true;
      get_reg_loc_lvl().then((res) => {
        if (!isMounted) return;
        if (res) {
          setFormData((prev) => ({
            ...prev,
            s_requestor_name: res.requestorName || localStorage.getItem('uid') || '',
            s_req_company: res.metaDefaults?.reqCompany || (res.data[0]?.s_company_code || '') + '-EPL Limited',
            s_camp_code: res.metaDefaults?.campCode || res.data[0]?.s_company_code || '',
            s_region: res.metaDefaults?.region || res.data[0]?.s_region || '',
            s_country: res.metaDefaults?.country || res.data[0]?.s_country || '',
            s_asset: res.metaDefaults?.asset || res.data[0]?.s_asset || '',
            s_location: res.defaultLocation || '',
            s_plant_code: res.defaultPlantCode || '',
            s_department: '',
            d_date_capitalisation: getTodayDate(),
            d_putup_use_date: getTodayDate(),
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            s_requestor_name: localStorage.getItem('uid') || uid || '',
            s_req_company: metaDefaults.reqCompany || '',
            s_camp_code: metaDefaults.campCode || '',
            s_region: metaDefaults.region || '',
            s_country: metaDefaults.country || '',
            s_asset: metaDefaults.asset || '',
            s_location: locations.length === 1 ? locations[0] : '',
            s_plant_code: plantCodes.length === 1 ? plantCodes[0] : '',
            s_department: '',
            d_date_capitalisation: getTodayDate(),
            d_putup_use_date: getTodayDate(),
          }));
        }
      });

      return () => {
        isMounted = false;
      };
    }
  }, [id, get_reg_loc_lvl]);

  // Load Existing Request Data if ID is present
  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    setLoading(true);

    fetch(`${BASE_URL}/workcompletionRoute/get_req_by_number?n_id=${encodeURIComponent(id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted || !Array.isArray(data) || data.length === 0) return;
        const row = data[0];

        setRecordStatus(row.n_sts || row.s_activity);

        // Format Dates
        const capDate = row.d_date_capitalisation
          ? new Date(row.d_date_capitalisation).toISOString().split('T')[0]
          : '';
        const putDate = row.d_putup_use_date
          ? new Date(row.d_putup_use_date).toISOString().split('T')[0]
          : '';

        setFormData({
          n_id: row.n_id || '',
          n_workcompletion_certificate_trail_id: row.workcompletion_certificate_trail_id || '',
          n_level: row.n_level || '1',
          n_status: row.n_sts || '',
          s_capex_approval_no: row.s_capex_approval_no || '',
          s_plant_code: row.s_plant_code || '',
          d_date_capitalisation: capDate,
          d_putup_use_date: putDate,
          s_requestor_name: row.s_requestor_name || '',
          s_location: row.s_location || '',
          s_req_company: row.s_req_compant || row.s_req_company || '',
          s_department: row.s_department || '',
          s_region: row.s_region || '',
          s_country: row.s_country || '',
          s_unit: row.s_unit || '',
          s_asset: row.s_asset || '',
          b_processing_of_con: row.b_processing_of_con === 1 || row.b_processing_of_con === 'yes' ? 'yes' : 'no',
          s_desc_processing_of_con: row.s_desc_processing_of_con || '',
          b_Availing_EPCG_scheme: row.b_Availing_EPCG_scheme === 1 || row.b_Availing_EPCG_scheme === 'yes' ? 'yes' : 'no',
          n_certificate_no: row.n_certificate_no || '',
          b_contribution_asset: row.b_contribution_asset === 1 || row.b_contribution_asset === 'yes' ? 'yes' : 'no',
          b_open_po_commitments: row.b_open_po_commitments === 1 || row.b_open_po_commitments === 'yes' ? 'yes' : 'no',
          b_triple_shipt_depreciation: row.b_triple_shipt_depreciation === 1 || row.b_triple_shipt_depreciation === 'yes' ? 'yes' : 'no',
          s_use_of_assets: row.s_use_of_assets || '',
          s_remark: row.s_remark || '',
          s_remark_approval: row.s_remark_approval || '',
          s_remark_projecthead: row.s_remark_projecthead || '',
          s_remark_hoaccount: row.s_remark_hoaccount || '',
          s_remark_forwarder: row.s_forwarder_remark || '',
          forwarder: '',
          remark_to_forwarer: '',
        });

        // Parse CWIP Items
        if (row.s_asset_details) {
          try {
            const clean = String(row.s_asset_details).replace(/\t/g, '\\t').replace(/\n/g, '\\n');
            const parsed = JSON.parse(clean);
            if (Array.isArray(parsed)) {
              setCwipItems(parsed);
            }
          } catch (e) {
            console.error('Error parsing CWIP items:', e);
          }
        }

        // Parse HO Assets
        if (row.s_input_hoaccount) {
          try {
            const parsedHo = JSON.parse(row.s_input_hoaccount);
            if (Array.isArray(parsedHo)) {
              setHoAssetItems(parsedHo);
              setIsHoVerified(true);
            }
          } catch (e) {
            console.error('Error parsing HO items:', e);
          }
        }

        // Parse Attachments
        if (row.files) {
          const fileEntries = String(row.files).split(',');
          const newAtts = {
            workcompletion_filename1: [],
            work_EPCG_filename1: [],
            sustainabilityAttachment_filename1: [],
            poAttachment_filename1: [],
          };

          fileEntries.forEach((entry, idx) => {
            const parts = entry.split('/');
            const type = parts[2];
            const fileName = parts[4] || parts[3] || 'File';
            const fileLink = `${BASE_URL}/WorkCompletion/${parts[3] || parts[4]}`;

            const fileObj = {
              name: fileName,
              link: fileLink,
              id: `${type}_${idx}`,
              rawPath: entry,
            };

            if (type === 'work_1_file') {
              newAtts.workcompletion_filename1.push(fileObj);
            } else if (type === 'work_EPCG_file') {
              newAtts.work_EPCG_filename1.push(fileObj);
            } else if (type === 'sustainabilityAttachment') {
              newAtts.sustainabilityAttachment_filename1.push(fileObj);
            } else if (type === 'poAttachment') {
              newAtts.poAttachment_filename1.push(fileObj);
            }
          });

          setAttachments(newAtts);
        }
      })
      .catch((err) => {
        console.error('Error fetching request details:', err);
        showToast('Failed to load request details', 'error');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, showToast]);

  // Handle Form Change
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Open File Upload Modal
  const handleOpenUpload = (fileType, bindId) => {
    setUploadModalState({
      isOpen: true,
      fileType,
      bindId,
    });
  };

  // On File Upload Success callback
  const handleUploadSuccess = (data, bindId, fileType) => {
    if (!Array.isArray(data)) return;

    const newFiles = data.map((elem, idx) => ({
      name: elem.s_ogi_name || 'Uploaded File',
      link: `${BASE_URL}${elem.s_path}/${elem.s_new_name}`,
      id: elem.n_temp_file_id || `${fileType}_${idx}`,
      rawName: elem.s_ogi_name,
    }));

    setAttachments((prev) => ({
      ...prev,
      [bindId]: [...(prev[bindId] || []), ...newFiles],
    }));
  };

  // Delete Attachment
  const handleDeleteAttachment = async (fileObj, bindId) => {
    if (!window.confirm(`Delete attached file "${fileObj.name}"?`)) return;

    try {
      if (fileObj.id) {
        await fetch(
          `${BASE_URL}/workcompletionRoute/deleteGear_temp?n_id=${encodeURIComponent(
            fileObj.id
          )}&s_ogi_name=${encodeURIComponent(fileObj.name)}`
        );
      }
      setAttachments((prev) => ({
        ...prev,
        [bindId]: (prev[bindId] || []).filter((f) => f.id !== fileObj.id),
      }));
      showToast('Attachment removed', 'info');
    } catch (err) {
      console.error('Error deleting attachment:', err);
    }
  };

  // Validation
  const validateForm = (tag) => {
    if (tag === 'SAVE') return true; // Draft allows partial save

    // Required fields check
    if (!formData.s_capex_approval_no.trim()) {
      showToast('Please enter CAPEX Approval No', 'error');
      return false;
    }
    if (!formData.s_plant_code) {
      showToast('Please select Plant Code', 'error');
      return false;
    }
    if (!formData.d_date_capitalisation) {
      showToast('Please enter Date Of Capitalisation', 'error');
      return false;
    }
    if (!formData.d_putup_use_date) {
      showToast('Please enter Put To Use Date', 'error');
      return false;
    }
    if (!formData.s_location) {
      showToast('Please select Unit / Location', 'error');
      return false;
    }
    if (!formData.s_department) {
      showToast('Please select Department', 'error');
      return false;
    }
    if (!formData.s_asset.trim()) {
      showToast('Please enter Asset Description', 'error');
      return false;
    }

    // Radio conditional checks
    if (formData.b_processing_of_con === 'yes' && !formData.s_desc_processing_of_con.trim()) {
      showToast('Please describe Pending Conditional Lines', 'error');
      return false;
    }
    if (formData.b_Availing_EPCG_scheme === 'yes') {
      if (!formData.n_certificate_no.trim()) {
        showToast('Please enter EPCG Certificate Number (12 digits)', 'error');
        return false;
      }
    }

    if (!formData.s_use_of_assets.trim()) {
      showToast('Please enter Use Of Assets description', 'error');
      return false;
    }

    // Level-specific validation
    if (currentLevel === 1 && !formData.s_remark.trim()) {
      showToast('Please enter Comment Of Unit Finance Head', 'error');
      return false;
    }
    if (currentLevel === 2 && !formData.s_remark_approval.trim()) {
      showToast('Please enter Comment Of Project Head', 'error');
      return false;
    }
    if (currentLevel === 3 && !formData.s_remark_projecthead.trim()) {
      showToast('Please enter Comment Of Unit Head', 'error');
      return false;
    }
    if (currentLevel === 4) {
      if (!formData.s_remark_hoaccount.trim()) {
        showToast('Please enter Comment Of CAPEX Controller (HO)', 'error');
        return false;
      }
      if (tag === 'SUBMIT' && !isHoVerified) {
        showToast(
          'HO Asset Management table checksum must be verified before completing.',
          'error'
        );
        return false;
      }
    }

    return true;
  };

  // Submit Action Handler (SAVE, SUBMIT, SENDBACK, REJECT, FORWARD, APPFORWARDED)
  const handleSubmitAction = async (tag, extraData = {}) => {
    if (!validateForm(tag)) return;

    let n_status = '1';
    if (tag === 'SAVE') n_status = '2';
    if (tag === 'SENDBACK') n_status = '-1';
    if (tag === 'REJECT') n_status = '-9';
    if (tag === 'FORWARD') n_status = '16';
    if (tag === 'APPFORWARDED') n_status = '17';

    setSubmitting(true);

    try {
      const payload = {
        n_id: formData.n_id || undefined,
        n_workcompletion_certificate_trail_id: formData.n_workcompletion_certificate_trail_id || undefined,
        leval: String(formData.n_level || userLevel || '1'),
        n_status,
        capexApprovalNo: formData.s_capex_approval_no,
        plantCode: formData.s_plant_code,
        capitalisationDate: formData.d_date_capitalisation,
        putToUseDate: formData.d_putup_use_date,
        requestorName: formData.s_requestor_name || uid,
        location: formData.s_location,
        reqCompany: formData.s_req_company,
        department: formData.s_department,
        region: formData.s_region,
        country: formData.s_country,
        unit: formData.s_unit || formData.s_location,
        s_asset: formData.s_asset,
        conditionalLine: formData.b_processing_of_con,
        descriptionOfConditionalLines: formData.s_desc_processing_of_con,
        epcg: formData.b_Availing_EPCG_scheme,
        certificateNo: formData.n_certificate_no,
        sustainability: formData.b_contribution_asset,
        poCommitments: formData.b_open_po_commitments,
        depreciation: formData.b_triple_shipt_depreciation,
        s_use_of_assets: formData.s_use_of_assets,
        s_remark: formData.s_remark,
        s_remark_approval: formData.s_remark_approval,
        s_remark_hoaccount: formData.s_remark_hoaccount,
        s_remark_projecthead: formData.s_remark_projecthead,
        s_asset_details: cwipItems,
        s_input_hoaccount: hoAssetItems,
        tag,
        s_created_by: uid,
        s_updated_by: uid,
        s_unithead_name: currentLevel === 2 ? uid : 'Null',
        s_projecthead_name: currentLevel === 3 ? uid : 'Null',
        s_hoaccounat_name: currentLevel === 4 ? uid : 'Null',
        forwarder: extraData.forwarder || formData.forwarder || '',
        remark_to_forwarer: extraData.remark_to_forwarer || formData.remark_to_forwarer || '',
        s_remark_forwarder: formData.s_remark_forwarder,
      };

      const response = await fetch(`${BASE_URL}/workcompletionRoute/insertformdata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result && result.code === 'ER_PARSE_ERROR') {
        showToast(result.sqlMessage || 'Database Error', 'error');
        return;
      }

      showToast(`Data successfully sent for ${tag}!`, 'success');
      fetchRequestList();
      navigate('/wcc');
    } catch (err) {
      console.error(`Error submitting ${tag}:`, err);
      showToast('Error sending data to the server: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Forwarding submit handler
  const handleForwardSubmit = (forwarderEmail, forwarderNote) => {
    setForwardModalOpen(false);
    handleSubmitAction('FORWARD', {
      forwarder: forwarderEmail,
      remark_to_forwarer: forwarderNote,
    });
  };

  const cwipTotalSum = useMemo(() => {
    return cwipItems.reduce(
      (sum, item) => sum + (Number(item.totalAmount) || 0),
      0
    );
  }, [cwipItems]);

  if (loading) {
    return (
      <div>
        <WccHeader />
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          Loading work completion certificate form...
        </div>
      </div>
    );
  }

  return (
    <div>
      <WccHeader />
      <WccToast toast={toast} onClose={hideToast} />

      <main className={formStyles.pageWrapper}>
        <div className={formStyles.formCard}>
          {/* Header */}
          <div className={formStyles.formHeader}>
            <div>
              <h2 className={formStyles.formTitle}>
                <FileCheck size={24} color="#062b67" />
                {id ? `Work Completion Certificate #${id}` : 'New Work Completion Certificate'}
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {isViewMode
                  ? 'View Only Mode'
                  : `Filling as Level ${currentLevel} (${userRole || 'Initiator'})`}
              </span>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setPdfModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#062b67',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Printer size={14} /> Preview Document
              </button>
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            {/* Section 1: Basic Information */}
            <div className={formStyles.sectionBox}>
              <div className={formStyles.sectionHeader}>
                <Building size={16} /> Basic Information
              </div>

              <div className={formStyles.grid3}>
                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>
                    CAPEX Approval No <span className={formStyles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={formStyles.input}
                    placeholder="Enter CAPEX Approval No"
                    value={formData.s_capex_approval_no}
                    disabled={!canEditGeneralFields}
                    onChange={(e) => handleChange('s_capex_approval_no', e.target.value)}
                    required
                  />
                </div>

                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>
                    Plant Code <span className={formStyles.required}>*</span>
                  </label>
                  <select
                    className={formStyles.select}
                    value={formData.s_plant_code}
                    disabled={!canEditGeneralFields}
                    onChange={(e) => handleChange('s_plant_code', e.target.value)}
                    required
                  >
                    <option value="">-- Select Plant Code --</option>
                    {plantCodes.map((code, idx) => (
                      <option key={idx} value={code}>
                        {code}
                      </option>
                    ))}
                    {formData.s_plant_code && !plantCodes.includes(formData.s_plant_code) && (
                      <option value={formData.s_plant_code}>{formData.s_plant_code}</option>
                    )}
                  </select>
                </div>

                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>
                    Date Of Capitalisation <span className={formStyles.required}>*</span>
                  </label>
                  <input
                    type="date"
                    className={formStyles.input}
                    value={formData.d_date_capitalisation}
                    disabled={!canEditGeneralFields}
                    onChange={(e) => handleChange('d_date_capitalisation', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={formStyles.grid3}>
                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>
                    Put To Use Date <span className={formStyles.required}>*</span>
                  </label>
                  <input
                    type="date"
                    className={formStyles.input}
                    value={formData.d_putup_use_date}
                    disabled={!canEditGeneralFields}
                    onChange={(e) => handleChange('d_putup_use_date', e.target.value)}
                    required
                  />
                </div>

                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>
                    Requestor Name <span className={formStyles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={formStyles.input}
                    value={formData.s_requestor_name}
                    disabled
                  />
                </div>

                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>
                    Unit / Location <span className={formStyles.required}>*</span>
                  </label>
                  <select
                    className={formStyles.select}
                    value={formData.s_location}
                    disabled={!canEditGeneralFields}
                    onChange={(e) => handleChange('s_location', e.target.value)}
                    required
                  >
                    <option value="">-- Select Unit / Location --</option>
                    {locations.map((loc, idx) => (
                      <option key={idx} value={loc}>
                        {loc}
                      </option>
                    ))}
                    {formData.s_location && !locations.includes(formData.s_location) && (
                      <option value={formData.s_location}>{formData.s_location}</option>
                    )}
                  </select>
                </div>
              </div>

              <div className={formStyles.grid3}>
                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>
                    Req. Company Code <span className={formStyles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={formStyles.input}
                    value={formData.s_req_company}
                    disabled
                  />
                </div>

                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>
                    Department <span className={formStyles.required}>*</span>
                  </label>
                  <select
                    className={formStyles.select}
                    value={formData.s_department}
                    disabled={!canEditGeneralFields}
                    onChange={(e) => handleChange('s_department', e.target.value)}
                    required
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map((dept, idx) => (
                      <option key={idx} value={dept}>
                        {dept}
                      </option>
                    ))}
                    {formData.s_department && !departments.includes(formData.s_department) && (
                      <option value={formData.s_department}>{formData.s_department}</option>
                    )}
                  </select>
                </div>

                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>
                    Region & Country <span className={formStyles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={formStyles.input}
                    value={`${formData.s_region || ''} ${formData.s_country ? `(${formData.s_country})` : ''}`}
                    disabled
                  />
                </div>
              </div>

              <div className={formStyles.grid1}>
                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>
                    Asset Description <span className={formStyles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={formStyles.input}
                    placeholder="Identification for Asset (e.g., Name / Description)"
                    value={formData.s_asset}
                    disabled={!canEditGeneralFields}
                    onChange={(e) => handleChange('s_asset', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Conditional Line Items & Compliance Questions */}
            <div className={formStyles.sectionBox} style={{ marginTop: '1.25rem' }}>
              <div className={formStyles.sectionHeader}>
                <Layers size={16} /> Compliance & Schemes
              </div>

              <div className={formStyles.grid3}>
                {/* 1. Processing of Conditional Lines */}
                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>
                    Processing Of Conditional Line Items <span className={formStyles.required}>*</span>
                  </label>
                  <div className={formStyles.radioGroup}>
                    <input
                      type="radio"
                      id="condYes"
                      name="b_processing_of_con"
                      value="yes"
                      className={formStyles.radioInput}
                      checked={formData.b_processing_of_con === 'yes'}
                      disabled={!canEditGeneralFields}
                      onChange={(e) => handleChange('b_processing_of_con', e.target.value)}
                    />
                    <label htmlFor="condYes" className={formStyles.radioLabel}>Yes</label>

                    <input
                      type="radio"
                      id="condNo"
                      name="b_processing_of_con"
                      value="no"
                      className={formStyles.radioInput}
                      checked={formData.b_processing_of_con === 'no'}
                      disabled={!canEditGeneralFields}
                      onChange={(e) => handleChange('b_processing_of_con', e.target.value)}
                    />
                    <label htmlFor="condNo" className={formStyles.radioLabel}>No</label>
                  </div>

                  {formData.b_processing_of_con === 'yes' && (
                    <div className={formStyles.conditionalBox}>
                      <textarea
                        className={formStyles.textarea}
                        placeholder="Describe Pending Conditional Lines (Max 500 characters) *"
                        maxLength={500}
                        value={formData.s_desc_processing_of_con}
                        disabled={!canEditGeneralFields}
                        onChange={(e) => handleChange('s_desc_processing_of_con', e.target.value)}
                        required
                      />
                    </div>
                  )}
                </div>

                {/* 2. EPCG Scheme */}
                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>
                    Availing EPCG Scheme <span className={formStyles.required}>*</span>
                  </label>
                  <div className={formStyles.radioGroup}>
                    <input
                      type="radio"
                      id="epcgYes"
                      name="b_Availing_EPCG_scheme"
                      value="yes"
                      className={formStyles.radioInput}
                      checked={formData.b_Availing_EPCG_scheme === 'yes'}
                      disabled={!canEditGeneralFields}
                      onChange={(e) => handleChange('b_Availing_EPCG_scheme', e.target.value)}
                    />
                    <label htmlFor="epcgYes" className={formStyles.radioLabel}>Yes</label>

                    <input
                      type="radio"
                      id="epcgNo"
                      name="b_Availing_EPCG_scheme"
                      value="no"
                      className={formStyles.radioInput}
                      checked={formData.b_Availing_EPCG_scheme === 'no'}
                      disabled={!canEditGeneralFields}
                      onChange={(e) => handleChange('b_Availing_EPCG_scheme', e.target.value)}
                    />
                    <label htmlFor="epcgNo" className={formStyles.radioLabel}>No</label>
                  </div>

                  {formData.b_Availing_EPCG_scheme === 'yes' && (
                    <div className={formStyles.conditionalBox}>
                      <input
                        type="text"
                        className={formStyles.input}
                        placeholder="Enter Certificate Number (12 digits)"
                        value={formData.n_certificate_no}
                        disabled={!canEditGeneralFields}
                        onChange={(e) => handleChange('n_certificate_no', e.target.value)}
                        required
                      />

                      {!isViewMode && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          onClick={() => handleOpenUpload('work_EPCG_file', 'work_EPCG_filename1')}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#e2e8f0',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                          }}
                        >
                          <Paperclip size={14} /> Attach EPCG Document
                        </button>
                      )}

                      {/* Display attached file list */}
                      {attachments.work_EPCG_filename1.map((f, i) => (
                        <div key={i} className={formStyles.attachmentPill}>
                          <a href={f.link} target="_blank" rel="noreferrer">
                            {f.name}
                          </a>
                          {!isViewMode && (
                            <button
                              type="button"
                              onClick={() => handleDeleteAttachment(f, 'work_EPCG_filename1')}
                              className={formStyles.deleteAttachmentBtn}
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Contribution to Sustainability */}
                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>
                    Sustainability Contribution <span className={formStyles.required}>*</span>
                  </label>
                  <div className={formStyles.radioGroup}>
                    <input
                      type="radio"
                      id="sustYes"
                      name="b_contribution_asset"
                      value="yes"
                      className={formStyles.radioInput}
                      checked={formData.b_contribution_asset === 'yes'}
                      disabled={!canEditGeneralFields}
                      onChange={(e) => handleChange('b_contribution_asset', e.target.value)}
                    />
                    <label htmlFor="sustYes" className={formStyles.radioLabel}>Yes</label>

                    <input
                      type="radio"
                      id="sustNo"
                      name="b_contribution_asset"
                      value="no"
                      className={formStyles.radioInput}
                      checked={formData.b_contribution_asset === 'no'}
                      disabled={!canEditGeneralFields}
                      onChange={(e) => handleChange('b_contribution_asset', e.target.value)}
                    />
                    <label htmlFor="sustNo" className={formStyles.radioLabel}>No</label>
                  </div>

                  {formData.b_contribution_asset === 'yes' && (
                    <div className={formStyles.conditionalBox}>
                      {!isViewMode && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          onClick={() => handleOpenUpload('sustainabilityAttachment', 'sustainabilityAttachment_filename1')}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#e2e8f0',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                          }}
                        >
                          <Paperclip size={14} /> Attach Sustainability Doc
                        </button>
                      )}

                      {attachments.sustainabilityAttachment_filename1.map((f, i) => (
                        <div key={i} className={formStyles.attachmentPill}>
                          <a href={f.link} target="_blank" rel="noreferrer">
                            {f.name}
                          </a>
                          {!isViewMode && (
                            <button
                              type="button"
                              onClick={() => handleDeleteAttachment(f, 'sustainabilityAttachment_filename1')}
                              className={formStyles.deleteAttachmentBtn}
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className={formStyles.grid2} style={{ marginTop: '0.5rem' }}>
                {/* 4. Open PO Commitments */}
                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>
                    Open PO Commitments <span className={formStyles.required}>*</span>
                  </label>
                  <div className={formStyles.radioGroup}>
                    <input
                      type="radio"
                      id="poYes"
                      name="b_open_po_commitments"
                      value="yes"
                      className={formStyles.radioInput}
                      checked={formData.b_open_po_commitments === 'yes'}
                      disabled={!canEditGeneralFields}
                      onChange={(e) => handleChange('b_open_po_commitments', e.target.value)}
                    />
                    <label htmlFor="poYes" className={formStyles.radioLabel}>Yes</label>

                    <input
                      type="radio"
                      id="poNo"
                      name="b_open_po_commitments"
                      value="no"
                      className={formStyles.radioInput}
                      checked={formData.b_open_po_commitments === 'no'}
                      disabled={!canEditGeneralFields}
                      onChange={(e) => handleChange('b_open_po_commitments', e.target.value)}
                    />
                    <label htmlFor="poNo" className={formStyles.radioLabel}>No</label>
                  </div>

                  {formData.b_open_po_commitments === 'yes' && (
                    <div className={formStyles.conditionalBox}>
                      {!isViewMode && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          onClick={() => handleOpenUpload('poAttachment', 'poAttachment_filename1')}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#e2e8f0',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                          }}
                        >
                          <Paperclip size={14} /> Attach PO Document
                        </button>
                      )}

                      {attachments.poAttachment_filename1.map((f, i) => (
                        <div key={i} className={formStyles.attachmentPill}>
                          <a href={f.link} target="_blank" rel="noreferrer">
                            {f.name}
                          </a>
                          {!isViewMode && (
                            <button
                              type="button"
                              onClick={() => handleDeleteAttachment(f, 'poAttachment_filename1')}
                              className={formStyles.deleteAttachmentBtn}
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. Triple Shift Depreciation */}
                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>
                    Triple Shift Depreciation <span className={formStyles.required}>*</span>
                  </label>
                  <div className={formStyles.radioGroup}>
                    <input
                      type="radio"
                      id="depYes"
                      name="b_triple_shipt_depreciation"
                      value="yes"
                      className={formStyles.radioInput}
                      checked={formData.b_triple_shipt_depreciation === 'yes'}
                      disabled={!canEditGeneralFields}
                      onChange={(e) => handleChange('b_triple_shipt_depreciation', e.target.value)}
                    />
                    <label htmlFor="depYes" className={formStyles.radioLabel}>Yes</label>

                    <input
                      type="radio"
                      id="depNo"
                      name="b_triple_shipt_depreciation"
                      value="no"
                      className={formStyles.radioInput}
                      checked={formData.b_triple_shipt_depreciation === 'no'}
                      disabled={!canEditGeneralFields}
                      onChange={(e) => handleChange('b_triple_shipt_depreciation', e.target.value)}
                    />
                    <label htmlFor="depNo" className={formStyles.radioLabel}>No</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: CWIP Line Items */}
            <div className={formStyles.sectionBox} style={{ marginTop: '1.25rem' }}>
              <div className={formStyles.sectionHeader}>
                <Layers size={16} /> CWIP Details & Financial Breakdown
              </div>

              <WccCwipTable
                items={cwipItems}
                setItems={setCwipItems}
                isEditable={!isViewMode && isInitiator}
              />

              {/* Use of Assets */}
              <div className={formStyles.formGroup} style={{ marginTop: '1rem' }}>
                <label className={formStyles.label}>
                  Use Of Assets <span className={formStyles.required}>*</span>
                </label>
                <textarea
                  className={formStyles.textarea}
                  placeholder="Describe the intended operational use of the assets (Max 1000 characters) *"
                  maxLength={1000}
                  value={formData.s_use_of_assets}
                  disabled={!canEditGeneralFields}
                  onChange={(e) => handleChange('s_use_of_assets', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Section 4: HO Asset Management Form (Visible for HO Accounts / Level 4) */}
            {isHoAccounts && (
              <WccAssetManagementTable
                items={hoAssetItems}
                setItems={setHoAssetItems}
                cwipTotalSum={cwipTotalSum}
                isVerified={isHoVerified}
                setIsVerified={setIsHoVerified}
                isEditable={!isViewMode && canEditRemarksHo}
              />
            )}

            {/* Section 5: General File Attachment */}
            <div className={formStyles.sectionBox} style={{ marginTop: '1.25rem' }}>
              <div className={formStyles.sectionHeader}>
                <Paperclip size={16} /> Certificate Attachments & Supporting Documents
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {!isViewMode && (
                  <button
                    type="button"
                    onClick={() => handleOpenUpload('work_1_file', 'workcompletion_filename1')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    <Paperclip size={15} /> Upload Certificate Document
                  </button>
                )}

                {attachments.workcompletion_filename1.map((f, i) => (
                  <div key={i} className={formStyles.attachmentPill}>
                    <a href={f.link} target="_blank" rel="noreferrer">
                      {f.name}
                    </a>
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAttachment(f, 'workcompletion_filename1')}
                        className={formStyles.deleteAttachmentBtn}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 6: Comments & Approval Audit */}
            <div className={formStyles.sectionBox} style={{ marginTop: '1.25rem' }}>
              <div className={formStyles.sectionHeader}>
                <FileText size={16} /> Approver Comments & Remarks
              </div>

              {/* Unit Finance Head */}
              <div className={formStyles.formGroup}>
                <label className={formStyles.label}>
                  Comment Of Unit Finance Head <span className={formStyles.required}>*</span>
                </label>
                <textarea
                  className={formStyles.textarea}
                  placeholder="Enter comments from Unit Finance Head..."
                  maxLength={1000}
                  value={formData.s_remark}
                  disabled={!canEditGeneralFields && currentLevel !== 1}
                  onChange={(e) => handleChange('s_remark', e.target.value)}
                  required
                />
              </div>

              {/* Project Head (Level 2) */}
              {(currentLevel >= 2 || formData.s_remark_approval) && (
                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>
                    Comment Of Project Head <span className={formStyles.required}>*</span>
                  </label>
                  <textarea
                    className={formStyles.textarea}
                    placeholder="Enter approval comments from Project Head..."
                    maxLength={1000}
                    value={formData.s_remark_approval}
                    disabled={!canEditRemarksApproval}
                    onChange={(e) => handleChange('s_remark_approval', e.target.value)}
                  />
                </div>
              )}

              {/* Unit Head (Level 3) */}
              {(currentLevel >= 3 || formData.s_remark_projecthead) && (
                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>
                    Comment Of Unit Head <span className={formStyles.required}>*</span>
                  </label>
                  <textarea
                    className={formStyles.textarea}
                    placeholder="Enter comments from Unit Head..."
                    maxLength={1000}
                    value={formData.s_remark_projecthead}
                    disabled={!canEditRemarksProjectHead}
                    onChange={(e) => handleChange('s_remark_projecthead', e.target.value)}
                  />
                </div>
              )}

              {/* CAPEX Controller HO (Level 4) */}
              {(currentLevel >= 4 || formData.s_remark_hoaccount) && (
                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>
                    Comment Of CAPEX Controller (HO) <span className={formStyles.required}>*</span>
                  </label>
                  <textarea
                    className={formStyles.textarea}
                    placeholder="Enter final review comments from CAPEX Controller..."
                    maxLength={1000}
                    value={formData.s_remark_hoaccount}
                    disabled={!canEditRemarksHo}
                    onChange={(e) => handleChange('s_remark_hoaccount', e.target.value)}
                  />
                </div>
              )}

              {/* Forwarder Comment */}
              {(recordStatus === '16' || recordStatus === 16 || formData.s_remark_forwarder) && (
                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>
                    Comment Of Forwarder <span className={formStyles.required}>*</span>
                  </label>
                  <textarea
                    className={formStyles.textarea}
                    placeholder="Enter forwarder comments..."
                    maxLength={1000}
                    value={formData.s_remark_forwarder}
                    disabled={!canEditRemarksForwarder}
                    onChange={(e) => handleChange('s_remark_forwarder', e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Section 7: Form Actions Bar */}
            {!isViewMode && (
              <div className={formStyles.formActions}>
                {/* Save Draft (Initiator) */}
                {isInitiator && !id && (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSubmitAction('SAVE')}
                    className={`${formStyles.btnAction} ${formStyles.btnDraft}`}
                  >
                    <Save size={15} /> Save As Draft
                  </button>
                )}

                {/* Reject (Approvers: Level 2, 3, 4) */}
                {(currentLevel === 2 || currentLevel === 3 || currentLevel === 4) && (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSubmitAction('REJECT')}
                    className={`${formStyles.btnAction} ${formStyles.btnReject}`}
                  >
                    <XCircle size={15} /> Reject
                  </button>
                )}

                {/* Return To Initiator (Approvers: Level 2, 3, 4) */}
                {(currentLevel === 2 || currentLevel === 3 || currentLevel === 4) && (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSubmitAction('SENDBACK')}
                    className={`${formStyles.btnAction} ${formStyles.btnReturn}`}
                  >
                    <RotateCcw size={15} /> Return To Initiator
                  </button>
                )}

                {/* Forward (Approvers: Level 2, 3, 4) */}
                {(currentLevel === 2 || currentLevel === 3 || currentLevel === 4) && (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => setForwardModalOpen(true)}
                    className={`${formStyles.btnAction} ${formStyles.btnForward}`}
                  >
                    <Share2 size={15} /> Forward
                  </button>
                )}

                {/* Approve Forwarded (Activity 16) */}
                {(recordStatus === '16' || recordStatus === 16) && (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSubmitAction('APPFORWARDED')}
                    className={`${formStyles.btnAction} ${formStyles.btnSubmit}`}
                  >
                    <Send size={15} /> Approve Forwarded
                  </button>
                )}

                {/* Submit / Approve / Complete */}
                {recordStatus !== '16' && recordStatus !== 16 && (
                  <button
                    type="button"
                    disabled={submitting || (currentLevel === 4 && !isHoVerified)}
                    onClick={() => handleSubmitAction('SUBMIT')}
                    className={`${formStyles.btnAction} ${formStyles.btnSubmit}`}
                  >
                    <Send size={15} />{' '}
                    {currentLevel === 4
                      ? 'Complete Certificate'
                      : currentLevel > 1
                      ? 'Approve Request'
                      : 'Submit Request'}
                  </button>
                )}
              </div>
            )}
          </form>
        </div>
      </main>

      {/* File Upload Modal */}
      <WccFileUploadModal
        isOpen={uploadModalState.isOpen}
        onClose={() => setUploadModalState({ isOpen: false, fileType: '', bindId: '' })}
        fileType={uploadModalState.fileType}
        bindId={uploadModalState.bindId}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Forward Modal */}
      <WccForwardModal
        isOpen={forwardModalOpen}
        onClose={() => setForwardModalOpen(false)}
        onForwardSubmit={handleForwardSubmit}
        loading={submitting}
      />

      {/* PDF / Print Preview Modal */}
      <WccPdfPreviewModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        formData={formData}
        cwipItems={cwipItems}
        hoAssetItems={hoAssetItems}
      />
    </div>
  );
}
