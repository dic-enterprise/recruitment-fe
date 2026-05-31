import { cn } from '@/shared/lib/utils';
import { PROCESS_STEP_KEYS } from '@/shared/lib/pipeline-labels';
import { usePipelineLabels } from '@/shared/i18n/hooks';
import type { PipelineStatus } from '@/shared/types/api';
import { Check, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';

function stepIndex(status: PipelineStatus): number {
  if (status === 'REJECTED') {
    const idx = PROCESS_STEP_KEYS.indexOf('CONTACTED');
    return idx >= 0 ? idx : 0;
  }
  const idx = PROCESS_STEP_KEYS.indexOf(status);
  if (idx >= 0) return idx;
  if (status === 'NONE') return -1;
  return PROCESS_STEP_KEYS.length - 1;
}

interface ProcessStepperProps {
  status: PipelineStatus;
  rejectReason?: string | null;
}

export function ProcessStepper({ status, rejectReason }: ProcessStepperProps) {
  const { t } = useTranslation();
  const { processStepLabels } = usePipelineLabels();
  const current = stepIndex(status);
  const isRejected = status === 'REJECTED';

  return (
    <div className='space-y-3'>
      {isRejected && rejectReason && (
        <div className='rounded-md border border-destructive/40 bg-destructive/5 px-4 py-2 text-sm text-destructive'>
          {t('pipeline.rejectedReason', { reason: rejectReason })}
        </div>
      )}

      <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
        {PROCESS_STEP_KEYS.map((key, index) => {
          const completed = !isRejected && current > index;
          const active = !isRejected && current === index;
          const locked = !completed && !active && index > current;

          const circle = (
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors',
                completed && 'border-primary bg-primary text-primary-foreground',
                active && 'border-primary bg-primary/10 text-primary ring-2 ring-primary/30',
                locked && 'border-muted-foreground/30 bg-muted text-muted-foreground',
                !completed && !active && !locked && 'border-border bg-background text-muted-foreground',
              )}
              aria-current={active ? 'step' : undefined}
            >
              {completed ? <Check className='h-4 w-4' /> : locked ? <Lock className='h-3.5 w-3.5' /> : index + 1}
            </div>
          );

          return (
            <div key={key} className='flex flex-1 flex-col items-center gap-1.5 text-center min-w-[72px]'>
              {locked ? (
                <Tooltip>
                  <TooltipTrigger asChild>{circle}</TooltipTrigger>
                  <TooltipContent>{t('pipeline.unlockTooltip')}</TooltipContent>
                </Tooltip>
              ) : (
                circle
              )}
              <span
                className={cn(
                  'text-[11px] font-medium leading-tight',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {processStepLabels[key]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
