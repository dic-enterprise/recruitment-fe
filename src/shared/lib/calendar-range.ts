import { endOfMonth, endOfWeek, format, startOfDay, startOfMonth, startOfWeek } from 'date-fns';

export type CalendarView = 'day' | 'week' | 'month';

const DATE_FMT = 'yyyy-MM-dd';

export function resolveCalendarRange(view: CalendarView, anchor: Date) {
  switch (view) {
    case 'day':
      return {
        startDate: format(startOfDay(anchor), DATE_FMT),
        endDate: format(startOfDay(anchor), DATE_FMT),
      };
    case 'week':
      return {
        startDate: format(startOfWeek(anchor, { weekStartsOn: 1 }), DATE_FMT),
        endDate: format(endOfWeek(anchor, { weekStartsOn: 1 }), DATE_FMT),
      };
    case 'month':
      return {
        startDate: format(startOfMonth(anchor), DATE_FMT),
        endDate: format(endOfMonth(anchor), DATE_FMT),
      };
  }
}
