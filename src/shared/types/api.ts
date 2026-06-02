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

export type PipelineStatus =
  | 'NONE'
  | 'SHORTLISTED'
  | 'CONTACTED'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEW_DONE'
  | 'OFFER'
  | 'ONBOARDED'
  | 'REJECTED';

export type ContactStatus = 'NOT_CONTACTED' | 'CONTACTED';

export type ProcessActivityAction =
  | 'CREATED'
  | 'METADATA_UPDATED'
  | 'CONTACT_MARKED'
  | 'REJECTED'
  | 'STATUS_CHANGED'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEW_RESCHEDULED'
  | 'INTERVIEW_CANCELLED'
  | 'INTERVIEW_RESULT_RECORDED'
  | 'OFFER_DRAFTED'
  | 'OFFER_SENT'
  | 'OFFER_ACCEPTED'
  | 'OFFER_DECLINED'
  | 'ONBOARD_PLANNED'
  | 'ONBOARD_CONFIRMED';

export interface CVMatch {
  id: number;
  candidateId: number;
  candidateName: string;
  jobId: number;
  jobTitle: string;
  score: number;
  /** BE có thể chưa trả breakdown — UI hiển thị "—" khi thiếu */
  details?: {
    skillMatch: number;
    experienceMatch: number;
    educationMatch: number;
  } | null;
  pipelineStatus?: PipelineStatus;
  processId?: number | null;
  createdAt: string;
}

export interface InterviewProcess {
  id: number;
  matchId: number;
  candidateId: number;
  candidateName: string;
  jobId: number;
  jobTitle: string;
  matchScore: number;
  status: PipelineStatus;
  contactStatus: ContactStatus;
  contactNote?: string | null;
  contactedAt?: string | null;
  assignedHr?: string | null;
  notes?: string | null;
  rejectReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessActivity {
  id: number;
  processId: number;
  action: ProcessActivityAction;
  fromStatus?: PipelineStatus;
  toStatus?: PipelineStatus;
  note?: string;
  performedBy?: string;
  createdAt: string;
}

export interface InterviewProcessDetail {
  process: InterviewProcess;
  activities: ProcessActivity[];
}

export interface PaginatedInterviewProcesses {
  items: InterviewProcess[];
  total: number;
  page: number;
  size: number;
}

export interface CreateInterviewProcessRequest {
  matchId: number;
  assignedHr?: string;
  notes?: string;
}

export interface UpdateInterviewProcessRequest {
  assignedHr?: string;
  notes?: string;
}

export interface UpdateContactRequest {
  contactStatus: ContactStatus;
  contactNote?: string;
}

export interface InterviewProcessListParams {
  jobId?: number;
  status?: PipelineStatus;
  contactStatus?: ContactStatus;
  search?: string;
  page?: number;
  size?: number;
}

/** Response POST /candidates/upload (Phase 2) */
export interface UploadCandidatesResponse {
  candidates: Candidate[];
  /** Số task EXTRACT_CV đã enqueue (thường = số file) */
  extractTasksQueued: number;
  /** Số task MATCH_JOB đã enqueue; 0 khi không gửi jobIds */
  matchTasksQueued: number;
}

export interface UploadCandidatesOptions {
  jobIds?: number[];
  source?: string;
}

export interface PublicApplyCandidateRequest {
  jobId: number;
  name: string;
  email: string;
  phone?: string;
  experience: string;
  skills: string[];
  source?: string;
}

export interface PublicApplyCandidateResponse {
  candidate: Candidate;
  matchTasksQueued?: number;
}

/** POST /matches/trigger — enqueue MATCH_JOB (cartesian candidate × job) */
export interface TriggerMatchRequest {
  jobIds: number[];
  candidateIds: number[];
}

export interface TriggerMatchResponse {
  /** Số task MATCH_JOB đã enqueue */
  matchTasksQueued: number;
  /** Candidate bị bỏ qua (extract không phải COMPLETE) */
  skippedCandidateIds: number[];
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

export type InterviewFormat = 'ONLINE' | 'ONSITE' | 'PHONE';

export type InterviewScheduleStatus = 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';

export type InterviewOutcome = 'PASSED' | 'FAILED' | 'NO_SHOW' | 'WITHDRAWN';

export interface InterviewSchedule {
  id: number;
  processId: number;
  candidateId: number;
  candidateName: string;
  jobId: number;
  jobTitle: string;
  matchScore?: number;
  scheduledStart: string;
  scheduledEnd: string;
  timezone: string;
  format: InterviewFormat;
  location?: string | null;
  meetingUrl?: string | null;
  status: InterviewScheduleStatus;
  notes?: string | null;
  assignedHr?: string | null;
  processStatus?: PipelineStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface InterviewScheduleCalendarResponse {
  startDate: string;
  endDate: string;
  timezone: string;
  items: InterviewSchedule[];
  total: number;
}

export interface InterviewScheduleCalendarParams {
  startDate: string;
  endDate: string;
  timezone?: string;
  jobId?: number;
  candidateId?: number;
  assignedHr?: string;
  format?: InterviewFormat;
  includeCancelled?: boolean;
}

export interface CreateInterviewScheduleRequest {
  processId: number;
  scheduledStart: string;
  scheduledEnd: string;
  timezone?: string;
  format: InterviewFormat;
  location?: string | null;
  meetingUrl?: string | null;
  notes?: string;
  assignedHr?: string;
}

export interface UpdateInterviewScheduleRequest {
  scheduledStart?: string;
  scheduledEnd?: string;
  format?: InterviewFormat;
  location?: string | null;
  meetingUrl?: string | null;
  notes?: string;
  assignedHr?: string;
}

export interface CancelInterviewScheduleRequest {
  reason: string;
}

export interface InterviewResult {
  id: number;
  scheduleId: number;
  processId: number;
  outcome: InterviewOutcome;
  feedback?: string | null;
  recordedBy?: string | null;
  recordedAt: string;
}

export interface RecordInterviewResultRequest {
  scheduleId: number;
  outcome: InterviewOutcome;
  feedback?: string;
  recordedBy?: string;
}

export interface InterviewResultDetail {
  result: InterviewResult;
  process: Pick<InterviewProcess, 'id' | 'status' | 'contactStatus'>;
}

export interface InterviewScheduleDetail {
  schedule: InterviewSchedule;
  process: Pick<InterviewProcess, 'id' | 'status' | 'candidateName' | 'jobTitle'>;
  result?: InterviewResult | null;
}

// ─── Phase 4: Offer & Onboard ───────────────────────────────────────────────

export type OfferStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'DECLINED' | 'WITHDRAWN';

export interface OfferPayload {
  version: number;
  fields: Record<string, string | number | null>;
}

export interface JobOffer {
  id: number;
  processId: number;
  status: OfferStatus;
  payload: OfferPayload;
  sentAt?: string | null;
  sentToEmail?: string | null;
  sendError?: string | null;
  createdBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpsertOfferRequest {
  payload: OfferPayload;
  createdBy?: string;
}

export interface SendOfferRequest {
  resend?: boolean;
}

export interface UpdateOfferStatusRequest {
  status: 'ACCEPTED' | 'DECLINED' | 'WITHDRAWN';
  note?: string;
}

export interface OnboardPlan {
  id: number;
  processId: number;
  onboardDate: string;
  welcomeContactName: string;
  welcomeContactEmail?: string | null;
  welcomeContactPhone?: string | null;
  arrangementNotes?: string | null;
  departmentId?: number | null;
  confirmedAt?: string | null;
  confirmedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpsertOnboardRequest {
  onboardDate: string;
  welcomeContactName: string;
  welcomeContactEmail?: string;
  welcomeContactPhone?: string;
  arrangementNotes?: string;
  confirmedBy?: string;
}

export interface OnboardConfirmResponse {
  plan: OnboardPlan;
  process: Pick<InterviewProcess, 'id' | 'status'>;
}

// Phase 5 — Auth & Users
export type UserRole = 'ADMIN' | 'HR';
export type LoginType = 'DB' | 'SSO';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresInSeconds: number;
  userId: number;
  username: string;
  displayName: string;
  role: UserRole;
}

export interface CurrentUser {
  userId: number;
  username: string;
  displayName: string;
  role: UserRole;
}

export interface AppUserRequest {
  username: string;
  fullName: string;
  email: string;
  password?: string;
  loginType: LoginType;
  role?: UserRole;
  enabled?: boolean;
}

export interface AppUser {
  id: number;
  username: string;
  fullName: string;
  email: string;
  loginType: LoginType;
  role: UserRole;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}
