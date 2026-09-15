/**
 * Constants for the EPL Sample Portal module
 */

export const ADMIN_UID = 'shweta.gala';

export const CATEGORY_OPTIONS = [
  'Tube-in-Tube',
  'Neoseam',
  'Tiara/slim Cap',
  'PCR',
  'Applicator Tubes',
  'Pump Tubes',
  'Platina/Sustainable Tubes',
  'Print Embellishment',
  'Others',
];

export const TUBE_SHAPE_OPTIONS = [
  { value: '', label: 'Select shape' },
  { value: 'Round', label: 'Round' },
  { value: 'Oval', label: 'Oval' },
  { value: 'Others', label: 'Others' },
];

export const STATUS_TABS = [
  { id: 'Open', label: 'Open' },
  { id: 'Closed', label: 'Closed' },
  { id: 'All', label: 'All' },
];

export const DOABLE_OPTIONS = [
  { value: '', label: '— Select —' },
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
];

export const TUBE_TYPE_OPTIONS = [
  { value: '', label: 'Select' },
  { value: 'Extruded', label: 'Extruded' },
  { value: 'Included', label: 'Laminated' },
];

export const STATUS_CLASS_MAP = {
  Open: 'statusOpen',
  Closed: 'statusClosed',
  Pending: 'statusPending',
  Doable: 'statusDoable',
  'Not Doable': 'statusNotDoable',
  'In Progress': 'statusInProgress',
  Completed: 'statusCompleted',
};

/**
 * Builds formatted reference number e.g. SP0001
 * @param {number|string} id
 */
export function buildSampleRefNo(id) {
  if (!id && id !== 0) return '—';
  return `SP${String(id).padStart(4, '0')}`;
}

/**
 * Escapes strings safely
 */
export function esc(str) {
  if (str == null) return '';
  return String(str);
}
