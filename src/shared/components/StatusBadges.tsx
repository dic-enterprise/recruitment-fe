import { Badge } from '@/shared/components/ui/badge.tsx';
import { useStatusLabels } from '@/shared/i18n/hooks';
import { cn } from '@/shared/lib/utils.ts';
import type { ExtractStatus, JobStatus, EmploymentTag, MatchQueueStatus } from '@/shared/lib/mock-data.ts';

const jobStatusClassNames: Record<JobStatus, string> = {
  ACTIVE: 'bg-success text-success-foreground',
  CLOSED: 'bg-muted text-muted-foreground',
  ARCHIVED: 'bg-secondary text-secondary-foreground',
};

const extractStatusClassNames: Record<ExtractStatus, string> = {
  PENDING: 'bg-warning text-warning-foreground',
  SCANNING: 'bg-info text-info-foreground animate-pulse',
  COMPLETE: 'bg-success text-success-foreground',
  FAILED: 'bg-destructive text-destructive-foreground',
};

const employmentTagClassNames: Record<EmploymentTag, string> = {
  CHUA_NHAN_VIEC: 'bg-accent text-accent-foreground',
  DA_CO_VIEC: 'bg-secondary text-secondary-foreground',
};

const queueStatusClassNames: Record<MatchQueueStatus, string> = {
  queued: 'bg-warning text-warning-foreground',
  processing: 'bg-info text-info-foreground animate-pulse',
  done: 'bg-success text-success-foreground',
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const { jobStatus } = useStatusLabels();
  return (
    <Badge className={cn('border-0', jobStatusClassNames[status])}>{jobStatus(status)}</Badge>
  );
}

export function ExtractStatusBadge({ status }: { status: ExtractStatus }) {
  const { extractStatus } = useStatusLabels();
  return (
    <Badge className={cn('border-0', extractStatusClassNames[status])}>{extractStatus(status)}</Badge>
  );
}

export function EmploymentBadge({ tag }: { tag: EmploymentTag }) {
  const { employment } = useStatusLabels();
  return (
    <Badge className={cn('border-0', employmentTagClassNames[tag])}>{employment(tag)}</Badge>
  );
}

export function QueueStatusBadge({ status }: { status: MatchQueueStatus }) {
  const { queueStatus } = useStatusLabels();
  return (
    <Badge className={cn('border-0', queueStatusClassNames[status])}>{queueStatus(status)}</Badge>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const isHigh = score >= 80;
  return (
    <Badge
      className={cn(
        'border-0 text-sm font-bold',
        isHigh
          ? 'bg-success text-success-foreground'
          : score >= 60
            ? 'bg-warning text-warning-foreground'
            : 'bg-destructive text-destructive-foreground',
      )}
    >
      {score}%
    </Badge>
  );
}
