import { Badge } from '@/shared/components/ui/badge.tsx';
import { cn } from '@/shared/lib/utils.ts';
import type { ExtractStatus, JobStatus, EmploymentTag, MatchQueueStatus } from '@/shared/lib/mock-data.ts';

const jobStatusConfig: Record<JobStatus, { label: string; className: string }> = {
  ACTIVE: { label: 'Active', className: 'bg-success text-success-foreground' },
  CLOSED: { label: 'Closed', className: 'bg-muted text-muted-foreground' },
  ARCHIVED: { label: 'Archived', className: 'bg-secondary text-secondary-foreground' },
};

const extractStatusConfig: Record<ExtractStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-warning text-warning-foreground' },
  SCANNING: { label: 'Scanning', className: 'bg-info text-info-foreground animate-pulse' },
  COMPLETE: { label: 'Complete', className: 'bg-success text-success-foreground' },
  FAILED: { label: 'Failed', className: 'bg-destructive text-destructive-foreground' },
};

const employmentTagConfig: Record<EmploymentTag, { label: string; className: string }> = {
  CHUA_NHAN_VIEC: { label: 'Available', className: 'bg-accent text-accent-foreground' },
  DA_CO_VIEC: { label: 'Employed', className: 'bg-secondary text-secondary-foreground' },
};

const queueStatusConfig: Record<MatchQueueStatus, { label: string; className: string }> = {
  queued: { label: 'Queued', className: 'bg-warning text-warning-foreground' },
  processing: { label: 'Processing', className: 'bg-info text-info-foreground animate-pulse' },
  done: { label: 'Done', className: 'bg-success text-success-foreground' },
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const config = jobStatusConfig[status];
  return <Badge className={cn('border-0', config.className)}>{config.label}</Badge>;
}

export function ExtractStatusBadge({ status }: { status: ExtractStatus }) {
  const config = extractStatusConfig[status];
  return <Badge className={cn('border-0', config.className)}>{config.label}</Badge>;
}

export function EmploymentBadge({ tag }: { tag: EmploymentTag }) {
  const config = employmentTagConfig[tag];
  return <Badge className={cn('border-0', config.className)}>{config.label}</Badge>;
}

export function QueueStatusBadge({ status }: { status: MatchQueueStatus }) {
  const config = queueStatusConfig[status];
  return <Badge className={cn('border-0', config.className)}>{config.label}</Badge>;
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
