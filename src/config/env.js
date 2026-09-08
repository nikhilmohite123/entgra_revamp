/**
 * Environment configuration reader
 * Central source of truth for runtime / build-time environment variables.
 */
export const ENV = {
  API_BASE_URL: (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, ''),
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  MODE: import.meta.env.MODE,
};

export default ENV;
