import { cn, formatDateTime } from '@/shared/lib/utils';
import { usePipelineLabels } from '@/shared/i18n/hooks';
import type { ProcessActivity } from '@/shared/types/api';
import { useTranslation } from 'react-i18next';

interface ProcessTimelineProps {
  activities: ProcessActivity[];
}

const NOTE_IN_TITLE_ACTIONS = new Set<ProcessActivity['action']>([
  'REJECTED',
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
]);

export function ProcessTimeline({ activities }: ProcessTimelineProps) {
  const { t } = useTranslation();
  const { pipelineStatusLabels, processActivityLabels } = usePipelineLabels();

  function describeActivity(activity: ProcessActivity): string {
    const base = processActivityLabels[activity.action] ?? activity.action;

    if (activity.action === 'CONTACT_MARKED' && activity.performedBy) {
      return t('pipeline.contactMarkedBy', {
        name: activity.performedBy,
        action: base.toLowerCase(),
      });
    }

    if (activity.action === 'STATUS_CHANGED' && activity.fromStatus && activity.toStatus) {
      return t('pipeline.statusArrow', {
        from: pipelineStatusLabels[activity.fromStatus],
        to: pipelineStatusLabels[activity.toStatus],
      });
    }

    if (NOTE_IN_TITLE_ACTIONS.has(activity.action) && activity.note) {
      return `${base}: ${activity.note}`;
    }

    return base;
  }

  if (activities.length === 0) {
    return <p className='text-sm text-muted-foreground italic'>{t('process.noActivities')}</p>;
  }

  return (
    <ol className='space-y-0'>
      {activities.map((activity, index) => {
        const isLast = index === activities.length - 1;
        const showNoteBelow = activity.note && !NOTE_IN_TITLE_ACTIONS.has(activity.action);

        return (
          <li key={activity.id} className='flex gap-3'>
            <div className='flex w-5 shrink-0 flex-col items-center pt-1.5'>
              <span
                className='h-2.5 w-2.5 shrink-0 rounded-full border-2 border-primary bg-background'
                aria-hidden
              />
              {!isLast && <div className='mt-1 w-px flex-1 bg-border' />}
            </div>
            <div className={cn('min-w-0 flex-1', !isLast && 'pb-5')}>
              <p className='text-sm font-medium leading-snug'>{describeActivity(activity)}</p>
              {showNoteBelow && (
                <p className='mt-0.5 text-sm text-muted-foreground'>{activity.note}</p>
              )}
              <p className='mt-1 font-mono text-[11px] text-muted-foreground'>
                {formatDateTime(activity.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
