import type { CSSProperties } from 'react';
import { addHours, parseISO } from 'date-fns';
import type { InterviewSchedule, InterviewStatus } from '../types/api';

export type ScheduleCalendarEvent = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: InterviewSchedule;
};

const STATUS_COLORS: Record<InterviewStatus, { backgroundColor: string; borderColor: string }> = {
  SCHEDULED: { backgroundColor: 'hsl(var(--primary))', borderColor: 'hsl(var(--primary))' },
  COMPLETED: { backgroundColor: 'hsl(142 76% 36%)', borderColor: 'hsl(142 76% 30%)' },
  CANCELLED: { backgroundColor: 'hsl(var(--muted-foreground))', borderColor: 'hsl(var(--muted))' },
};

export function toCalendarEvents(interviews: InterviewSchedule[]): ScheduleCalendarEvent[] {
  return interviews.map((item) => {
    const start = parseISO(item.startAt);
    const end = item.endAt ? parseISO(item.endAt) : addHours(start, 1);
    return {
      id: item.id,
      title: `${item.candidateName} — ${item.jobTitle}`,
      start,
      end,
      resource: item,
    };
  });
}

export function getInterviewEventStyle(status: InterviewStatus): CSSProperties {
  const colors = STATUS_COLORS[status] ?? STATUS_COLORS.SCHEDULED;
  return {
    backgroundColor: colors.backgroundColor,
    borderColor: colors.borderColor,
    color: '#fff',
    borderRadius: '6px',
    border: 'none',
    fontSize: '12px',
  };
}
