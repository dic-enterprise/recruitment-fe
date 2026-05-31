import type { PipelineStatus } from '@/shared/types/api';

export const PROCESS_STEP_KEYS: PipelineStatus[] = [
  'SHORTLISTED',
  'CONTACTED',
  'INTERVIEW_SCHEDULED',
  'INTERVIEW_DONE',
  'OFFER',
  'ONBOARDED',
];
