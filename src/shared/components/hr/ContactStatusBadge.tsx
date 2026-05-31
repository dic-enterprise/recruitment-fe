import { Badge } from '@/shared/components/ui/badge';
import { usePipelineLabels } from '@/shared/i18n/hooks';
import { cn } from '@/shared/lib/utils';
import type { ContactStatus } from '@/shared/types/api';
import { Check, PhoneOff } from 'lucide-react';

interface ContactStatusBadgeProps {
  status: ContactStatus;
}

export function ContactStatusBadge({ status }: ContactStatusBadgeProps) {
  const { contactStatusLabels } = usePipelineLabels();
  const contacted = status === 'CONTACTED';

  return (
    <Badge
      className={cn(
        'border-0 gap-1 font-medium',
        contacted
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
          : 'bg-muted text-muted-foreground',
      )}
    >
      {contacted ? <Check className='h-3 w-3' /> : <PhoneOff className='h-3 w-3' />}
      {contactStatusLabels[status]}
    </Badge>
  );
}
