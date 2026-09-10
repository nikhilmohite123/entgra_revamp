// Environment variable configuration for NPD Tool
export const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BASE_URL ||
  'http://192.168.1.5:9003'
).replace(/\/+$/, '');
