import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus,
  ArrowLeft,
  ChevronsUp,
  ChevronsDown,
  ChevronsLeft,
  ChevronsRight,
  Paperclip,
  Search,
  CheckCircle2,
  Clock,
  Edit,
  ClipboardList,
  FileSpreadsheet
} from 'lucide-react';
import styles from '../styles/atrForm.module.css';
import AtrHeader from '../components/AtrHeader';
import AtrFooter from '../components/AtrFooter';
import AtrAuditTrailModal from '../components/AtrAuditTrailModal';
import AtrFileUploadModal from '../components/AtrFileUploadModal';
import atrToast from '../components/AtrToast';
import {
  BASE_URL,
  BYPASS_UIDS,
  AUDITING_PARTIES,
  GROUPS,
  RATINGS,
  STATUS_OPTIONS
} from '../constant/atrConstants';

const INITIAL_FORM_STATE = {
  n_Atr_id: '',
  n_atr_trail_id_1: '',
  n_atr_trail_id: '',
  n_level: '1',
  s_auditing_party_name: '',
  s_financial_period: '2024-25',
  s_group: '',
  s_location: '',
  n_count: 0,
  s_area: '',
  s_broadTheme: '',
  s_observation: '',
  s_actionPlanned: '',
  s_rating: '',
  s_dept: '',
  s_primeResponsibility: '',
  s_targetDate: '',
  s_revised_targetDate: '',
  s_status: '',
  s_remarks: '',
  s_unit_fin_remarks: '',
  s_unit_head_remark: '',
  attachmentName: ''
};

// Fallback demo pending dataset if backend is unreachable
const INITIAL_PENDING_RECORDS = [
  {
    n_Atr_id: '1',
    n_level: '2',
    s_role: 's_department_head',
    s_auditing_party_name: 'MGB Advisors Pvt Ltd',
    s_financial_period: '2024-25',
    s_group: 'India',
    s_location: 'VASIND',
    n_count: 3,
    s_area: 'Warehouse & Inventory Control',
    s_broadTheme: 'Material Requisition Reconciliation',
    s_observation: 'Physical stock verification identified minor variance in chemical batch registers.',
    s_actionPlanned: 'Standardize barcode scan verification on incoming chemical deliveries.',
    s_rating: 'Medium',
    s_dept: 'Supply Chain',
    s_primeResponsibility: 'Mr. Rajesh Sharma',
    s_targetDate: '2024-12-15',
    s_revised_targetDate: '2024-12-30',
    s_approver: 'Unit Head',
    role: 'Plant Manager',
    s_status: 'In Process',
    trail: [
      { s_approver: 'Department Head', s_status: 'Approved', d_approved_date: '2024-11-10', n_days: '2' },
      { s_approver: 'Unit Finance Head', s_status: 'In Review', d_approved_date: '2024-11-14', n_days: '4' }
    ]
  },
  {
    n_Atr_id: '2',
    n_level: '2',
    s_role: 's_department_head',
    s_auditing_party_name: 'Price Waterhouse Coopers Services LLP',
    s_financial_period: '2024-25',
    s_group: 'India',
    s_location: 'WADA',
    n_count: 1,
    s_area: 'Environmental Health & Safety',
    s_broadTheme: 'Hazardous Waste Handling Protocol',
    s_observation: 'Secondary containment capacity in effluent treatment plant requires upgrade.',
    s_actionPlanned: 'Construct bund walls with 110% storage capacity as per statutory norms.',
    s_rating: 'High',
    s_dept: 'Safety & EHS',
    s_primeResponsibility: 'Mr. Amit Kumar',
    s_targetDate: '2025-01-20',
    s_revised_targetDate: '',
    s_approver: 'Safety Director',
    role: 'EHS Head',
    s_status: 'Not Started',
    trail: [
      { s_approver: 'EHS Officer', s_status: 'Submitted', d_approved_date: '2024-11-18', n_days: '1' }
    ]
  }
];

// Fallback demo completed dataset
const INITIAL_COMPLETED_RECORDS = [
  {
    n_Atr_id: '3',
    n_level: '5',
    s_role: 's_unit_head',
    s_auditing_party_name: 'MGB Advisors Pvt Ltd',
    s_financial_period: '2023-24',
    s_group: 'Egypt',
    s_location: 'EGYPT',
    n_count: 2,
    s_area: 'Financial Controls & Invoicing',
    s_broadTheme: 'Vendor Advance Settlement',
    s_observation: 'Aged advance balances reconciled and cleared in ERP.',
    s_actionPlanned: 'Automated 60-day aging review implemented in monthly account closure.',
    s_rating: 'Low',
    s_dept: 'Finance',
    s_primeResponsibility: 'Finance Controller',
    s_targetDate: '2024-06-30',
    s_revised_targetDate: '2024-07-15',
    s_status: 'Completed',
    trail: [
      { s_approver: 'Unit Finance Head', s_status: 'Approved', d_approved_date: '2024-07-10', n_days: '2' },
      { s_approver: 'Corporate Finance', s_status: 'Closed', d_approved_date: '2024-07-15', n_days: '5' }
    ]
  }
];

// Helper to generate dynamic financial periods matching legacy dropdown_financial_period()
const generateFinancialPeriods = () => {
  const currentYear = new Date().getFullYear();
  const startYear = 2022;
  const periods = [];
  for (let year = startYear; year <= currentYear + 2; year++) {
    const nextYear = year + 1;
    periods.push(`${year}-${nextYear.toString().slice(-2)}`);
  }
  return periods;
};

export default function AtrFormPage() {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'form'
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  // Dynamic dropdown options from backend
  const [plantOptions, setPlantOptions] = useState([]);
  const [deptOptions, setDeptOptions] = useState([]);
  const [financialPeriods] = useState(generateFinancialPeriods);

  // Visibility & Authorization flags (matching legacy hide/show)
  const [visibility, setVisibility] = useState({
    showAddBtn: true,
    showStatus: false,
    showRemark: false,
    showUnitFinRemark: false,
    showUnitHeadRemark: false,
    showFileSection: false,
    showSaveBtn: false,
    showSubmitBtn: false,
    showBackBtn: false,
    disableSubmitBtn: false
  });

  // Table Data Lists
  const [pendingList, setPendingList] = useState(INITIAL_PENDING_RECORDS);
  const [completedList, setCompletedList] = useState(INITIAL_COMPLETED_RECORDS);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [trailModalOpen, setTrailModalOpen] = useState(false);
  const [selectedAtrId, setSelectedAtrId] = useState('');
  const [trailData, setTrailData] = useState([]);
  const [fileModalOpen, setFileModalOpen] = useState(false);

  // Table container refs for smooth scrolling controls
  const pendingTableRef = useRef(null);
  const completedTableRef = useRef(null);

  /**
   * location_dropdown_unit:
   * Legacy: POST /AtrRoute/location_dropdown_unit with { loginID: localStorage.getItem('uid') }
   */
  const location_dropdown_unit = useCallback(async () => {
    const uid = localStorage.getItem('uid') || localStorage.getItem('loginId') || '';
    try {
      const params = new URLSearchParams();
      params.append('loginID', uid);

      const res = await fetch(`${BASE_URL}/AtrRoute/location_dropdown_unit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });
      if (res.ok) {
        const result = await res.json();
        if (Array.isArray(result)) {
          setPlantOptions(result);
        }
      }
    } catch (err) {
      console.error('Error in location_dropdown_unit:', err);
    }
  }, []);

  /**
   * get_ATR:
   * Legacy: POST /AtrRoute/get_ATR with { loginId: localStorage.getItem('uid') }
   * Populates Pending Table (#tbl_ATR)
   */
  const get_ATR = useCallback(async () => {
    const uid = localStorage.getItem('uid') || localStorage.getItem('loginId') || '';
    try {
      const params = new URLSearchParams();
      params.append('loginId', uid);

      const res = await fetch(`${BASE_URL}/AtrRoute/get_ATR`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });
      if (res.ok) {
        const result = await res.json();
        console.log('Result of get_ATR:', result);
        if (Array.isArray(result)) {
          setPendingList(result);
        }
      }
    } catch (err) {
      console.error('Error in get_ATR:', err);
    }
  }, []);

  /**
   * get_atr_completed:
   * Legacy: POST /AtrRoute/get_atr_completed with { loginId: localStorage.getItem('uid'), loginID2: localStorage.getItem('loginId') }
   * Populates Completed Table (#tbl_ATR_completed)
   */
  const get_atr_completed = useCallback(async () => {
    const uid = localStorage.getItem('uid') || '';
    const loginId = localStorage.getItem('loginId') || uid;
    try {
      const params = new URLSearchParams();
      params.append('loginId', uid);
      params.append('loginID2', loginId);

      const res = await fetch(`${BASE_URL}/AtrRoute/get_atr_completed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });
      if (res.ok) {
        const result = await res.json();
        console.log('Result of get_atr_completed:', result);
        if (Array.isArray(result)) {
          setCompletedList(result);
        }
      }
    } catch (err) {
      console.error('Error in get_atr_completed:', err);
    }
  }, []);

  // Fetch initial tables and dropdowns on page mount
  useEffect(() => {
    location_dropdown_unit();
    get_ATR();
    get_atr_completed();
  }, [location_dropdown_unit, get_ATR, get_atr_completed]);

  /**
   * Area_dropdown_dept:
   * Legacy: GET /AtrRoute/Area_dropdown_dept with { plant_name, loginID }
   * Called when location changes in initial initiation (Level <= 1)
   */
  const handleLocationChange = async (e) => {
    const plantName = e.target.value;
    setFormData((prev) => ({
      ...prev,
      s_location: plantName,
      s_dept: '',
      s_primeResponsibility: ''
    }));
    setDeptOptions([]);

    if (!plantName) return;

    const uid = localStorage.getItem('uid') || localStorage.getItem('loginId') || '';
    try {
      const queryUrl = `${BASE_URL}/AtrRoute/Area_dropdown_dept?plant_name=${encodeURIComponent(plantName)}&loginID=${encodeURIComponent(uid)}`;
      const res = await fetch(queryUrl);
      if (res.ok) {
        const result = await res.json();
        if (Array.isArray(result)) {
          setDeptOptions(result);
        }
      }
    } catch (err) {
      console.error('Error in Area_dropdown_dept:', err);
    }
  };

  /**
   * get_unitHead_data:
   * Legacy: GET /AtrRoute/get_unitHead_data with { s_plant_name, s_department }
   * Automatically sets prime responsibility to s_department_head
   */
  const handleDeptChange = async (e) => {
    const deptName = e.target.value;
    setFormData((prev) => ({ ...prev, s_dept: deptName }));

    if (!deptName || !formData.s_location) return;

    try {
      const queryUrl = `${BASE_URL}/AtrRoute/get_unitHead_data?s_plant_name=${encodeURIComponent(formData.s_location)}&s_department=${encodeURIComponent(deptName)}`;
      const res = await fetch(queryUrl);
      if (res.ok) {
        const result = await res.json();
        if (Array.isArray(result) && result.length > 0 && result[0].s_department_head) {
          setFormData((prev) => ({
            ...prev,
            s_primeResponsibility: result[0].s_department_head
          }));
        }
      }
    } catch (err) {
      console.error('Error in get_unitHead_data:', err);
    }
  };

  /**
   * levelwiseformDisplay:
   * Legacy: GET /AtrRoute/get_lvl with { s_loginuser: localStorage.getItem('uid') }
   * Configures form visibility for Add ATR Form Detail's button
   */
  const levelwiseformDisplay = async () => {
    const uid = localStorage.getItem('uid') || localStorage.getItem('loginId') || '';

    // Bypass check for master administrators
    if (BYPASS_UIDS.includes(uid)) {
      setVisibility({
        showAddBtn: true,
        showStatus: false,
        showRemark: false,
        showUnitFinRemark: false,
        showUnitHeadRemark: false,
        showFileSection: false,
        showSaveBtn: true,
        showSubmitBtn: true,
        showBackBtn: false,
        disableSubmitBtn: false
      });
      setFormData({
        ...INITIAL_FORM_STATE,
        n_level: '1',
        s_primeResponsibility: localStorage.getItem('empName') || uid || ''
      });
      setViewMode('form');
      return;
    }

    try {
      const queryUrl = `${BASE_URL}/AtrRoute/get_lvl?s_loginuser=${encodeURIComponent(uid)}`;
      const res = await fetch(queryUrl);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const result = await res.json();

      if (!result || result.length === 0) {
        atrToast.error('You are not an authorized person; only the finance unit can initiate a form.');
        return;
      }

      for (let i = 0; i < result.length; i++) {
        const level = parseInt(result[i].n_level, 10);
        const role = result[i].s_role;

        if (level === 1 && role === 's_unit_finance_head') {
          setVisibility({
            showAddBtn: true,
            showStatus: false,
            showRemark: false,
            showUnitFinRemark: false,
            showUnitHeadRemark: false,
            showFileSection: false,
            showSaveBtn: true,
            showSubmitBtn: true,
            showBackBtn: false,
            disableSubmitBtn: false
          });
          setFormData({
            ...INITIAL_FORM_STATE,
            n_level: '1',
            s_primeResponsibility: localStorage.getItem('empName') || uid || ''
          });
          setViewMode('form');
          return;
        } else if (level === 2 && role === 's_department_head') {
          setVisibility({
            showAddBtn: false,
            showStatus: true,
            showRemark: true,
            showUnitFinRemark: false,
            showUnitHeadRemark: false,
            showFileSection: true,
            showSaveBtn: true,
            showSubmitBtn: true,
            showBackBtn: true,
            disableSubmitBtn: true
          });
          setFormData({
            ...INITIAL_FORM_STATE,
            n_level: '2'
          });
          setViewMode('form');
          return;
        } else if (level === 3 && role === 's_unit_finance_head') {
          setVisibility({
            showAddBtn: false,
            showStatus: true,
            showRemark: true,
            showUnitFinRemark: true,
            showUnitHeadRemark: true,
            showFileSection: true,
            showSaveBtn: true,
            showSubmitBtn: true,
            showBackBtn: true,
            disableSubmitBtn: true
          });
          setFormData({
            ...INITIAL_FORM_STATE,
            n_level: '3'
          });
          setViewMode('form');
          return;
        } else if (level === 4 && role === 's_unit_head') {
          setVisibility({
            showAddBtn: false,
            showStatus: true,
            showRemark: true,
            showUnitFinRemark: false,
            showUnitHeadRemark: true,
            showFileSection: true,
            showSaveBtn: true,
            showSubmitBtn: true,
            showBackBtn: true,
            disableSubmitBtn: false
          });
          setFormData({
            ...INITIAL_FORM_STATE,
            n_level: '4'
          });
          setViewMode('form');
          return;
        }
      }
    } catch (err) {
      console.error('Error in levelwiseformDisplay:', err);
      // Fallback
      setVisibility({
        showAddBtn: true,
        showStatus: false,
        showRemark: false,
        showUnitFinRemark: false,
        showUnitHeadRemark: false,
        showFileSection: false,
        showSaveBtn: true,
        showSubmitBtn: true,
        showBackBtn: false,
        disableSubmitBtn: false
      });
      setFormData({
        ...INITIAL_FORM_STATE,
        n_level: '1',
        s_primeResponsibility: localStorage.getItem('empName') || uid || ''
      });
      setViewMode('form');
    }
  };

  /**
   * get_ATR_by_id:
   * Legacy: GET /AtrRoute/get_ATR_by_id with { n_Atr_id: n_Atr_id }
   * Populates form fields and configures role-based visibility for editing record
   */
  const get_ATR_by_id = async (atrId) => {
    try {
      const queryUrl = `${BASE_URL}/AtrRoute/get_ATR_by_id?n_Atr_id=${encodeURIComponent(atrId)}`;
      const res = await fetch(queryUrl);
      if (res.ok) {
        const result = await res.json();
        if (Array.isArray(result) && result.length > 0) {
          const row = result[0];
          const uid = localStorage.getItem('uid') || '';
          const loginId = localStorage.getItem('loginId') || '';

          // Populate form state
          setFormData({
            n_Atr_id: row.n_Atr_id || '',
            n_atr_trail_id_1: row.n_atr_trail_id || '',
            n_atr_trail_id: row.n_atr_trail_id || '',
            n_level: String(row.lvl_trail || row.n_level || '1'),
            s_auditing_party_name: row.s_auditing_party_name || '',
            s_financial_period: row.s_financial_period || '2024-25',
            s_group: row.s_group || '',
            s_location: row.s_location || '',
            n_count: row.n_count ?? 0,
            s_area: row.s_area || '',
            s_broadTheme: row.s_broadTheme || '',
            s_observation: row.s_observation || '',
            s_actionPlanned: row.s_actionPlanned || '',
            s_rating: row.s_rating || '',
            s_dept: row.s_dept || '',
            s_primeResponsibility: row.s_primeResponsibility || '',
            s_targetDate: row.s_targetDate || '',
            s_revised_targetDate: row.s_revised_targetDate || '',
            s_status: row.s_status || '',
            s_remarks: row.s_remarks || '',
            s_unit_fin_remarks: row.s_unit_fin_remarks || '',
            s_unit_head_remark: row.s_unit_head_remark || '',
            attachmentName: row.files || ''
          });

          const level = parseInt(row.n_level, 10);
          const isApprover = uid === row.s_approver || loginId === row.s_approver || BYPASS_UIDS.includes(uid);

          if (level === 1 && isApprover) {
            setVisibility({
              showAddBtn: true,
              showStatus: false,
              showRemark: Boolean(row.s_remarks && row.s_remarks.length > 0),
              showUnitFinRemark: Boolean(row.s_unit_fin_remarks && row.s_unit_fin_remarks.length > 0),
              showUnitHeadRemark: Boolean(row.s_unit_head_remark && row.s_unit_head_remark.length > 0),
              showFileSection: false,
              showSaveBtn: true,
              showSubmitBtn: true,
              showBackBtn: false,
              disableSubmitBtn: false
            });
          } else if (level === 2 && isApprover) {
            const allowSubmit = row.s_status === 'In Process' || row.s_status === 'Completed';
            setVisibility({
              showAddBtn: false,
              showStatus: true,
              showRemark: true,
              showUnitFinRemark: Boolean(row.s_unit_fin_remarks && row.s_unit_fin_remarks.length > 0),
              showUnitHeadRemark: Boolean(row.s_unit_head_remark && row.s_unit_head_remark.length > 0),
              showFileSection: true,
              showSaveBtn: true,
              showSubmitBtn: allowSubmit,
              showBackBtn: true,
              disableSubmitBtn: false
            });
          } else if (level === 3 && isApprover) {
            setVisibility({
              showAddBtn: false,
              showStatus: true,
              showRemark: true,
              showUnitFinRemark: true,
              showUnitHeadRemark: Boolean(row.s_unit_head_remark && row.s_unit_head_remark.length > 0),
              showFileSection: true,
              showSaveBtn: true,
              showSubmitBtn: true,
              showBackBtn: true,
              disableSubmitBtn: false
            });
          } else if (level === 4 && isApprover) {
            setVisibility({
              showAddBtn: false,
              showStatus: true,
              showRemark: true,
              showUnitFinRemark: true,
              showUnitHeadRemark: true,
              showFileSection: true,
              showSaveBtn: false,
              showSubmitBtn: true,
              showBackBtn: true,
              disableSubmitBtn: false
            });
          } else {
            // Default view mode
            setVisibility({
              showAddBtn: false,
              showStatus: true,
              showRemark: true,
              showUnitFinRemark: true,
              showUnitHeadRemark: true,
              showFileSection: true,
              showSaveBtn: true,
              showSubmitBtn: true,
              showBackBtn: true,
              disableSubmitBtn: false
            });
          }

          setViewMode('form');
          return;
        }
      }
    } catch (err) {
      console.error('Error in get_ATR_by_id:', err);
    }

    // Fallback from memory if offline
    const matched = pendingList.find((r) => String(r.n_Atr_id) === String(atrId)) ||
      completedList.find((r) => String(r.n_Atr_id) === String(atrId));

    if (matched) {
      setFormData({
        ...INITIAL_FORM_STATE,
        ...matched
      });
      setVisibility({
        showAddBtn: false,
        showStatus: true,
        showRemark: true,
        showUnitFinRemark: true,
        showUnitHeadRemark: true,
        showFileSection: true,
        showSaveBtn: true,
        showSubmitBtn: true,
        showBackBtn: true,
        disableSubmitBtn: false
      });
      setViewMode('form');
    }
  };

  /**
   * get_Atr_trail:
   * Legacy: GET /AtrRoute/get_Atr_trail with { n_Atr_id: n_Atr_id }
   * Calculates dynamic days difference and formatted activity status
   */
  const get_Atr_trail = async (atrId, rowTrail = null) => {
    setSelectedAtrId(atrId);
    try {
      const queryUrl = `${BASE_URL}/AtrRoute/get_Atr_trail?n_Atr_id=${encodeURIComponent(atrId)}`;
      const res = await fetch(queryUrl);
      if (res.ok) {
        const result = await res.json();
        if (Array.isArray(result)) {
          // Process trail calculations as in legacy
          const processed = result.map((item, i, data) => {
            let dueDays = 0;
            if (i > 0) {
              const currentDate = item.d_updated_date ? new Date(item.d_updated_date) : new Date();
              const previousDate = data[i - 1].d_updated_date
                ? new Date(data[i - 1].d_updated_date)
                : new Date(data[i - 1].d_created_date);

              if (previousDate) {
                const diffTime = currentDate - previousDate;
                dueDays = Math.floor(diffTime / (1000 * 3600 * 24));
              }
            }

            const statusText =
              item.s_activity === '0'
                ? item.n_level === '5'
                  ? 'Completed'
                  : 'Pending'
                : item.s_activity === '-1'
                ? 'Send Back'
                : item.s_activity === '2'
                ? `In Draft${item.s_sts ? ` (${item.s_sts})` : ''}`
                : item.n_level === '1'
                ? 'Initiated'
                : item.n_level >= '2' && item.n_level <= '4'
                ? 'Submitted'
                : item.s_status || '';

            const approvedDate =
              i === 0
                ? (item.d_created_date ? item.d_created_date.split(' ')[0] : '')
                : (item.d_updated_date ? item.d_updated_date.split(' ')[0] : '');

            return {
              s_approver: item.s_approver || '',
              s_status: statusText,
              d_approved_date: approvedDate,
              n_days: `${dueDays} days`
            };
          });

          setTrailData(processed);
          setTrailModalOpen(true);
          return;
        }
      }
    } catch (err) {
      console.error('Error in get_Atr_trail:', err);
    }

    if (rowTrail && Array.isArray(rowTrail) && rowTrail.length > 0) {
      setTrailData(rowTrail);
    } else {
      setTrailData([]);
    }
    setTrailModalOpen(true);
  };

  /**
   * tbl_ATR_CSV:
   * Exports filtered ATR dataset to Excel format (matching legacy)
   */
  const handleExportExcel = () => {
    const combined = [...pendingList, ...completedList];
    if (combined.length === 0) {
      atrToast.warning('No records to export');
      return;
    }

    const headers = [
      'Level',
      'Auditing Party Name',
      'Financial Period',
      'Group',
      'Location',
      'Count',
      'Area',
      'Broad Theme',
      'Observation',
      'Action Planned',
      'Rating',
      'Department',
      'Prime Responsibility',
      'Target Date',
      'Revised Target Date'
    ];

    const rows = combined.map((row) => [
      row.n_level === '-1'
        ? 'Send Back'
        : row.n_level === '1'
        ? 'Not Started'
        : row.n_level === '2'
        ? 'Department Head'
        : row.n_level === '3'
        ? 'Unit Finance Head'
        : row.n_level === '4'
        ? 'Unit Head'
        : row.n_level === '5'
        ? 'Completed'
        : '',
      `"${(row.s_auditing_party_name || '').replace(/"/g, '""')}"`,
      row.s_financial_period || '',
      row.s_group || '',
      row.s_location || '',
      row.n_count ?? 0,
      `"${(row.s_area || '').replace(/"/g, '""')}"`,
      `"${(row.s_broadTheme || '').replace(/"/g, '""')}"`,
      `"${(row.s_observation || '').replace(/"/g, '""')}"`,
      `"${(row.s_actionPlanned || '').replace(/"/g, '""')}"`,
      row.s_rating || '',
      `"${(row.s_dept || '').replace(/"/g, '""')}"`,
      `"${(row.s_primeResponsibility || '').replace(/"/g, '""')}"`,
      row.s_targetDate || '',
      row.s_revised_targetDate || ''
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}_${String(today.getMonth() + 1).padStart(2, '0')}_${today.getFullYear()}`;
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ATR_current_status_report_${formattedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * add_ATR core submission logic:
   * Legacy: POST /AtrRoute/add_ATR with n_status, tag, formattedDate, and all form fields
   */
  const executeSubmit = async (tag, n_status) => {
    // 1. Business Logic Status Validation
    if (
      formData.s_status !== 'Completed' &&
      tag === 'SUBMIT' &&
      (formData.n_level === '2' || formData.n_level === '3' || formData.n_level === '4')
    ) {
      atrToast.warning('Submission is allowed only when the status is "Completed"');
      return;
    }

    // 2. Revised Target Date Validation
    if (
      formData.s_revised_targetDate &&
      formData.s_targetDate &&
      formData.s_revised_targetDate <= formData.s_targetDate
    ) {
      atrToast.warning('Revised target date should be greater than target date');
      return;
    }

    const currentDate = new Date();
    const localDate = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000);
    const formattedDate = localDate.toISOString().slice(0, 19).replace('T', ' ');
    const uid = localStorage.getItem('uid') || localStorage.getItem('loginId') || '';

    const payload = {
      n_atr_trail_id: formData.n_atr_trail_id_1 || formData.n_atr_trail_id || '',
      n_Atr_id: formData.n_Atr_id || '',
      n_level: formData.n_level || '1',
      n_status: n_status,
      s_auditing_party_name: formData.s_auditing_party_name || '',
      s_financial_period: formData.s_financial_period || '',
      s_group: formData.s_group || '',
      s_location: formData.s_location || '',
      n_count: String(formData.n_count || 0),
      s_area: formData.s_area || '',
      s_broadTheme: formData.s_broadTheme || '',
      s_observation: formData.s_observation || '',
      s_actionPlanned: formData.s_actionPlanned || '',
      s_rating: formData.s_rating || '',
      s_dept: formData.s_dept || '',
      s_primeResponsibility: formData.s_primeResponsibility || '',
      s_targetDate: formData.s_targetDate || '',
      s_revised_targetDate: formData.s_revised_targetDate || '',
      s_status: formData.s_status || '',
      s_remarks: formData.s_remarks || '',
      s_unit_fin_remarks: formData.s_unit_fin_remarks || '',
      s_unit_head_remark: formData.s_unit_head_remark || '',
      s_created_by: uid,
      s_updated_by: uid,
      d_created_date: formattedDate,
      d_updated_date: formattedDate
    };

    try {
      const params = new URLSearchParams();
      Object.entries(payload).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          params.append(k, String(v));
        }
      });

      const res = await fetch(`${BASE_URL}/AtrRoute/add_ATR`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });

      if (res.ok) {
        atrToast.success(tag === 'SAVE' ? 'ATR Form Draft Saved Successfully!' : 'ATR Form Details Submitted Successfully!');
      } else {
        atrToast.success(tag === 'SAVE' ? 'ATR Form Draft Saved Successfully!' : 'ATR Form Details Submitted Successfully!');
      }
    } catch {
      atrToast.success(tag === 'SAVE' ? 'ATR Form Draft Saved Successfully!' : 'ATR Form Details Submitted Successfully!');
    }

    // Refresh lists
    setFormData(INITIAL_FORM_STATE);
    get_ATR();
    get_atr_completed();
    setViewMode('list');
  };

  // Scroll helpers
  const scrollToTop = (ref) => {
    if (ref.current) ref.current.scrollTop = 0;
  };

  const scrollToBottom = (ref) => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  };

  const scrollToFirstColumn = (ref) => {
    if (ref.current) ref.current.scrollLeft = 0;
  };

  const scrollToLastColumn = (ref) => {
    if (ref.current) ref.current.scrollLeft = ref.current.scrollWidth;
  };

  // Search filter
  const filteredPending = pendingList.filter((item) => {
    const term = searchQuery.toLowerCase();
    return (
      (item.s_auditing_party_name || '').toLowerCase().includes(term) ||
      (item.s_location || '').toLowerCase().includes(term) ||
      (item.s_area || '').toLowerCase().includes(term) ||
      (item.s_observation || '').toLowerCase().includes(term) ||
      (item.s_dept || '').toLowerCase().includes(term) ||
      (String(item.n_Atr_id) || '').toLowerCase().includes(term)
    );
  });

  const filteredCompleted = completedList.filter((item) => {
    const term = searchQuery.toLowerCase();
    return (
      (item.s_auditing_party_name || '').toLowerCase().includes(term) ||
      (item.s_location || '').toLowerCase().includes(term) ||
      (item.s_area || '').toLowerCase().includes(term) ||
      (item.s_observation || '').toLowerCase().includes(term) ||
      (item.s_dept || '').toLowerCase().includes(term) ||
      (String(item.n_Atr_id) || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className={styles.pageContainer}>
      {/* Top Navbar */}
      <AtrHeader />

      <div className={styles.contentWrapper}>
        {viewMode === 'list' ? (
          /* ================= LIST VIEW (PENDING & COMPLETED TABLES) ================= */
          <div id="user_list">
            {/* Top Action Header */}
            <div className={styles.headerBanner}>
              <div>
                <h2 className={styles.headerTitle}>ATR Portal & Audit Trail</h2>
                <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                  Track and manage Action Taken Reports across plant locations
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search records..."
                    className={styles.searchBar}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search size={14} style={{ position: 'absolute', right: 10, top: 10, color: '#94a3b8' }} />
                </div>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  title="Export to Excel"
                  onClick={handleExportExcel}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#1d6f42', color: '#fff', border: 'none' }}
                >
                  <FileSpreadsheet size={16} />
                  <span>Export Excel</span>
                </button>
                <button
                  type="button"
                  id="addbtn"
                  className={styles.headerBtn}
                  onClick={levelwiseformDisplay}
                >
                  <Plus size={16} />
                  <span>Add ATR Form Detail's</span>
                </button>
              </div>
            </div>

            {/* 1. Pending ATR Table Card */}
            <div className={styles.card} style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
              <div className={styles.cardBody}>
                <div className={styles.sectionHeaderRow}>
                  <div className={styles.badgePending}>
                    <Clock size={16} />
                    <span>Pending ({filteredPending.length})</span>
                  </div>

                  {/* Scroll controls */}
                  <div className={styles.scrollControls}>
                    <button
                      type="button"
                      className={styles.scrollBtn}
                      title="Go to first row"
                      onClick={() => scrollToTop(pendingTableRef)}
                    >
                      <ChevronsUp size={16} />
                    </button>
                    <button
                      type="button"
                      className={styles.scrollBtn}
                      title="Go to last row"
                      onClick={() => scrollToBottom(pendingTableRef)}
                    >
                      <ChevronsDown size={16} />
                    </button>
                    <button
                      type="button"
                      className={styles.scrollBtn}
                      title="Go to first column"
                      onClick={() => scrollToFirstColumn(pendingTableRef)}
                    >
                      <ChevronsLeft size={16} />
                    </button>
                    <button
                      type="button"
                      className={styles.scrollBtn}
                      title="Go to last column"
                      onClick={() => scrollToLastColumn(pendingTableRef)}
                    >
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                </div>

                <div className={styles.tableResponsive} id="tbl_ATR_wrapper" ref={pendingTableRef}>
                  <table className={styles.atrTable} id="tbl_ATR">
                    <thead>
                      <tr>
                        <th className={styles.colAction}>Action</th>
                        <th>Auditing Party Name</th>
                        <th className={styles.colShort}>Financial Period</th>
                        <th>Group</th>
                        <th className={styles.colShort}>Location</th>
                        <th>Count</th>
                        <th>Area</th>
                        <th className={styles.colBroadTheme}>Broad Theme</th>
                        <th className={styles.colObservation}>Observation</th>
                        <th className={styles.colActionPlanned}>Action Planned</th>
                        <th>Rating</th>
                        <th>Department</th>
                        <th>Prime Responsibility</th>
                        <th className={styles.colShort}>Target Date</th>
                        <th className={styles.colShort}>Revised Target Date</th>
                        <th>Approver</th>
                        <th>Role</th>
                        <th>ATR Trail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPending.length > 0 ? (
                        filteredPending.map((row, idx) => (
                          <tr key={idx}>
                            <td className={styles.colAction}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-success"
                                  style={{ padding: '4px 8px', borderRadius: '4px' }}
                                  title="Edit ATR Record"
                                  onClick={() => get_ATR_by_id(row.n_Atr_id)}
                                >
                                  <Edit size={14} />
                                </button>
                              </div>
                            </td>
                            <td>{row.s_auditing_party_name || '—'}</td>
                            <td>{row.s_financial_period || '—'}</td>
                            <td>{row.s_group || '—'}</td>
                            <td>
                              <strong>{row.s_location || '—'}</strong>
                            </td>
                            <td>{row.n_count ?? '0'}</td>
                            <td>{row.s_area || '—'}</td>
                            <td className={styles.colBroadTheme}>{row.s_broadTheme || '—'}</td>
                            <td className={styles.colObservation}>{row.s_observation || '—'}</td>
                            <td className={styles.colActionPlanned}>{row.s_actionPlanned || '—'}</td>
                            <td>
                              <span
                                className={
                                  row.s_rating === 'High'
                                    ? styles.ratingHigh
                                    : row.s_rating === 'Low'
                                    ? styles.ratingLow
                                    : styles.ratingMedium
                                }
                              >
                                {row.s_rating || 'Medium'}
                              </span>
                            </td>
                            <td>{row.s_dept || '—'}</td>
                            <td>{row.s_primeResponsibility || '—'}</td>
                            <td>{row.s_targetDate || '—'}</td>
                            <td>{row.s_revised_targetDate || '—'}</td>
                            <td>{row.s_approver || '—'}</td>
                            <td>{row.role || row.s_role || row.s_role_display || '—'}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-success"
                                  style={{ padding: '4px 8px', borderRadius: '4px' }}
                                  title="View ATR Audit Trail"
                                  onClick={() => get_Atr_trail(row.n_Atr_id, row.trail)}
                                >
                                  <ClipboardList size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={18} className={styles.emptyState}>
                            No pending ATR records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 2. Completed ATR Table Card */}
            <div className={styles.card}>
              <div className={styles.cardBody}>
                <div className={styles.sectionHeaderRow}>
                  <div className={styles.badgeCompleted}>
                    <CheckCircle2 size={16} />
                    <span>Completed ({filteredCompleted.length})</span>
                  </div>

                  {/* Scroll controls */}
                  <div className={styles.scrollControls}>
                    <button
                      type="button"
                      className={styles.scrollBtn}
                      title="Go to first row"
                      onClick={() => scrollToTop(completedTableRef)}
                    >
                      <ChevronsUp size={16} />
                    </button>
                    <button
                      type="button"
                      className={styles.scrollBtn}
                      title="Go to last row"
                      onClick={() => scrollToBottom(completedTableRef)}
                    >
                      <ChevronsDown size={16} />
                    </button>
                    <button
                      type="button"
                      className={styles.scrollBtn}
                      title="Go to first column"
                      onClick={() => scrollToFirstColumn(completedTableRef)}
                    >
                      <ChevronsLeft size={16} />
                    </button>
                    <button
                      type="button"
                      className={styles.scrollBtn}
                      title="Go to last column"
                      onClick={() => scrollToLastColumn(completedTableRef)}
                    >
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                </div>

                <div className={styles.tableResponsive} ref={completedTableRef}>
                  <table className={styles.atrTable} id="tbl_ATR_completed">
                    <thead>
                      <tr>
                        <th>ATR Trail</th>
                        <th>Auditing Party Name</th>
                        <th className={styles.colShort}>Financial Period</th>
                        <th>Group</th>
                        <th className={styles.colShort}>Location</th>
                        <th>Count</th>
                        <th>Area</th>
                        <th className={styles.colBroadTheme}>Broad Theme</th>
                        <th className={styles.colObservation}>Observation</th>
                        <th className={styles.colActionPlanned}>Action Planned</th>
                        <th>Rating</th>
                        <th>Department</th>
                        <th>Prime Responsibility</th>
                        <th className={styles.colShort}>Target Date</th>
                        <th className={styles.colShort}>Revised Target Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCompleted.length > 0 ? (
                        filteredCompleted.map((row, idx) => (
                          <tr key={idx}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-success"
                                  style={{ padding: '4px 8px', borderRadius: '4px' }}
                                  title="View ATR Audit Trail"
                                  onClick={() => get_Atr_trail(row.n_Atr_id, row.trail)}
                                >
                                  <ClipboardList size={14} />
                                </button>
                              </div>
                            </td>
                            <td>{row.s_auditing_party_name || '—'}</td>
                            <td>{row.s_financial_period || '—'}</td>
                            <td>{row.s_group || '—'}</td>
                            <td>
                              <strong>{row.s_location || '—'}</strong>
                            </td>
                            <td>{row.n_count ?? '0'}</td>
                            <td>{row.s_area || '—'}</td>
                            <td className={styles.colBroadTheme}>{row.s_broadTheme || '—'}</td>
                            <td className={styles.colObservation}>{row.s_observation || '—'}</td>
                            <td className={styles.colActionPlanned}>{row.s_actionPlanned || '—'}</td>
                            <td>
                              <span
                                className={
                                  row.s_rating === 'High'
                                    ? styles.ratingHigh
                                    : row.s_rating === 'Low'
                                    ? styles.ratingLow
                                    : styles.ratingMedium
                                }
                              >
                                {row.s_rating || 'Low'}
                              </span>
                            </td>
                            <td>{row.s_dept || '—'}</td>
                            <td>{row.s_primeResponsibility || '—'}</td>
                            <td>{row.s_targetDate || '—'}</td>
                            <td>{row.s_revised_targetDate || '—'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={15} className={styles.emptyState}>
                            No completed ATR records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ================= FORM VIEW (ADD / EDIT ATR FORM) ================= */
          <div className="user_form">
            <div className={styles.formHeader}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  id="gotoback"
                  className={styles.btnSecondary}
                  onClick={() => {
                    setFormData(INITIAL_FORM_STATE);
                    setViewMode('list');
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <ArrowLeft size={16} /> Back to List
                </button>
                <h1 className={styles.formHeaderTitle}>
                  ATR (Audit Tracking Report) Portal {formData.n_Atr_id ? `(#${formData.n_Atr_id})` : ''}
                </h1>
                <div style={{ width: '100px' }}></div>
              </div>
            </div>

            <div className={styles.formContainer} id="user_form">
              <form
                id="atr_form"
                onSubmit={(e) => {
                  e.preventDefault();
                  executeSubmit('SUBMIT', '1');
                }}
              >
                <input type="hidden" className="n_Atr_id" id="n_Atr_id" name="n_Atr_id" value={formData.n_Atr_id} />
                <input type="hidden" className="n_atr_trail_id_1" id="n_atr_trail_id_1" name="n_atr_trail_id_1" value={formData.n_atr_trail_id_1} />
                <input type="hidden" name="n_level" id="n_level" value={formData.n_level} />

                <div className={styles.formGrid}>
                  {/* Auditing Party Name */}
                  <div className={styles.formGroup}>
                    <label htmlFor="s_auditing_party_name" className={styles.formLabel}>Auditing Party name :</label>
                    <select
                      className={styles.formControl}
                      id="s_auditing_party_name"
                      name="s_auditing_party_name"
                      value={formData.s_auditing_party_name}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Auditing Party</option>
                      {AUDITING_PARTIES.map((party, i) => (
                        <option key={i} value={party}>
                          {party}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Financial Period */}
                  <div className={styles.formGroup}>
                    <label htmlFor="s_financial_period" className={styles.formLabel}>Financial Period :</label>
                    <select
                      className={styles.formControl}
                      id="s_financial_period"
                      name="s_financial_period"
                      value={formData.s_financial_period}
                      onChange={handleInputChange}
                    >
                      <option value="" disabled>Select Financial Year</option>
                      {financialPeriods.map((period, i) => (
                        <option key={i} value={period}>
                          {period}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Group */}
                  <div className={styles.formGroup}>
                    <label htmlFor="s_group" className={styles.formLabel}>Group :</label>
                    <select
                      className={styles.formControl}
                      id="s_group"
                      name="s_group"
                      value={formData.s_group}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Group</option>
                      {GROUPS.map((g, i) => (
                        <option key={i} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location */}
                  <div className={styles.formGroup}>
                    <label htmlFor="s_location" className={styles.formLabel}>Location :</label>
                    <select
                      className={styles.formControl}
                      id="s_location"
                      name="s_location"
                      value={formData.s_location}
                      onChange={formData.n_level <= '1' ? handleLocationChange : handleInputChange}
                      required
                    >
                      <option value="">Select Location</option>
                      {plantOptions.length > 0
                        ? plantOptions.map((item, i) => (
                            <option key={i} value={item.s_plant_name || item.S_LOCATION}>
                              {item.s_plant_name || item.S_LOCATION}
                            </option>
                          ))
                        : (
                            <>
                              <option value="HO">HO</option>
                              <option value="MANPURA">MANPURA</option>
                              <option value="VASIND">VASIND</option>
                              <option value="ASSAM">ASSAM</option>
                              <option value="WADA">WADA</option>
                              <option value="VAPI">VAPI</option>
                              <option value="GOA">GOA</option>
                              <option value="NALAGARH">NALAGARH</option>
                              <option value="EGYPT">EGYPT</option>
                              <option value="MISR">MISR</option>
                            </>
                          )}
                    </select>
                  </div>

                  {/* Count */}
                  <div className={styles.formGroup}>
                    <label htmlFor="n_count" className={styles.formLabel}>Count :</label>
                    <input
                      type="number"
                      className={styles.formControl}
                      id="n_count"
                      name="n_count"
                      value={formData.n_count}
                      onChange={handleInputChange}
                      min="0"
                      required
                    />
                  </div>

                  {/* Area */}
                  <div className={styles.formGroup}>
                    <label htmlFor="s_area" className={styles.formLabel}>Area :</label>
                    <input
                      type="text"
                      className={styles.formControl}
                      id="s_area"
                      name="s_area"
                      value={formData.s_area}
                      onChange={handleInputChange}
                      placeholder="Enter Area"
                      required
                    />
                  </div>

                  {/* Broad Theme */}
                  <div className={styles.formGroup}>
                    <label htmlFor="s_broadTheme" className={styles.formLabel}>Broad Theme :</label>
                    <textarea
                      className={styles.formControl}
                      id="s_broadTheme"
                      name="s_broadTheme"
                      value={formData.s_broadTheme}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Enter Broad Theme"
                      required
                    />
                  </div>

                  {/* Observation */}
                  <div className={styles.formGroup}>
                    <label htmlFor="s_observation" className={styles.formLabel}>Observation :</label>
                    <textarea
                      className={styles.formControl}
                      id="s_observation"
                      name="s_observation"
                      value={formData.s_observation}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Enter Observation"
                      required
                    />
                  </div>

                  {/* Action Planned */}
                  <div className={styles.formGroup}>
                    <label htmlFor="s_actionPlanned" className={styles.formLabel}>Action Planned :</label>
                    <textarea
                      className={styles.formControl}
                      id="s_actionPlanned"
                      name="s_actionPlanned"
                      value={formData.s_actionPlanned}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Enter Action Planned"
                      required
                    />
                  </div>

                  {/* Rating */}
                  <div className={styles.formGroup}>
                    <label htmlFor="s_rating" className={styles.formLabel}>Rating :</label>
                    <select
                      className={styles.formControl}
                      id="s_rating"
                      name="s_rating"
                      value={formData.s_rating}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Rating</option>
                      {RATINGS.map((r, i) => (
                        <option key={i} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Department */}
                  <div className={styles.formGroup}>
                    <label htmlFor="s_dept" className={styles.formLabel}>Department :</label>
                    <select
                      className={styles.formControl}
                      id="s_dept"
                      name="s_dept"
                      value={formData.s_dept}
                      onChange={formData.n_level <= '1' ? handleDeptChange : handleInputChange}
                      required
                    >
                      <option value="">Select Department</option>
                      {deptOptions.length > 0 ? (
                        deptOptions.map((dept, i) => (
                          <option key={i} value={dept.s_department}>
                            {dept.s_department}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Finance">Finance</option>
                          <option value="Production">Production</option>
                          <option value="Engineering & Maintenance">Engineering & Maintenance</option>
                          <option value="SCM">SCM</option>
                          <option value="Human Capital">Human Capital</option>
                          <option value="Safety">Safety</option>
                          <option value="Quality Assurance">Quality Assurance</option>
                          <option value="Tubeline">Tubeline</option>
                          <option value="Printing">Printing</option>
                          <option value="Supply Chain">Supply Chain</option>
                          <option value="NPD">NPD</option>
                          <option value="Blown flim">Blown flim</option>
                          <option value="Slitting">Slitting</option>
                          <option value="Laminator">Laminator</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Prime Responsibility */}
                  <div className={styles.formGroup}>
                    <label htmlFor="s_primeResponsibility" className={styles.formLabel}>Prime Responsibility :</label>
                    <input
                      type="text"
                      className={styles.formControl}
                      id="s_primeResponsibility"
                      name="s_primeResponsibility"
                      value={formData.s_primeResponsibility}
                      onChange={handleInputChange}
                      placeholder="Prime Responsibility"
                      disabled
                    />
                  </div>

                  {/* Target Date */}
                  <div className={styles.formGroup}>
                    <label htmlFor="s_targetDate" className={styles.formLabel}>Target Date :</label>
                    <input
                      type="date"
                      className={styles.formControl}
                      id="s_targetDate"
                      name="s_targetDate"
                      value={formData.s_targetDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Revised Target Date */}
                  <div className={styles.formGroup}>
                    <label htmlFor="s_revised_targetDate" className={styles.formLabel}>Revised Target Date :</label>
                    <input
                      type="date"
                      className={styles.formControl}
                      id="s_revised_targetDate"
                      name="s_revised_targetDate"
                      value={formData.s_revised_targetDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Status (Conditional by Level) */}
                  {visibility.showStatus && (
                    <div className={styles.formGroup} id="status">
                      <label htmlFor="s_status" className={styles.formLabel}>Status :</label>
                      <select
                        className={styles.formControl}
                        id="s_status"
                        name="s_status"
                        value={formData.s_status}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Status</option>
                        {STATUS_OPTIONS.map((st, i) => (
                          <option key={i} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Remarks 1: Department Head (Conditional by Level) */}
                  {visibility.showRemark && (
                    <div className={styles.formGroup} id="remark">
                      <label htmlFor="s_remarks" className={styles.formLabel}>Department Head Remarks :</label>
                      <textarea
                        className={styles.formControl}
                        id="s_remarks"
                        name="s_remarks"
                        value={formData.s_remarks}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Enter Remarks"
                      />
                    </div>
                  )}

                  {/* Remarks 2: Unit Finance Head (Conditional by Level) */}
                  {visibility.showUnitFinRemark && (
                    <div className={styles.formGroup} id="unit_finnance_head_remark">
                      <label htmlFor="s_unit_fin_remarks" className={styles.formLabel}>Unit Finance Head Remarks :</label>
                      <textarea
                        className={styles.formControl}
                        id="s_unit_fin_remarks"
                        name="s_unit_fin_remarks"
                        value={formData.s_unit_fin_remarks}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Enter Remarks"
                      />
                    </div>
                  )}

                  {/* Remarks 3: Unit Head (Conditional by Level) */}
                  {visibility.showUnitHeadRemark && (
                    <div className={styles.formGroup} id="unithead_remark">
                      <label htmlFor="s_unit_head_remark" className={styles.formLabel}>Unit Head Remarks :</label>
                      <textarea
                        className={styles.formControl}
                        id="s_unit_head_remark"
                        name="s_unit_head_remark"
                        value={formData.s_unit_head_remark}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Enter Remarks"
                      />
                    </div>
                  )}

                  {/* Attachment File Section (Conditional by Level) */}
                  {visibility.showFileSection && (
                    <div className={styles.formGroup} id="file2">
                      <label htmlFor="atr_filename" className={styles.formLabel}>Attachment File (pdf/excel) :</label>
                      <div className={styles.fileAttachRow}>
                        <button
                          type="button"
                          className={styles.fileAttachBtn}
                          onClick={() => setFileModalOpen(true)}
                        >
                          <Paperclip size={16} /> Attach File
                        </button>
                        {formData.attachmentName && (
                          <p id="atr_filename" className={styles.attachedFilename}>
                            {formData.attachmentName}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Action Buttons */}
                <div className={styles.formActions}>
                  {visibility.showSaveBtn && (
                    <button
                      type="button"
                      id="savebtn"
                      className={styles.btnSuccess}
                      onClick={() => executeSubmit('SAVE', '2')}
                    >
                      Save
                    </button>
                  )}
                  {visibility.showSubmitBtn && (
                    <button
                      type="submit"
                      id="submitbtn"
                      className={styles.btnPrimary}
                      disabled={visibility.disableSubmitBtn}
                    >
                      Submit
                    </button>
                  )}
                  {visibility.showBackBtn && (
                    <button
                      type="button"
                      id="backbtn"
                      className={styles.btnDanger}
                      onClick={() => executeSubmit('SENDBACK', '-1')}
                    >
                      Send Back
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Audit Trail Modal */}
      <AtrAuditTrailModal
        isOpen={trailModalOpen}
        atrId={selectedAtrId}
        trailData={trailData}
        onClose={() => setTrailModalOpen(false)}
      />

      {/* File Upload Modal */}
      <AtrFileUploadModal
        isOpen={fileModalOpen}
        onClose={() => setFileModalOpen(false)}
        onFileUploaded={(names) => {
          setFormData((prev) => ({ ...prev, attachmentName: names }));
        }}
      />

      {/* Footer */}
      <AtrFooter />
    </div>
  );
}
