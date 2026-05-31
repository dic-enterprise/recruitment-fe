import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { parseISO, isPast } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { interviewScheduleService } from '@/shared/lib/api-services';
import { formatDateTime } from '@/shared/lib/utils';
import { useStatusLabels } from '@/shared/i18n/hooks';
import { ScheduleInterviewDialog } from '@/shared/components/hr/ScheduleInterviewDialog';
import { CancelScheduleDialog } from '@/shared/components/hr/CancelScheduleDialog';
import { RecordInterviewResultDialog } from '@/shared/components/hr/RecordInterviewResultDialog';
import type { InterviewProcess, InterviewResult, InterviewSchedule } from '@/shared/types/api';
import { Calendar, ExternalLink, Loader2, MapPin, Video } from 'lucide-react';

interface ProcessScheduleSectionProps {
  process: InterviewProcess;
  readOnly?: boolean;
}

function ScheduleCard({ schedule }: { schedule: InterviewSchedule }) {
  const { t } = useTranslation();
  const { interviewFormat, scheduleStatus } = useStatusLabels();

  return (
    <div className='rounded-md border bg-muted/20 p-3 text-sm space-y-2'>
      <div className='flex flex-wrap items-center gap-2'>
        <Badge variant='outline'>{interviewFormat(schedule.format)}</Badge>
        <Badge variant={schedule.status === 'SCHEDULED' ? 'default' : 'secondary'}>
          {scheduleStatus(schedule.status)}
        </Badge>
      </div>
      <p>
        <span className='text-muted-foreground'>{t('schedule.timeLabel')} </span>
        {formatDateTime(schedule.scheduledStart)} — {formatDateTime(schedule.scheduledEnd)}
      </p>
      {schedule.assignedHr && (
        <p>
          <span className='text-muted-foreground'>{t('process.hrInterviewer')} </span>
          {schedule.assignedHr}
        </p>
      )}
      {schedule.meetingUrl && (
        <a
          href={schedule.meetingUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='inline-flex items-center gap-1 text-primary hover:underline'
        >
          <Video className='h-3.5 w-3.5' />
          {t('schedule.meetingLink')}
          <ExternalLink className='h-3 w-3' />
        </a>
      )}
      {schedule.location && (
        <p className='flex items-center gap-1.5'>
          <MapPin className='h-3.5 w-3.5 text-muted-foreground' />
          {schedule.location}
        </p>
      )}
      {schedule.notes && <p className='text-muted-foreground'>{schedule.notes}</p>}
    </div>
  );
}

function ResultCard({ result }: { result: InterviewResult }) {
  const { t } = useTranslation();
  const { interviewOutcome } = useStatusLabels();

  return (
    <div className='rounded-md border border-green-200 bg-green-50/50 p-3 text-sm dark:border-green-900/40 dark:bg-green-950/20'>
      <p className='font-medium text-green-800 dark:text-green-300'>
        {t('process.result')} {interviewOutcome(result.outcome)}
      </p>
      {result.feedback && <p className='mt-2 text-muted-foreground'>{result.feedback}</p>}
      <p className='mt-1 text-xs text-muted-foreground'>{formatDateTime(result.recordedAt)}</p>
    </div>
  );
}

export function ProcessScheduleSection({ process, readOnly }: ProcessScheduleSectionProps) {
  const { t } = useTranslation();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [lastResult, setLastResult] = useState<InterviewResult | null>(null);

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['interview-process', String(process.id), 'schedules'],
    queryFn: () => interviewScheduleService.getByProcessId(process.id),
  });

  const activeSchedule = useMemo(
    () => schedules.find((s) => s.status === 'SCHEDULED'),
    [schedules],
  );

  const completedSchedule = useMemo(
    () => schedules.find((s) => s.status === 'COMPLETED'),
    [schedules],
  );

  const canRecordResult =
    !!activeSchedule &&
    (isPast(parseISO(activeSchedule.scheduledEnd)) || process.status === 'INTERVIEW_SCHEDULED');

  const canScheduleInterview =
    process.status === 'CONTACTED' ||
    (process.status === 'SHORTLISTED' && process.contactStatus === 'CONTACTED');

  const showScheduleButton = !readOnly && canScheduleInterview && !activeSchedule;

  const needsContactFirst =
    !readOnly && process.status === 'SHORTLISTED' && process.contactStatus !== 'CONTACTED';

  const showEditCancel =
    !readOnly && process.status === 'INTERVIEW_SCHEDULED' && !!activeSchedule;

  const showRecordResult = !readOnly && process.status === 'INTERVIEW_SCHEDULED' && canRecordResult;

  const cancelledCount = schedules.filter((s) => s.status === 'CANCELLED').length;

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center gap-2'>
        {showScheduleButton && (
          <Button size='sm' onClick={() => setScheduleOpen(true)}>
            <Calendar className='mr-1.5 h-3.5 w-3.5' />
            {t('process.scheduleInterview')}
          </Button>
        )}
        {showEditCancel && activeSchedule && (
          <>
            <Button size='sm' variant='secondary' onClick={() => setEditOpen(true)}>
              {t('process.editSchedule')}
            </Button>
            <Button size='sm' variant='outline' onClick={() => setCancelOpen(true)}>
              {t('process.cancelSchedule')}
            </Button>
          </>
        )}
        {showRecordResult && activeSchedule && (
          <Button size='sm' onClick={() => setResultOpen(true)}>
            {t('process.recordResult')}
          </Button>
        )}
        <Button size='sm' variant='ghost' asChild>
          <Link to='/hr/calendar'>{t('process.viewCalendar')}</Link>
        </Button>
      </div>

      {isLoading && (
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <Loader2 className='h-4 w-4 animate-spin' />
          {t('process.loadingSchedule')}
        </div>
      )}

      {!isLoading && activeSchedule && <ScheduleCard schedule={activeSchedule} />}

      {!isLoading && needsContactFirst && (
        <p className='text-sm text-muted-foreground'>
          {t('process.cannotSchedulePrefix')}{' '}
          <a href='#section-contact' className='font-medium text-primary hover:underline'>
            {t('process.goToContactForm')}
          </a>{' '}
          {t('process.cannotScheduleSuffix')}
        </p>
      )}

      {!isLoading && !activeSchedule && schedules.length === 0 && !needsContactFirst && (
        <p className='text-sm text-muted-foreground italic'>{t('process.noSchedule')}</p>
      )}

      {process.status === 'INTERVIEW_DONE' && (lastResult || completedSchedule) && (
        <div className='space-y-2'>
          {lastResult ? (
            <ResultCard result={lastResult} />
          ) : completedSchedule ? (
            <p className='text-sm text-muted-foreground'>{t('process.interviewCompleted')}</p>
          ) : null}
        </div>
      )}

      {cancelledCount > 0 && (
        <details className='text-sm'>
          <summary className='cursor-pointer text-muted-foreground'>
            {t('process.scheduleCancelled', { count: cancelledCount })}
          </summary>
          <div className='mt-2 space-y-2'>
            {schedules
              .filter((s) => s.status === 'CANCELLED')
              .map((s) => (
                <ScheduleCard key={s.id} schedule={s} />
              ))}
          </div>
        </details>
      )}

      <ScheduleInterviewDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        process={process}
      />
      {activeSchedule && (
        <>
          <ScheduleInterviewDialog
            open={editOpen}
            onOpenChange={setEditOpen}
            process={process}
            schedule={activeSchedule}
          />
          <CancelScheduleDialog
            open={cancelOpen}
            onOpenChange={setCancelOpen}
            schedule={activeSchedule}
          />
          <RecordInterviewResultDialog
            open={resultOpen}
            onOpenChange={setResultOpen}
            process={process}
            schedule={activeSchedule}
            onSuccess={() => {
              void interviewScheduleService
                .getById(activeSchedule.id)
                .then((detail) => {
                  if (detail.result) setLastResult(detail.result);
                })
                .catch(() => undefined);
            }}
          />
        </>
      )}
    </div>
  );
}
