import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ContactStatus, PipelineStatus, ProcessActivityAction } from '@/shared/types/api';
import { PROCESS_STEP_KEYS } from '@/shared/lib/pipeline-labels';

export function usePipelineLabels() {
  const { t } = useTranslation();

  return useMemo(() => {
    const pipelineStatusLabels = Object.fromEntries(
      (
        [
          'NONE',
          'SHORTLISTED',
          'CONTACTED',
          'INTERVIEW_SCHEDULED',
          'INTERVIEW_DONE',
          'OFFER',
          'ONBOARDED',
          'REJECTED',
        ] as PipelineStatus[]
      ).map((key) => [key, t(`pipeline.status.${key}`)]),
    ) as Record<PipelineStatus, string>;

    const contactStatusLabels = Object.fromEntries(
      (['NOT_CONTACTED', 'CONTACTED'] as ContactStatus[]).map((key) => [
        key,
        t(`pipeline.contact.${key}`),
      ]),
    ) as Record<ContactStatus, string>;

    const processActivityLabels = Object.fromEntries(
      (
        [
          'CREATED',
          'METADATA_UPDATED',
          'CONTACT_MARKED',
          'REJECTED',
          'STATUS_CHANGED',
          'INTERVIEW_SCHEDULED',
          'INTERVIEW_RESCHEDULED',
          'INTERVIEW_CANCELLED',
          'INTERVIEW_RESULT_RECORDED',
          'OFFER_DRAFTED',
          'OFFER_SENT',
          'OFFER_ACCEPTED',
          'OFFER_DECLINED',
          'ONBOARD_PLANNED',
          'ONBOARD_CONFIRMED',
        ] as ProcessActivityAction[]
      ).map((key) => [key, t(`pipeline.activity.${key}`)]),
    ) as Record<ProcessActivityAction, string>;

    const processStepLabels = Object.fromEntries(
      PROCESS_STEP_KEYS.map((key) => [key, t(`pipeline.step.${key}`)]),
    ) as Record<string, string>;

    return {
      pipelineStatusLabels,
      contactStatusLabels,
      processActivityLabels,
      processStepLabels,
    };
  }, [t]);
}

export function useStatusLabels() {
  const { t } = useTranslation();

  return useMemo(
    () => ({
      jobStatus: (status: string) => t(`status.job.${status}`, status),
      extractStatus: (status: string) => t(`status.extract.${status}`, status),
      employment: (tag: string) => t(`status.employment.${tag}`, tag),
      queueStatus: (status: string) => t(`status.queue.${status}`, status),
      scheduleStatus: (status: string) => t(`status.schedule.${status}`, status),
      offerStatus: (status: string) => t(`status.offer.${status}`, status),
      interviewOutcome: (outcome: string) => t(`status.interviewOutcome.${outcome}`, outcome),
      interviewFormat: (format: string) => t(`status.interviewFormat.${format}`, format),
    }),
    [t],
  );
}
