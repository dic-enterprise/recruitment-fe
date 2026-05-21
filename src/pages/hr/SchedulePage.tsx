import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, dateFnsLocalizer, type View } from 'react-big-calendar';
import ScheduleCalendarToolbar from './comps/ScheduleCalendarToolbar';
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth } from 'date-fns';
import { vi } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import PageHeader from '@/shared/components/PageHeader';
import { scheduleService } from '@/shared/lib/api-services';
import {
  getInterviewEventStyle,
  toCalendarEvents,
  type ScheduleCalendarEvent,
} from '@/shared/lib/schedule-calendar-utils';
import type { InterviewSchedule } from '@/shared/types/api';
import { formatDateTime } from '@/shared/lib/utils';
import { Loader2, MapPin, User, Briefcase, ExternalLink } from 'lucide-react';
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

const calendarMessages = {
  today: 'Hôm nay',
  previous: 'Trước',
  next: 'Sau',
  month: 'Tháng',
  week: 'Tuần',
  day: 'Ngày',
  agenda: 'Danh sách',
  date: 'Ngày',
  time: 'Giờ',
  event: 'Phỏng vấn',
  noEventsInRange: 'Không có lịch phỏng vấn trong khoảng thời gian này.',
  showMore: (total: number) => `+${total} thêm`,
};

const STATUS_LABELS: Record<InterviewSchedule['status'], string> = {
  SCHEDULED: 'Đã lên lịch',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

function getInitialRange() {
  const now = new Date();
  return { start: startOfMonth(now), end: endOfMonth(now) };
}

export default function SchedulePage() {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(() => new Date());
  const [range, setRange] = useState(getInitialRange);
  const [selected, setSelected] = useState<InterviewSchedule | null>(null);

  const { data: interviews = [], isLoading } = useQuery({
    queryKey: ['interview-schedules', range.start.toISOString(), range.end.toISOString()],
    queryFn: () =>
      scheduleService.getInterviews({
        from: range.start.toISOString(),
        to: range.end.toISOString(),
      }),
  });

  const events = useMemo(() => toCalendarEvents(interviews), [interviews]);

  const handleRangeChange = (newRange: Date[] | { start: Date; end: Date }) => {
    if (Array.isArray(newRange)) {
      if (newRange.length === 0) return;
      setRange({ start: newRange[0], end: newRange[newRange.length - 1] });
      return;
    }
    setRange({ start: newRange.start, end: newRange.end });
  };

  const handleSelectEvent = (event: ScheduleCalendarEvent) => {
    setSelected(event.resource);
  };

  return (
    <div className='flex h-full flex-col'>
      <PageHeader
        title='Schedule'
        description='Lịch phỏng vấn đã được lên lịch trình'
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
          onRangeChange={handleRangeChange}
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
                <div className='flex items-center gap-2'>
                  <Badge variant='outline'>{STATUS_LABELS[selected.status]}</Badge>
                </div>
                <p className='flex items-center gap-2 text-muted-foreground'>
                  <Briefcase className='h-4 w-4 shrink-0' />
                  {selected.jobTitle}
                </p>
                <p>
                  <span className='text-muted-foreground'>Thời gian: </span>
                  {formatDateTime(selected.startAt)} — {formatDateTime(selected.endAt)}
                </p>
                {selected.interviewer && (
                  <p className='flex items-center gap-2'>
                    <User className='h-4 w-4 text-muted-foreground' />
                    {selected.interviewer}
                  </p>
                )}
                {selected.location && (
                  <p className='flex items-center gap-2'>
                    <MapPin className='h-4 w-4 text-muted-foreground' />
                    {selected.location}
                  </p>
                )}
                {selected.meetingLink && (
                  <a
                    href={selected.meetingLink}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center gap-2 text-primary hover:underline'
                  >
                    <ExternalLink className='h-4 w-4' />
                    Link phỏng vấn
                  </a>
                )}
                {selected.notes && (
                  <p className='rounded-md bg-muted/50 p-2 text-muted-foreground'>{selected.notes}</p>
                )}
                <Button variant='outline' className='w-full' asChild>
                  <Link to={`/hr/candidates/${selected.candidateId}`}>Xem hồ sơ ứng viên</Link>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
