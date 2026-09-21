import axios from 'axios';

// Create a generic axios instance
export const apiClient = axios.create({
  // Use a relative path so it uses the proxy setup, or the absolute backend URL
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for adding authorization headers or handling global errors
apiClient.interceptors.request.use(
  (config) => {
    // Check local storage for token if applicable
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global API errors (e.g., 401 Unauthorized redirect)
    if (error.response && error.response.status === 401) {
      // Optional global logout or redirect logic here
      console.warn('API returned 401 Unauthorized');
    }
    return Promise.reject(error);
  }
);
