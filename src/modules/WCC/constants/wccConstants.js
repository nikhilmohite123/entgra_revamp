import { ENV } from '../../../config/env';

export const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BASE_URL ||
  ENV.API_BASE_URL ||
  ''
).replace(/\/+$/, '');

// Number & Date Parsing Utilities
export function parseIndianNumber(val) {
  if (val === undefined || val === null || val === '') return 0;
  return Number(String(val).replace(/,/g, '').trim()) || 0;
}

export function formatAmount(value) {
  if (value === null || value === undefined || value === '') {
    return '0.00';
  }
  const num = Number(String(value).replace(/,/g, ''));
  if (!Number.isFinite(num)) {
    return '0.00';
  }
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatName(name) {
  if (!name) return '';
  return name
    .split('.')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function getTodayDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export const INITIAL_FORM_STATE = {
  n_id: '',
  n_workcompletion_certificate_trail_id: '',
  n_level: '1',
  n_status: '',
  s_capex_approval_no: '',
  s_plant_code: '',
  d_date_capitalisation: '',
  d_putup_use_date: '',
  s_requestor_name: '',
  s_location: '',
  s_req_company: '',
  s_camp_code: '',
  s_department: '',
  s_region: '',
  s_country: '',
  s_unit: '',
  s_asset: '',
  b_processing_of_con: 'no', // radio: 'yes' | 'no'
  s_desc_processing_of_con: '',
  b_Availing_EPCG_scheme: 'no', // radio: 'yes' | 'no'
  n_certificate_no: '',
  b_contribution_asset: 'no', // radio: 'yes' | 'no'
  b_open_po_commitments: 'no', // radio: 'yes' | 'no'
  b_triple_shipt_depreciation: 'no', // radio: 'yes' | 'no'
  s_use_of_assets: '',
  s_remark: '',
  s_remark_approval: '',
  s_remark_projecthead: '',
  s_remark_hoaccount: '',
  s_remark_forwarder: '',
  forwarder: '',
  remark_to_forwarer: '',
};

export const INITIAL_CWIP_ROW = {
  orderNumber: '',
  cwipAsset: '',
  cwipDescription: '',
  assetDescription: '',
  qauntity: '',
  costCenter: '',
  budget: '',
  basicAmount: '',
  freightCharges: '',
  ineligibleGst: '',
  totalAmount: '',
  units: '',
  unitMeasurement: '',
  motherAsset: '',
  subAsset: '',
};

export const INITIAL_HO_ROW = {
  assetNumber: '',
  assetSubNumber: '',
  assetsDescription: '',
  assetClass: '',
  postingDocNumber: '',
  capitalizationDate: '',
  totalAssetValue: '',
  residualValue: '',
  usefulLife: '',
};
