import axios from 'axios';
import { CodeResponse } from '../types/api';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Add a response interceptor to handle CodeResponse
apiClient.interceptors.response.use(
  (response) => {
    const codeResponse = response.data as CodeResponse<any>;
    
    // If the response follows CodeResponse format, check success flag
    if (codeResponse && typeof codeResponse.success === 'boolean') {
      if (codeResponse.success) {
        return codeResponse.data; // Return just the data part
      } else {
        const err = new Error(codeResponse.message || 'Unknown API Error') as Error & {
          errorCode?: string;
        };
        const body = response.data as { errorCode?: string };
        if (body?.errorCode) err.errorCode = body.errorCode;
        return Promise.reject(err);
      }
    }
    
    return response.data;
  },
  (error) => {
    const data = error.response?.data as { message?: string; errorCode?: string } | undefined;
    const err = new Error(data?.message || error.message || 'Network Error') as Error & {
      errorCode?: string;
    };
    if (data?.errorCode) err.errorCode = data.errorCode;
    return Promise.reject(err);
  },
);

export default apiClient;
