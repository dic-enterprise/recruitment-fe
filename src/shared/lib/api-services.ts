import apiClient from './api-client';
import {
  Department,
  Job,
  Candidate,
  CVMatch,
  DashboardStats,
  MatchQueueItem
} from '../types/api';

export const departmentService = {
  getAll: () => apiClient.get<Department[]>('/departments').then(res => res.data),
  getById: (id: string) => apiClient.get<Department>(`/departments/${id}`).then(res => res.data),
};

export const jobService = {
  getAll: (params?: { status?: string; departmentId?: string; search?: string }) =>
    apiClient.get<Job[]>('/jobs', { params }).then(res => res.data),
  getById: (id: string) => apiClient.get<Job>(`/jobs/${id}`).then(res => res.data),
  create: (data: Partial<Job>) => apiClient.post<Job>('/jobs', data).then(res => res.data),
  update: (id: string, data: Partial<Job>) => apiClient.put<Job>(`/jobs/${id}`, data).then(res => res.data),
};

export const candidateService = {
  getAll: (params?: { extractStatus?: string; employmentTag?: string; search?: string }) =>
    apiClient.get<Candidate[]>('/candidates', { params }).then(res => res.data),
  getById: (id: string) => apiClient.get<Candidate>(`/candidates/${id}`).then(res => res.data),
  uploadCV: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<Candidate>('/candidates/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data);
  },
};

export const matchService = {
  getByJobId: (jobId: string) => apiClient.get<CVMatch[]>(`/matches/job/${jobId}`).then(res => res.data),
  getByCandidateId: (candidateId: string) => apiClient.get<CVMatch[]>(`/matches/candidate/${candidateId}`).then(res => res.data),
  getQueue: () => apiClient.get<MatchQueueItem[]>('/matches/queue').then(res => res.data),
  triggerMatch: (jobId: string, candidateIds: string[]) =>
    apiClient.post('/matches/trigger', { jobId, candidateIds }).then(res => res.data),
};

export const statsService = {
  getSummary: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/stats/summary');
    return response.data;
  },
};

export const adminService = {
  getExtractErrors: async (): Promise<Candidate[]> => {
    const response = await apiClient.get('/admin/extract-errors');
    return response.data;
  },
  retryExtract: async (candidateId: string): Promise<void> => {
    await apiClient.post(`/admin/extract-retry/${candidateId}`);
  },
};
