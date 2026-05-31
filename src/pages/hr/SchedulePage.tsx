import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Calendar, dateFnsLocalizer, type View } from 'react-big-calendar';
import ScheduleCalendarToolbar from './comps/ScheduleCalendarToolbar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import PageHeader from '@/shared/components/PageHeader';
import { interviewScheduleService } from '@/shared/lib/api-services';
import { resolveCalendarRange, type CalendarView } from '@/shared/lib/calendar-range';
import {
  getInterviewEventStyle,
  toCalendarEvents,
  type ScheduleCalendarEvent,
} from '@/shared/lib/schedule-calendar-utils';
import { useStatusLabels } from '@/shared/i18n/hooks';
import type { InterviewSchedule } from '@/shared/types/api';
import { formatDateTime } from '@/shared/lib/utils';
import { Loader2, MapPin, User, Briefcase, ExternalLink, GitBranch } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';

const locales = { vi };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

function viewToCalendarView(view: View): CalendarView {
  if (view === 'day') return 'day';
  if (view === 'week') return 'week';
  return 'month';
}

export default function SchedulePage() {
  const { t } = useTranslation();
  const { interviewFormat, scheduleStatus } = useStatusLabels();
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(() => new Date());
  const [selected, setSelected] = useState<InterviewSchedule | null>(null);

  const calendarView = viewToCalendarView(view);
  const { startDate, endDate } = useMemo(
    () => resolveCalendarRange(calendarView, date),
    [calendarView, date],
  );

  const calendarMessages = useMemo(
    () => ({
      today: t('schedule.today'),
      previous: t('schedule.previous'),
      next: t('schedule.next'),
      month: t('schedule.month'),
      week: t('schedule.week'),
      day: t('schedule.day'),
      agenda: t('schedule.agenda'),
      date: t('schedule.day'),
      time: t('schedule.time'),
      event: t('schedule.interview'),
      noEventsInRange: t('schedule.noEvents'),
      showMore: (total: number) => t('schedule.showMore', { count: total }),
    }),
    [t],
  );

  const { data, isLoading } = useQuery({
    queryKey: ['interview-schedules', startDate, endDate],
    queryFn: () => interviewScheduleService.getCalendar({ startDate, endDate }),
  });

  const interviews = data?.items ?? [];
  const events = useMemo(() => toCalendarEvents(interviews), [interviews]);

  const handleSelectEvent = (event: ScheduleCalendarEvent) => {
    setSelected(event.resource);
  };

  return (
    <div className='flex h-full flex-col'>
      <PageHeader
        title={t('schedule.title')}
        description={t('schedule.description', { start: startDate, end: endDate })}
      />

      <div className='schedule-calendar relative min-h-[560px] flex-1 rounded-lg border bg-card p-4'>
        {isLoading && (
          <div className='absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/60'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        )}
        <Calendar
          localizer={localizer}
          culture='vi'
          messages={calendarMessages}
          components={{ toolbar: ScheduleCalendarToolbar }}
          events={events}
          view={view}
          onView={setView}
          views={['month', 'week', 'day', 'agenda']}
          date={date}
          onNavigate={setDate}
          onSelectEvent={handleSelectEvent}
          startAccessor='start'
          endAccessor='end'
          style={{ height: '100%', minHeight: 520 }}
          eventPropGetter={(event) => ({
            style: getInterviewEventStyle(event.resource.status),
          })}
          popup
        />
      </div>

      <Dialog open={selected != null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className='max-w-md'>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className='pr-6'>{selected.candidateName}</DialogTitle>
              </DialogHeader>
              <div className='space-y-3 text-sm'>
                <div className='flex flex-wrap items-center gap-2'>
                  <Badge variant='outline'>{scheduleStatus(selected.status)}</Badge>
                  <Badge variant='secondary'>{interviewFormat(selected.format)}</Badge>
                </div>
                <p className='flex items-center gap-2 text-muted-foreground'>
                  <Briefcase className='h-4 w-4 shrink-0' />
                  {selected.jobTitle}
                </p>
                <p>
                  <span className='text-muted-foreground'>{t('schedule.timeLabel')} </span>
                  {formatDateTime(selected.scheduledStart)} — {formatDateTime(selected.scheduledEnd)}
                </p>
                {selected.assignedHr && (
                  <p className='flex items-center gap-2'>
                    <User className='h-4 w-4 text-muted-foreground' />
                    {selected.assignedHr}
                  </p>
                )}
                {selected.location && (
                  <p className='flex items-center gap-2'>
                    <MapPin className='h-4 w-4 text-muted-foreground' />
                    {selected.location}
                  </p>
                )}
                {selected.meetingUrl && (
                  <a
                    href={selected.meetingUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center gap-2 text-primary hover:underline'
                  >
                    <ExternalLink className='h-4 w-4' />
                    {t('schedule.meetingLink')}
                  </a>
                )}
                {selected.notes && (
                  <p className='rounded-md bg-muted/50 p-2 text-muted-foreground'>{selected.notes}</p>
                )}
                <Button variant='default' className='w-full' asChild>
                  <Link to={`/hr/interview-processes/${selected.processId}`}>
                    <GitBranch className='mr-2 h-4 w-4' />
                    {t('schedule.openProcess')}
                  </Link>
                </Button>
                <Button variant='outline' className='w-full' asChild>
                  <Link to={`/hr/candidates/${selected.candidateId}`}>{t('schedule.viewCandidate')}</Link>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
