// Environment variable configuration for Overtime Module
export const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BASE_URL ||
  'http://192.168.1.5:9003'
).replace(/\/+$/, '');

// Utility helper to convert HH:mm or HH:mm:ss to 12-hour format with am/pm
export function get12hrsformat(values) {
  if (!values) return '-';
  try {
    const parts = values.split(':');
    const hours24 = parseInt(parts[0], 10);
    const minutes = parts[1] || '00';
    const amOrPm = hours24 >= 12 ? 'pm' : 'am';
    const hours12 = (hours24 % 12) || 12;
    return `${hours12}:${minutes} ${amOrPm}`;
  } catch {
    return values;
  }
}
