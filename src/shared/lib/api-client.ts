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
        // If success is false, throw the message as an error
        return Promise.reject(new Error(codeResponse.message || 'Unknown API Error'));
      }
    }
    
    return response.data;
  },
  (error) => {
    // Handle HTTP errors (4xx, 5xx)
    const message = error.response?.data?.message || error.message || 'Network Error';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
