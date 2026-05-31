import { describe, expect, it } from 'vitest';
import { resolveCalendarRange } from './calendar-range';

describe('resolveCalendarRange', () => {
  const anchor = new Date(2026, 4, 30); // 30 May 2026 (local)

  it('day view uses same start and end', () => {
    expect(resolveCalendarRange('day', anchor)).toEqual({
      startDate: '2026-05-30',
      endDate: '2026-05-30',
    });
  });

  it('week view starts Monday', () => {
    expect(resolveCalendarRange('week', anchor)).toEqual({
      startDate: '2026-05-25',
      endDate: '2026-05-31',
    });
  });

  it('month view covers full month', () => {
    expect(resolveCalendarRange('month', anchor)).toEqual({
      startDate: '2026-05-01',
      endDate: '2026-05-31',
    });
  });
});
