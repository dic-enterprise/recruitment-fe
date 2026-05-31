import { Badge } from '@/shared/components/ui/badge';
import { usePipelineLabels } from '@/shared/i18n/hooks';
import { cn } from '@/shared/lib/utils';
import type { PipelineStatus } from '@/shared/types/api';

const statusStyles: Record<PipelineStatus, string> = {
  NONE: 'bg-muted text-muted-foreground',
  SHORTLISTED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  CONTACTED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  INTERVIEW_SCHEDULED: 'bg-primary/15 text-primary',
  INTERVIEW_DONE: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  OFFER: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  ONBOARDED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  REJECTED: 'bg-destructive/15 text-destructive',
};

interface PipelineStatusBadgeProps {
  status: PipelineStatus;
  size?: 'sm' | 'md';
}

export function PipelineStatusBadge({ status, size = 'md' }: PipelineStatusBadgeProps) {
  const { pipelineStatusLabels } = usePipelineLabels();

  return (
    <Badge
      className={cn(
        'border-0 font-medium',
        size === 'sm' && 'text-[10px] px-1.5 py-0',
        statusStyles[status] ?? statusStyles.NONE,
      )}
    >
      {pipelineStatusLabels[status] ?? status}
    </Badge>
  );
}
