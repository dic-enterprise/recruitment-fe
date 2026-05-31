import { format, parseISO } from 'date-fns';

const DEFAULT_OFFSET = '+07:00';

/** datetime-local value → ISO8601 with fixed offset (Asia/Ho_Chi_Minh) */
export function localDateTimeToIso(date: string, time: string, offset = DEFAULT_OFFSET): string {
  return `${date}T${time}:00${offset}`;
}

export function splitScheduleIso(iso: string): { date: string; time: string } {
  const d = parseISO(iso);
  return {
    date: format(d, 'yyyy-MM-dd'),
    time: format(d, 'HH:mm'),
  };
}

export function defaultScheduleEndIso(startDate: string, startTime: string): { date: string; time: string } {
  const [h, m] = startTime.split(':').map(Number);
  const endH = h + 1;
  return { date: startDate, time: `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}` };
}
