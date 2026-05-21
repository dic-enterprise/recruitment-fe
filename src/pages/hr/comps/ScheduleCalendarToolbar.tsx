import { Navigate, type ToolbarProps, type View } from 'react-big-calendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

const VIEW_LABELS: Record<string, string> = {
  month: 'Tháng',
  week: 'Tuần',
  day: 'Ngày',
  agenda: 'Danh sách',
};

export default function ScheduleCalendarToolbar({
  label,
  onNavigate,
  onView,
  view,
  views,
}: ToolbarProps) {
  const viewList = (views as View[]) ?? [];

  return (
    <div className='rbc-toolbar mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex flex-wrap items-center gap-1'>
        {viewList.map((name) => (
          <button
            key={name}
            type='button'
            className={cn(
              'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
              view === name
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background hover:bg-muted',
            )}
            onClick={() => onView(name)}
          >
            {VIEW_LABELS[name] ?? name}
          </button>
        ))}
        <button
          type='button'
          className='rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted'
          onClick={() => onNavigate(Navigate.TODAY)}
        >
          Hôm nay
        </button>
      </div>

      <div className='flex items-center justify-center gap-2'>
        <Button
          type='button'
          variant='outline'
          size='icon'
          aria-label='Trước'
          onClick={() => onNavigate(Navigate.PREVIOUS)}
        >
          <ChevronLeft className='h-4 w-4' />
        </Button>
        <span className='rbc-toolbar-label min-w-[10rem] text-center text-base font-semibold sm:min-w-[12rem] sm:text-lg'>
          {label}
        </span>
        <Button
          type='button'
          variant='outline'
          size='icon'
          aria-label='Sau'
          onClick={() => onNavigate(Navigate.NEXT)}
        >
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
