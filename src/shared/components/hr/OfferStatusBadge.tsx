import { Badge } from '@/shared/components/ui/badge';
import { useStatusLabels } from '@/shared/i18n/hooks';
import { cn } from '@/shared/lib/utils';
import type { OfferStatus } from '@/shared/types/api';

const styles: Record<OfferStatus, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  SENT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  ACCEPTED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  DECLINED: 'bg-destructive/15 text-destructive',
  WITHDRAWN: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
};

interface OfferStatusBadgeProps {
  status: OfferStatus;
}

export function OfferStatusBadge({ status }: OfferStatusBadgeProps) {
  const { offerStatus } = useStatusLabels();

  return (
    <Badge className={cn('border-0 font-medium', styles[status])}>{offerStatus(status)}</Badge>
  );
}
