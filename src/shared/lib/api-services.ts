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
  InterviewSchedule,
  InterviewScheduleCalendarParams,
  InterviewScheduleCalendarResponse,
  CreateInterviewScheduleRequest,
  UpdateInterviewScheduleRequest,
  CancelInterviewScheduleRequest,
  RecordInterviewResultRequest,
  InterviewResultDetail,
  InterviewScheduleDetail,
  InterviewProcess,
  InterviewProcessDetail,
  PaginatedInterviewProcesses,
  CreateInterviewProcessRequest,
  UpdateInterviewProcessRequest,
  UpdateContactRequest,
  InterviewProcessListParams,
  UploadCandidatesResponse,
  UploadCandidatesOptions,
  TriggerMatchRequest,
  TriggerMatchResponse,
  JobOffer,
  UpsertOfferRequest,
  SendOfferRequest,
  UpdateOfferStatusRequest,
  OnboardPlan,
  UpsertOnboardRequest,
  OnboardConfirmResponse,
  LoginRequest,
  LoginResponse,
  CurrentUser,
  AppUser,
  AppUserRequest,
} from '../types/api';

export const authService = {
  login: async (body: LoginRequest): Promise<LoginResponse> => {
    try {
      return await apiClient.post('/auth/login', body);
    } catch (error) {
      console.error('Failed to login:', error);
      throw error;
    }
  },
  me: async (): Promise<CurrentUser> => {
    try {
      return await apiClient.get('/auth/me');
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      throw error;
    }
  },
};

export const userService = {
  getAll: async (): Promise<AppUser[]> => {
    try {
      return await apiClient.get('/users');
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  },
  getById: async (id: number): Promise<AppUser> => {
    try {
      return await apiClient.get(`/users/${id}`);
    } catch (error) {
      console.error(`Failed to fetch user ${id}:`, error);
      throw error;
    }
  },
  create: async (body: AppUserRequest): Promise<AppUser> => {
    try {
      return await apiClient.post('/users', body);
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  },
  update: async (id: number, body: AppUserRequest): Promise<AppUser> => {
    try {
      return await apiClient.put(`/users/${id}`, body);
    } catch (error) {
      console.error(`Failed to update user ${id}:`, error);
      throw error;
    }
  },
  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/users/${id}`);
    } catch (error) {
      console.error(`Failed to delete user ${id}:`, error);
      throw error;
    }
  },
};

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
  uploadCVs: async (
    files: File[],
    options?: UploadCandidatesOptions,
  ): Promise<UploadCandidatesResponse> => {
    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append('files', file);
      }
      if (options?.jobIds?.length) {
        for (const jobId of options.jobIds) {
          formData.append('jobIds', String(jobId));
        }
      }
      if (options?.source) {
        formData.append('source', options.source);
      }
      const raw = await apiClient.post<UploadCandidatesResponse | Candidate[]>(
        '/candidates/upload',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );
      if (Array.isArray(raw)) {
        const jobCount = options?.jobIds?.length ?? 0;
        return {
          candidates: raw,
          extractTasksQueued: raw.length,
          matchTasksQueued: jobCount > 0 ? raw.length * jobCount : 0,
        };
      }
      return raw;
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
  /** @deprecated Prefer triggerMatchBatch — single job */
  triggerMatch: async (jobId: string, candidateIds: string[]): Promise<void> => {
    await matchService.triggerMatchBatch({
      jobIds: [Number(jobId)],
      candidateIds: candidateIds.map(Number),
    });
  },

  triggerMatchBatch: async (body: TriggerMatchRequest): Promise<TriggerMatchResponse> => {
    try {
      const raw = await apiClient.post<TriggerMatchResponse | void>('/matches/trigger', body);
      if (raw && typeof raw === 'object' && 'matchTasksQueued' in raw) {
        return raw as TriggerMatchResponse;
      }
      const queued = body.jobIds.length * body.candidateIds.length;
      return { matchTasksQueued: queued, skippedCandidateIds: [] };
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

/** @deprecated Phase 3 — dùng `interviewScheduleService.getCalendar` */
export const scheduleService = {
  getInterviews: async (params: { from: string; to: string }): Promise<InterviewSchedule[]> => {
    const startDate = params.from.slice(0, 10);
    const endDate = params.to.slice(0, 10);
    const data = await interviewScheduleService.getCalendar({ startDate, endDate });
    return data.items;
  },
};

export const interviewScheduleService = {
  getCalendar: async (
    params: InterviewScheduleCalendarParams,
  ): Promise<InterviewScheduleCalendarResponse> => {
    try {
      return await apiClient.get('/interview-schedules', {
        params: { timezone: 'Asia/Ho_Chi_Minh', calendarOnly: true, ...params },
      });
    } catch (error) {
      console.error('Failed to fetch interview schedules calendar:', error);
      throw error;
    }
  },

  getById: async (id: string | number): Promise<InterviewScheduleDetail> => {
    try {
      return await apiClient.get(`/interview-schedules/${id}`);
    } catch (error) {
      console.error(`Failed to fetch interview schedule ${id}:`, error);
      throw error;
    }
  },

  create: async (body: CreateInterviewScheduleRequest): Promise<InterviewSchedule> => {
    try {
      return await apiClient.post('/interview-schedules', {
        timezone: 'Asia/Ho_Chi_Minh',
        ...body,
      });
    } catch (error) {
      console.error('Failed to create interview schedule:', error);
      throw error;
    }
  },

  update: async (
    id: string | number,
    body: UpdateInterviewScheduleRequest,
  ): Promise<InterviewSchedule> => {
    try {
      return await apiClient.patch(`/interview-schedules/${id}`, body);
    } catch (error) {
      console.error(`Failed to update interview schedule ${id}:`, error);
      throw error;
    }
  },

  cancel: async (
    id: string | number,
    body: CancelInterviewScheduleRequest,
  ): Promise<InterviewSchedule> => {
    try {
      return await apiClient.post(`/interview-schedules/${id}/cancel`, body);
    } catch (error) {
      console.error(`Failed to cancel interview schedule ${id}:`, error);
      throw error;
    }
  },

  getByProcessId: async (processId: string | number): Promise<InterviewSchedule[]> => {
    try {
      return await apiClient.get(`/interview-processes/${processId}/schedules`);
    } catch (error) {
      console.error(`Failed to fetch schedules for process ${processId}:`, error);
      throw error;
    }
  },

  recordResult: async (
    processId: string | number,
    body: RecordInterviewResultRequest,
  ): Promise<InterviewResultDetail> => {
    try {
      return await apiClient.post(`/interview-processes/${processId}/interview-result`, body);
    } catch (error) {
      console.error(`Failed to record interview result for process ${processId}:`, error);
      throw error;
    }
  },
};

export const interviewProcessService = {
  getAll: async (params?: InterviewProcessListParams): Promise<PaginatedInterviewProcesses> => {
    try {
      return await apiClient.get('/interview-processes', { params });
    } catch (error) {
      console.error('Failed to fetch interview processes:', error);
      throw error;
    }
  },

  getById: async (id: string): Promise<InterviewProcessDetail> => {
    try {
      return await apiClient.get(`/interview-processes/${id}`);
    } catch (error) {
      console.error(`Failed to fetch interview process ${id}:`, error);
      throw error;
    }
  },

  getByCandidateId: async (candidateId: string): Promise<InterviewProcess[]> => {
    try {
      return await apiClient.get(`/interview-processes/candidate/${candidateId}`);
    } catch (error) {
      console.error(`Failed to fetch processes for candidate ${candidateId}:`, error);
      throw error;
    }
  },

  create: async (body: CreateInterviewProcessRequest): Promise<InterviewProcess> => {
    try {
      return await apiClient.post('/interview-processes', body);
    } catch (error) {
      console.error('Failed to create interview process:', error);
      throw error;
    }
  },

  update: async (id: string, body: UpdateInterviewProcessRequest): Promise<InterviewProcess> => {
    try {
      return await apiClient.patch(`/interview-processes/${id}`, body);
    } catch (error) {
      console.error(`Failed to update interview process ${id}:`, error);
      throw error;
    }
  },

  updateContact: async (id: string, body: UpdateContactRequest): Promise<InterviewProcess> => {
    try {
      return await apiClient.post(`/interview-processes/${id}/contact`, body);
    } catch (error) {
      console.error(`Failed to update contact for process ${id}:`, error);
      throw error;
    }
  },

  reject: async (id: string, reason: string): Promise<InterviewProcess> => {
    try {
      return await apiClient.post(`/interview-processes/${id}/reject`, { reason });
    } catch (error) {
      console.error(`Failed to reject interview process ${id}:`, error);
      throw error;
    }
  },

  getOffer: async (processId: string | number): Promise<JobOffer | null> => {
    try {
      const data = await apiClient.get<JobOffer | null>(`/interview-processes/${processId}/offer`);
      return data ?? null;
    } catch (error) {
      console.error(`Failed to fetch offer for process ${processId}:`, error);
      throw error;
    }
  },

  upsertOffer: async (processId: string | number, body: UpsertOfferRequest): Promise<JobOffer> => {
    try {
      return await apiClient.put(`/interview-processes/${processId}/offer`, body);
    } catch (error) {
      console.error(`Failed to save offer for process ${processId}:`, error);
      throw error;
    }
  },

  sendOffer: async (
    processId: string | number,
    body?: SendOfferRequest,
  ): Promise<JobOffer> => {
    try {
      return await apiClient.post(`/interview-processes/${processId}/offer/send`, body ?? {});
    } catch (error) {
      console.error(`Failed to send offer for process ${processId}:`, error);
      throw error;
    }
  },

  updateOfferStatus: async (
    processId: string | number,
    body: UpdateOfferStatusRequest,
  ): Promise<JobOffer> => {
    try {
      return await apiClient.patch(`/interview-processes/${processId}/offer/status`, body);
    } catch (error) {
      console.error(`Failed to update offer status for process ${processId}:`, error);
      throw error;
    }
  },

  getOnboard: async (processId: string | number): Promise<OnboardPlan | null> => {
    try {
      const data = await apiClient.get<OnboardPlan | null>(`/interview-processes/${processId}/onboard`);
      return data ?? null;
    } catch (error) {
      console.error(`Failed to fetch onboard plan for process ${processId}:`, error);
      throw error;
    }
  },

  upsertOnboard: async (
    processId: string | number,
    body: UpsertOnboardRequest,
  ): Promise<OnboardPlan> => {
    try {
      return await apiClient.put(`/interview-processes/${processId}/onboard`, body);
    } catch (error) {
      console.error(`Failed to save onboard plan for process ${processId}:`, error);
      throw error;
    }
  },

  confirmOnboard: async (processId: string | number): Promise<OnboardConfirmResponse> => {
    try {
      return await apiClient.post(`/interview-processes/${processId}/onboard/confirm`);
    } catch (error) {
      console.error(`Failed to confirm onboard for process ${processId}:`, error);
      throw error;
    }
  },
};
