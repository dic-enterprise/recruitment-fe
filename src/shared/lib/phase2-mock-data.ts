/**
 * Phase 2 mock data — Interview Process
 *
 * Dùng khi VITE_USE_PHASE2_MOCK=true.
 * Docs: docs/phase2/api-contract.md, docs/phase2/ui-spec.md
 */

import type {
  Candidate,
  CVMatch,
  CreateInterviewProcessRequest,
  InterviewProcess,
  InterviewProcessDetail,
  InterviewProcessListParams,
  PaginatedInterviewProcesses,
  ProcessActivity,
  UpdateContactRequest,
  UpdateInterviewProcessRequest,
  UploadCandidatesResponse,
  TriggerMatchResponse,
} from '@/shared/types/api';

// ---------------------------------------------------------------------------
// Mock CV Matches (extends Phase 1 data with pipelineStatus)
// ---------------------------------------------------------------------------

export const mockCVMatchesPhase2: CVMatch[] = [
  {
    id: 1,
    candidateId: 1,
    candidateName: 'Nguyễn Minh Đức',
    jobId: 1,
    jobTitle: 'Senior Frontend Developer',
    score: 92,
    details: { skillMatch: 95, experienceMatch: 88, educationMatch: 90 },
    pipelineStatus: 'NONE',
    processId: null,
    createdAt: '2026-05-28T10:00:00+07:00',
  },
  {
    id: 2,
    candidateId: 8,
    candidateName: 'Bùi Thanh Sơn',
    jobId: 1,
    jobTitle: 'Senior Frontend Developer',
    score: 85,
    details: { skillMatch: 88, experienceMatch: 82, educationMatch: 80 },
    pipelineStatus: 'SHORTLISTED',
    processId: 102,
    createdAt: '2026-05-28T10:05:00+07:00',
  },
  {
    id: 3,
    candidateId: 10,
    candidateName: 'Trịnh Văn Khoa',
    jobId: 1,
    jobTitle: 'Senior Frontend Developer',
    score: 65,
    details: { skillMatch: 60, experienceMatch: 75, educationMatch: 60 },
    pipelineStatus: 'NONE',
    processId: null,
    createdAt: '2026-05-28T10:10:00+07:00',
  },
  {
    id: 4,
    candidateId: 2,
    candidateName: 'Trần Thị Hương',
    jobId: 2,
    jobTitle: 'Backend Developer (Java)',
    score: 88,
    details: { skillMatch: 90, experienceMatch: 85, educationMatch: 88 },
    pipelineStatus: 'CONTACTED',
    processId: 101,
    createdAt: '2026-05-27T09:00:00+07:00',
  },
  {
    id: 5,
    candidateId: 10,
    candidateName: 'Trịnh Văn Khoa',
    jobId: 2,
    jobTitle: 'Backend Developer (Java)',
    score: 82,
    details: { skillMatch: 85, experienceMatch: 80, educationMatch: 78 },
    pipelineStatus: 'REJECTED',
    processId: 103,
    createdAt: '2026-05-26T14:00:00+07:00',
  },
  {
    id: 6,
    candidateId: 7,
    candidateName: 'Đặng Minh Tú',
    jobId: 3,
    jobTitle: 'Digital Marketing Specialist',
    score: 80,
    details: { skillMatch: 82, experienceMatch: 78, educationMatch: 80 },
    pipelineStatus: 'NONE',
    processId: null,
    createdAt: '2026-05-29T08:00:00+07:00',
  },
  {
    id: 7,
    candidateId: 1,
    candidateName: 'Nguyễn Minh Đức',
    jobId: 4,
    jobTitle: 'DevOps Engineer',
    score: 55,
    details: { skillMatch: 50, experienceMatch: 60, educationMatch: 55 },
    pipelineStatus: 'NONE',
    processId: null,
    createdAt: '2026-05-25T11:00:00+07:00',
  },
  {
    id: 8,
    candidateId: 10,
    candidateName: 'Trịnh Văn Khoa',
    jobId: 4,
    jobTitle: 'DevOps Engineer',
    score: 91,
    details: { skillMatch: 95, experienceMatch: 90, educationMatch: 85 },
    pipelineStatus: 'NONE',
    processId: null,
    createdAt: '2026-05-25T11:30:00+07:00',
  },
];

// ---------------------------------------------------------------------------
// Mock Interview Processes
// ---------------------------------------------------------------------------

export const mockInterviewProcesses: InterviewProcess[] = [
  {
    id: 101,
    matchId: 4,
    candidateId: 2,
    candidateName: 'Trần Thị Hương',
    jobId: 2,
    jobTitle: 'Backend Developer (Java)',
    matchScore: 88,
    status: 'CONTACTED',
    contactStatus: 'CONTACTED',
    contactNote: 'Đã gọi điện lúc 14h, ứng viên đồng ý phỏng vấn online tuần sau',
    contactedAt: '2026-05-30T14:00:00+07:00',
    assignedHr: 'Trần Thị Lan',
    notes: 'Backend mạnh, ưu tiên vòng technical',
    rejectReason: null,
    createdAt: '2026-05-29T10:30:00+07:00',
    updatedAt: '2026-05-30T14:00:00+07:00',
  },
  {
    id: 102,
    matchId: 2,
    candidateId: 8,
    candidateName: 'Bùi Thanh Sơn',
    jobId: 1,
    jobTitle: 'Senior Frontend Developer',
    matchScore: 85,
    status: 'SHORTLISTED',
    contactStatus: 'NOT_CONTACTED',
    contactNote: null,
    contactedAt: null,
    assignedHr: null,
    notes: null,
    rejectReason: null,
    createdAt: '2026-05-29T11:00:00+07:00',
    updatedAt: '2026-05-29T11:00:00+07:00',
  },
  {
    id: 103,
    matchId: 5,
    candidateId: 10,
    candidateName: 'Trịnh Văn Khoa',
    jobId: 2,
    jobTitle: 'Backend Developer (Java)',
    matchScore: 82,
    status: 'REJECTED',
    contactStatus: 'CONTACTED',
    contactNote: 'Ứng viên không quan tâm vị trí backend',
    contactedAt: '2026-05-27T16:00:00+07:00',
    assignedHr: 'Lê Minh Tuấn',
    notes: null,
    rejectReason: 'Ứng viên muốn tập trung DevOps, không nhận backend',
    createdAt: '2026-05-26T15:00:00+07:00',
    updatedAt: '2026-05-27T17:30:00+07:00',
  },
];

// ---------------------------------------------------------------------------
// Mock Activities (by processId)
// ---------------------------------------------------------------------------

export const mockProcessActivities: Record<number, ProcessActivity[]> = {
  101: [
    {
      id: 1001,
      processId: 101,
      action: 'CONTACT_MARKED',
      fromStatus: 'SHORTLISTED',
      toStatus: 'CONTACTED',
      note: 'Đã gọi điện lúc 14h, ứng viên đồng ý phỏng vấn online tuần sau',
      performedBy: 'Trần Thị Lan',
      createdAt: '2026-05-30T14:00:00+07:00',
    },
    {
      id: 1000,
      processId: 101,
      action: 'CREATED',
      toStatus: 'SHORTLISTED',
      note: 'Tạo từ Matching CV — score 88%',
      performedBy: 'Trần Thị Lan',
      createdAt: '2026-05-29T10:30:00+07:00',
    },
  ],
  102: [
    {
      id: 1002,
      processId: 102,
      action: 'CREATED',
      toStatus: 'SHORTLISTED',
      performedBy: 'HR System',
      createdAt: '2026-05-29T11:00:00+07:00',
    },
  ],
  103: [
    {
      id: 1005,
      processId: 103,
      action: 'REJECTED',
      fromStatus: 'CONTACTED',
      toStatus: 'REJECTED',
      note: 'Ứng viên muốn tập trung DevOps, không nhận backend',
      performedBy: 'Lê Minh Tuấn',
      createdAt: '2026-05-27T17:30:00+07:00',
    },
    {
      id: 1004,
      processId: 103,
      action: 'CONTACT_MARKED',
      fromStatus: 'SHORTLISTED',
      toStatus: 'CONTACTED',
      note: 'Ứng viên không quan tâm vị trí backend',
      performedBy: 'Lê Minh Tuấn',
      createdAt: '2026-05-27T16:00:00+07:00',
    },
    {
      id: 1003,
      processId: 103,
      action: 'CREATED',
      toStatus: 'SHORTLISTED',
      performedBy: 'Lê Minh Tuấn',
      createdAt: '2026-05-26T15:00:00+07:00',
    },
  ],
};

/** Pre-built detail for process 101 (CONTACTED — demo đầy đủ) */
export const mockProcessDetail101: InterviewProcessDetail = {
  process: mockInterviewProcesses[0],
  activities: mockProcessActivities[101],
};

/** Pre-built detail for process 102 (SHORTLISTED — form contact chưa submit) */
export const mockProcessDetail102: InterviewProcessDetail = {
  process: mockInterviewProcesses[1],
  activities: mockProcessActivities[102],
};

/** Pre-built detail for process 103 (REJECTED — read-only forms) */
export const mockProcessDetail103: InterviewProcessDetail = {
  process: mockInterviewProcesses[2],
  activities: mockProcessActivities[103],
};

export function getMockProcessDetail(id: number): InterviewProcessDetail | undefined {
  const process = mockInterviewProcesses.find((p) => p.id === id);
  if (!process) return undefined;
  return {
    process,
    activities: mockProcessActivities[id] ?? [],
  };
}

// ---------------------------------------------------------------------------
// In-memory store for mock mutations (dev only)
// ---------------------------------------------------------------------------

let nextProcessId = 104;
let nextActivityId = 1010;

function cloneMatches(): CVMatch[] {
  return mockCVMatchesPhase2.map((m) => ({ ...m, details: { ...m.details } }));
}

function cloneProcesses(): InterviewProcess[] {
  return mockInterviewProcesses.map((p) => ({ ...p }));
}

export function mockGetMatches(): CVMatch[] {
  return cloneMatches().sort((a, b) => b.score - a.score);
}

export function mockGetProcesses(params?: InterviewProcessListParams): PaginatedInterviewProcesses {
  let items = cloneProcesses();

  if (params?.jobId != null) {
    items = items.filter((p) => p.jobId === params.jobId);
  }
  if (params?.status) {
    items = items.filter((p) => p.status === params.status);
  }
  if (params?.contactStatus) {
    items = items.filter((p) => p.contactStatus === params.contactStatus);
  }
  if (params?.search?.trim()) {
    const q = params.search.trim().toLowerCase();
    items = items.filter(
      (p) =>
        p.candidateName.toLowerCase().includes(q) ||
        p.jobTitle.toLowerCase().includes(q),
    );
  }

  items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const page = params?.page ?? 0;
  const size = params?.size ?? 20;
  const start = page * size;

  return {
    items: items.slice(start, start + size),
    total: items.length,
    page,
    size,
  };
}

export function mockGetProcessesByCandidate(candidateId: number): InterviewProcess[] {
  return cloneProcesses().filter((p) => p.candidateId === candidateId);
}

export function mockCreateProcess(body: CreateInterviewProcessRequest): InterviewProcess {
  const match = mockCVMatchesPhase2.find((m) => m.id === body.matchId);
  if (!match) {
    throw mockError(400, 'MATCH_NOT_FOUND', 'Không tìm thấy kết quả matching');
  }

  const existing = mockInterviewProcesses.find(
    (p) =>
      p.candidateId === match.candidateId &&
      p.jobId === match.jobId &&
      p.status !== 'REJECTED' &&
      p.status !== 'ONBOARDED',
  );
  if (existing) {
    throw mockError(
      409,
      'PROCESS_ALREADY_EXISTS',
      'Đã tồn tại quy trình phỏng vấn cho ứng viên và job này',
    );
  }

  const now = new Date().toISOString();
  const process: InterviewProcess = {
    id: nextProcessId++,
    matchId: match.id,
    candidateId: match.candidateId,
    candidateName: match.candidateName,
    jobId: match.jobId,
    jobTitle: match.jobTitle,
    matchScore: match.score,
    status: 'SHORTLISTED',
    contactStatus: 'NOT_CONTACTED',
    contactNote: null,
    contactedAt: null,
    assignedHr: body.assignedHr ?? null,
    notes: body.notes ?? null,
    rejectReason: null,
    createdAt: now,
    updatedAt: now,
  };

  mockInterviewProcesses.push(process);
  match.pipelineStatus = 'SHORTLISTED';
  match.processId = process.id;

  const activity: ProcessActivity = {
    id: nextActivityId++,
    processId: process.id,
    action: 'CREATED',
    toStatus: 'SHORTLISTED',
    note: body.notes,
    performedBy: body.assignedHr ?? 'HR',
    createdAt: now,
  };
  mockProcessActivities[process.id] = [activity];

  return { ...process };
}

export function mockUpdateContact(
  processId: number,
  body: UpdateContactRequest,
): InterviewProcess {
  const process = mockInterviewProcesses.find((p) => p.id === processId);
  if (!process) {
    throw mockError(404, 'PROCESS_NOT_FOUND', 'Không tìm thấy quy trình phỏng vấn');
  }
  if (process.status === 'REJECTED' || process.status === 'ONBOARDED') {
    throw mockError(400, 'INVALID_CONTACT_TRANSITION', 'Không thể cập nhật liên hệ ở trạng thái hiện tại');
  }

  const now = new Date().toISOString();
  const fromStatus = process.status;

  process.contactStatus = body.contactStatus;
  process.contactNote = body.contactNote ?? process.contactNote;
  process.updatedAt = now;

  if (body.contactStatus === 'CONTACTED') {
    process.status = 'CONTACTED';
    process.contactedAt = now;
  } else {
    process.status = 'SHORTLISTED';
    process.contactedAt = null;
  }

  const match = mockCVMatchesPhase2.find((m) => m.id === process.matchId);
  if (match) {
    match.pipelineStatus = process.status;
  }

  const activity: ProcessActivity = {
    id: nextActivityId++,
    processId,
    action: 'CONTACT_MARKED',
    fromStatus,
    toStatus: process.status,
    note: body.contactNote,
    performedBy: process.assignedHr ?? 'HR',
    createdAt: now,
  };
  mockProcessActivities[processId] = [activity, ...(mockProcessActivities[processId] ?? [])];

  return { ...process };
}

export function mockUpdateProcessMetadata(
  processId: number,
  body: UpdateInterviewProcessRequest,
): InterviewProcess {
  const process = mockInterviewProcesses.find((p) => p.id === processId);
  if (!process) {
    throw mockError(404, 'PROCESS_NOT_FOUND', 'Không tìm thấy quy trình phỏng vấn');
  }

  if (body.assignedHr !== undefined) process.assignedHr = body.assignedHr;
  if (body.notes !== undefined) process.notes = body.notes;
  process.updatedAt = new Date().toISOString();

  return { ...process };
}

export function mockRejectProcess(processId: number, reason: string): InterviewProcess {
  const process = mockInterviewProcesses.find((p) => p.id === processId);
  if (!process) {
    throw mockError(404, 'PROCESS_NOT_FOUND', 'Không tìm thấy quy trình phỏng vấn');
  }

  const now = new Date().toISOString();
  const fromStatus = process.status;
  process.status = 'REJECTED';
  process.rejectReason = reason;
  process.updatedAt = now;

  const match = mockCVMatchesPhase2.find((m) => m.id === process.matchId);
  if (match) match.pipelineStatus = 'REJECTED';

  mockProcessActivities[processId] = [
    {
      id: nextActivityId++,
      processId,
      action: 'REJECTED',
      fromStatus,
      toStatus: 'REJECTED',
      note: reason,
      performedBy: process.assignedHr ?? 'HR',
      createdAt: now,
    },
    ...(mockProcessActivities[processId] ?? []),
  ];

  return { ...process };
}

/** Simulate network delay */
export function mockDelay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface MockApiError extends Error {
  status: number;
  errorCode: string;
}

function mockError(status: number, errorCode: string, message: string): MockApiError {
  const err = new Error(message) as MockApiError;
  err.status = status;
  err.errorCode = errorCode;
  return err;
}

// ---------------------------------------------------------------------------
// Trigger matching (HR — Matching CV page)
// ---------------------------------------------------------------------------

export function mockTriggerMatch(jobIds: number[], candidateIds: number[]): TriggerMatchResponse {
  const matchTasksQueued =
    jobIds.length > 0 && candidateIds.length > 0 ? jobIds.length * candidateIds.length : 0;
  return { matchTasksQueued, skippedCandidateIds: [] };
}

// ---------------------------------------------------------------------------
// Upload CV + optional match queue
// ---------------------------------------------------------------------------

let nextMockCandidateId = 100;

export function mockUploadCandidates(files: File[], jobIds?: number[]): UploadCandidatesResponse {
  const now = new Date().toISOString();
  const candidates: Candidate[] = files.map((file) => {
    const id = nextMockCandidateId++;
    return {
      id,
      name: file.name.replace(/\.pdf$/i, ''),
      email: '',
      cvFileName: file.name,
      cvPreviewable: true,
      extractStatus: 'PENDING',
      employmentTag: 'CHUA_NHAN_VIEC',
      uploadedAt: now,
    };
  });

  const extractTasksQueued = files.length;
  const matchTasksQueued =
    jobIds && jobIds.length > 0 ? files.length * jobIds.length : 0;

  return { candidates, extractTasksQueued, matchTasksQueued };
}

// ---------------------------------------------------------------------------
// Scenario index (for docs / tests)
// ---------------------------------------------------------------------------

export const phase2MockScenarios = {
  /** Match chưa có process — test CreateProcessDialog */
  freshMatch: mockCVMatchesPhase2.find((m) => m.id === 1)!,
  /** Process SHORTLISTED — test contact form submit */
  shortlistedProcess: mockProcessDetail102,
  /** Process CONTACTED — test read-only contactedAt + timeline */
  contactedProcess: mockProcessDetail101,
  /** Process REJECTED — test disabled forms + banner */
  rejectedProcess: mockProcessDetail103,
} as const;
