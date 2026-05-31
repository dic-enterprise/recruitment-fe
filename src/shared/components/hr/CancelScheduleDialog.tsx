import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Textarea } from '@/shared/components/ui/textarea';
import { interviewScheduleService } from '@/shared/lib/api-services';
import { invalidateAfterScheduleMutation } from '@/shared/lib/phase3-invalidate';
import type { InterviewSchedule } from '@/shared/types/api';
import { Loader2 } from 'lucide-react';

interface CancelScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: InterviewSchedule;
  onSuccess?: () => void;
}

export function CancelScheduleDialog({
  open,
  onOpenChange,
  schedule,
  onSuccess,
}: CancelScheduleDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');

  const mutation = useMutation({
    mutationFn: () => interviewScheduleService.cancel(schedule.id, { reason: reason.trim() }),
    onSuccess: () => {
      toast.success(t('dialogs.cancelSchedule.success'));
      invalidateAfterScheduleMutation(queryClient, schedule.processId);
      onOpenChange(false);
      setReason('');
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || t('dialogs.cancelSchedule.failed'));
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('dialogs.cancelSchedule.title')}</DialogTitle>
        </DialogHeader>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t('dialogs.cancelSchedule.reasonPlaceholder')}
          rows={4}
        />
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t('common.close')}
          </Button>
          <Button
            variant='destructive'
            disabled={!reason.trim() || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {t('dialogs.cancelSchedule.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
