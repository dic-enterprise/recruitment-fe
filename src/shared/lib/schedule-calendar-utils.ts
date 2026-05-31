import type { CSSProperties } from 'react';
import { addHours, parseISO } from 'date-fns';
import i18n from '@/shared/i18n';
import type { InterviewFormat, InterviewSchedule, InterviewScheduleStatus } from '../types/api';

export type ScheduleCalendarEvent = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: InterviewSchedule;
};

const STATUS_COLORS: Record<InterviewScheduleStatus, { backgroundColor: string; borderColor: string }> = {
  SCHEDULED: { backgroundColor: 'hsl(var(--primary))', borderColor: 'hsl(var(--primary))' },
  COMPLETED: { backgroundColor: 'hsl(142 76% 36%)', borderColor: 'hsl(142 76% 30%)' },
  CANCELLED: { backgroundColor: 'hsl(var(--muted-foreground))', borderColor: 'hsl(var(--muted))' },
};

export function getInterviewFormatLabel(format: InterviewFormat): string {
  return i18n.t(`status.interviewFormat.${format}`, format);
}

export function toCalendarEvents(schedules: InterviewSchedule[]): ScheduleCalendarEvent[] {
  return schedules.map((item) => {
    const start = parseISO(item.scheduledStart);
    const end = item.scheduledEnd ? parseISO(item.scheduledEnd) : addHours(start, 1);
    return {
      id: item.id,
      title: `${item.candidateName ?? i18n.t('schedule.candidateFallback')} — ${item.jobTitle ?? i18n.t('schedule.jobFallback')}`,
      start,
      end,
      resource: item,
    };
  });
}

export function getInterviewEventStyle(status: InterviewScheduleStatus): CSSProperties {
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
