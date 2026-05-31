import type { InterviewProcess } from '@/shared/types/api';

export type ProcessDetailSectionId =
  | 'info'
  | 'contact'
  | 'schedule'
  | 'offer'
  | 'onboard'
  | 'timeline';

export function getActiveProcessSection(process: InterviewProcess): ProcessDetailSectionId {
  if (process.status === 'REJECTED') return 'timeline';
  if (process.status === 'ONBOARDED') return 'onboard';
  if (process.status === 'OFFER') return 'onboard';
  if (process.status === 'INTERVIEW_DONE') return 'offer';
  if (process.status === 'INTERVIEW_SCHEDULED') return 'schedule';
  if (process.status === 'CONTACTED') return 'schedule';
  if (process.status === 'SHORTLISTED') {
    return process.contactStatus === 'CONTACTED' ? 'schedule' : 'contact';
  }
  return 'contact';
}

export function sectionDomId(section: ProcessDetailSectionId): string {
  return `section-${section}`;
}
