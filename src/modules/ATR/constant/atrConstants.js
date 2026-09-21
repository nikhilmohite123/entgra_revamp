// Environment configuration & constants for ATR Module
export const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BASE_URL ||
  'http://192.168.1.3:9003'
).replace(/\/+$/, '');

// Allowed plant locations for the plant dropdown
export const ALLOWED_PLANTS = [
  'HO',
  'MANPURA',
  'VASIND',
  'ASSAM',
  'WADA',
  'VAPI',
  'GOA',
  'NALAGARH',
  'EGYPT',
  'MISR'
];

// User IDs that bypass region validation
export const BYPASS_UIDS = [
  'pallav.bhatnagar',
  'vinay.thakur',
  ''
];

// Auditing Party Options
export const AUDITING_PARTIES = [
  'MGB Advisors Pvt Ltd',
  'Price Waterhouse Coopers Services LLP'
];

// Financial Period Options
export const FINANCIAL_PERIODS = [
  '2023-24',
  '2024-25',
  '2025-26',
  '2026-27'
];

// Group Options
export const GROUPS = [
  'Egypt',
  'India'
];

// Rating Options
export const RATINGS = [
  'Low',
  'Medium',
  'High'
];

// Status Options
export const STATUS_OPTIONS = [
  'Not Started',
  'In Process',
  'Completed'
];

// Department Options
export const DEPARTMENTS = [
  'Finance',
  'Accounts',
  'Engineering',
  'Production',
  'Quality Assurance',
  'Supply Chain',
  'Human Resources',
  'Information Technology',
  'Commercial',
  'Safety & EHS',
  'Maintenance'
];
