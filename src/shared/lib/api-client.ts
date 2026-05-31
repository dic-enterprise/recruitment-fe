import axios from 'axios';
import i18n from '@/shared/i18n';
import { toast } from '@/shared/components/ui/sonner';
import { clearAuthSession, getAccessToken } from '@/shared/lib/auth-storage';
import { isPublicApiUrl } from '@/shared/lib/is-public-api-url';
import { CodeResponse } from '../types/api';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

function getLoginPath(): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/login`;
}

function redirectToLogin(): void {
  const loginPath = getLoginPath();
  if (!window.location.pathname.endsWith('/login')) {
    window.location.href = loginPath;
  }
}

apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && !isPublicApiUrl(config.url)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => {
    const codeResponse = response.data as CodeResponse<unknown>;

    if (codeResponse && typeof codeResponse.success === 'boolean') {
      if (codeResponse.success) {
        return codeResponse.data;
      }

      const err = new Error(codeResponse.message || 'Unknown API Error') as Error & {
        errorCode?: string;
      };
      const body = response.data as { errorCode?: string };
      if (body?.errorCode) err.errorCode = body.errorCode;
      return Promise.reject(err);
    }

    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url as string | undefined;

    if (status === 401 && !isPublicApiUrl(requestUrl)) {
      clearAuthSession();
      redirectToLogin();
    }

    if (status === 403) {
      toast.error(i18n.t('common.forbidden'));
    }

    const data = error.response?.data as { message?: string; errorCode?: string } | undefined;
    const err = new Error(data?.message || error.message || 'Network Error') as Error & {
      errorCode?: string;
    };
    if (data?.errorCode) err.errorCode = data.errorCode;
    return Promise.reject(err);
  },
);

export default apiClient;
