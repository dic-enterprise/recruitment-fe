export type JobStatus = 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
export type ExtractStatus = 'PENDING' | 'SCANNING' | 'COMPLETE' | 'FAILED';
export type EmploymentTag = 'CHUA_NHAN_VIEC' | 'DA_CO_VIEC';

export interface DepartmentContact {
  name: string;
  email?: string;
  phone?: string;
}

export interface Department {
  id: number;
  code: string;
  name: string;
  manager?: string;
  contacts: DepartmentContact[];
  jobCount: number;
}

export interface Job {
  id: number;
  departmentId: number;
  departmentName: string;
  title: string;
  salary?: string;
  requirements: string;
  status: JobStatus;
  createdAt: string;
  matchCount: number;
  highMatchCount: number;
  location?: string;
  workplaceHybrid?: boolean;
  employmentFullTime?: boolean;
  recruitmentUrgency?: 'NORMAL' | 'URGENT';
  skills?: string[];
  minMatchingScore?: number;
}

export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone?: string;
  cvFileName: string;
  /** Server-computed: true when CV can be opened inline in a browser tab. */
  cvPreviewable?: boolean;
  extractStatus: ExtractStatus;
  employmentTag: EmploymentTag;
  extractError?: { code?: string; message: string; timestamp?: string };
  uploadedAt: string;
  skills?: string[];
  experience?: string;
}

export interface CVMatch {
  id: number;
  candidateId: number;
  candidateName: string;
  jobId: number;
  jobTitle: string;
  score: number;
  details: {
    skillMatch: number;
    experienceMatch: number;
    educationMatch: number;
  };
  createdAt: string;
}

export type MatchQueueStatus = 'queued' | 'processing' | 'done';

export interface MatchQueueItem {
  candidateId: number;
  candidateName: string;
  status: MatchQueueStatus;
}

export interface DashboardStats {
  activeJobs: number;
  totalCandidates: number;
  highMatches: number;
  avgMatchScore: number;
  extractsComplete: number;
  extractsPending: number;
  extractFailures: number;
}

export interface CodeResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
  errorCode?: string;
  timestamp?: string;
}

export interface AIProviderConfig {
  id?: number;
  name?: string;
  providerType: 'OPENAI' | 'GEMINI';
  enabled: boolean;
  apiKey: string;
  apiUrl: string;
  model: string;
}

export type AIConfig = AIProviderConfig[];

export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface InterviewSchedule {
  id: number;
  candidateId: number;
  candidateName: string;
  jobId: number;
  jobTitle: string;
  startAt: string;
  endAt: string;
  location?: string;
  meetingLink?: string;
  interviewer?: string;
  status: InterviewStatus;
  notes?: string;
}
