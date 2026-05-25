import apiClient from './api-client';
import { normalizeAIConfig } from './ai-config-utils';
import {
  Department,
  Job,
  Candidate,
  CVMatch,
  DashboardStats,
  MatchQueueItem,
  AIConfig,
  AIProviderConfig,
  InterviewSchedule
} from '../types/api';

export const departmentService = {
  getAll: async (): Promise<Department[]> => {
    try {
      return await apiClient.get('/departments');
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      throw error;
    }
  },
  getById: async (id: string): Promise<Department> => {
    try {
      return await apiClient.get(`/departments/${id}`);
    } catch (error) {
      console.error(`Failed to fetch department ${id}:`, error);
      throw error;
    }
  },
  create: async (data: Partial<Department>): Promise<Department> => {
    try {
      return await apiClient.post('/departments', data);
    } catch (error) {
      console.error('Failed to create department:', error);
      throw error;
    }
  },
  update: async (id: number, data: Partial<Department>): Promise<Department> => {
    try {
      return await apiClient.put(`/departments/${id}`, data);
    } catch (error) {
      console.error(`Failed to update department ${id}:`, error);
      throw error;
    }
  },
};

export const jobService = {
  getAll: async (params?: { status?: string; departmentId?: string; search?: string }): Promise<Job[]> => {
    try {
      return await apiClient.get('/jobs', { params });
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      throw error;
    }
  },
  getById: async (id: string): Promise<Job> => {
    try {
      return await apiClient.get(`/jobs/${id}`);
    } catch (error) {
      console.error(`Failed to fetch job ${id}:`, error);
      throw error;
    }
  },
  create: async (data: Partial<Job>): Promise<Job> => {
    try {
      return await apiClient.post('/jobs', data);
    } catch (error) {
      console.error('Failed to create job:', error);
      throw error;
    }
  },
  update: async (id: string, data: Partial<Job>): Promise<Job> => {
    try {
      return await apiClient.put(`/jobs/${id}`, data);
    } catch (error) {
      console.error(`Failed to update job ${id}:`, error);
      throw error;
    }
  },
};

export const candidateService = {
  getAll: async (params?: { extractStatus?: string; employmentTag?: string; search?: string }): Promise<Candidate[]> => {
    try {
      return await apiClient.get('/candidates', { params });
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
      throw error;
    }
  },
  getById: async (id: string): Promise<Candidate> => {
    try {
      return await apiClient.get(`/candidates/${id}`);
    } catch (error) {
      console.error(`Failed to fetch candidate ${id}:`, error);
      throw error;
    }
  },
  uploadCVs: async (files: File[]): Promise<Candidate[]> => {
    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append('files', file);
      }
      return await apiClient.post('/candidates/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      console.error('Failed to upload CVs:', error);
      throw error;
    }
  },
  downloadCv: async (id: string): Promise<Blob> => {
    try {
      return await apiClient.get(`/candidates/${id}/cv/download`, { responseType: 'blob' });
    } catch (error) {
      console.error(`Failed to download CV for candidate ${id}:`, error);
      throw error;
    }
  },
};

export const matchService = {
  getAll: async (): Promise<CVMatch[]> => {
    try {
      return await apiClient.get('/matches');
    } catch (error) {
      console.error('Failed to fetch all matches:', error);
      throw error;
    }
  },
  getByJobId: async (jobId: string): Promise<CVMatch[]> => {
    try {
      return await apiClient.get(`/matches/job/${jobId}`);
    } catch (error) {
      console.error(`Failed to fetch matches for job ${jobId}:`, error);
      throw error;
    }
  },
  getByCandidateId: async (candidateId: string): Promise<CVMatch[]> => {
    try {
      return await apiClient.get(`/matches/candidate/${candidateId}`);
    } catch (error) {
      console.error(`Failed to fetch matches for candidate ${candidateId}:`, error);
      throw error;
    }
  },
  getQueue: async (): Promise<MatchQueueItem[]> => {
    try {
      return await apiClient.get('/matches/queue');
    } catch (error) {
      console.error('Failed to fetch match queue:', error);
      throw error;
    }
  },
  triggerMatch: async (jobId: string, candidateIds: string[]): Promise<void> => {
    try {
      await apiClient.post('/matches/trigger', { jobId, candidateIds });
    } catch (error) {
      console.error('Failed to trigger match:', error);
      throw error;
    }
  },
};

export const statsService = {
  getSummary: async (): Promise<DashboardStats> => {
    try {
      return await apiClient.get('/stats/summary');
    } catch (error) {
      console.error('Failed to fetch stats summary:', error);
      throw error;
    }
  },
};

export const adminService = {
  getExtractErrors: async (): Promise<Candidate[]> => {
    try {
      return await apiClient.get('/admin/extract-errors');
    } catch (error) {
      console.error('Failed to fetch extract errors:', error);
      throw error;
    }
  },
  retryExtract: async (candidateId: string): Promise<void> => {
    try {
      await apiClient.post(`/admin/extract-retry/${candidateId}`);
    } catch (error) {
      console.error(`Failed to retry extraction for candidate ${candidateId}:`, error);
      throw error;
    }
  },
  getAIConfig: async (): Promise<AIConfig> => {
    try {
      const raw = await apiClient.get('/admin/ai-config');
      return normalizeAIConfig(raw);
    } catch (error) {
      console.error('Failed to fetch AI configurations:', error);
      throw error;
    }
  },
  saveAIConfig: async (configs: AIProviderConfig[]): Promise<AIConfig> => {
    try {
      const raw = await apiClient.put('/admin/ai-config', configs);
      return normalizeAIConfig(raw);
    } catch (error) {
      console.error('Failed to save AI configurations:', error);
      throw error;
    }
  },
};

export const scheduleService = {
  getInterviews: async (params: { from: string; to: string }): Promise<InterviewSchedule[]> => {
    try {
      return await apiClient.get('/schedules/interviews', { params });
    } catch (error) {
      console.error('Failed to fetch interview schedules:', error);
      throw error;
    }
  },
};
