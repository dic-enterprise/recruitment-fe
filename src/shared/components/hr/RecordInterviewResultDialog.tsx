import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';
import { interviewScheduleService } from '@/shared/lib/api-services';
import { invalidateAfterInterviewResult } from '@/shared/lib/phase3-invalidate';
import { useStatusLabels } from '@/shared/i18n/hooks';
import type { InterviewOutcome, InterviewProcess, InterviewSchedule } from '@/shared/types/api';
import { Loader2 } from 'lucide-react';

const OUTCOMES: InterviewOutcome[] = ['PASSED', 'FAILED', 'NO_SHOW', 'WITHDRAWN'];

interface RecordInterviewResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  process: InterviewProcess;
  schedule: InterviewSchedule;
  onSuccess?: () => void;
}

export function RecordInterviewResultDialog({
  open,
  onOpenChange,
  process,
  schedule,
  onSuccess,
}: RecordInterviewResultDialogProps) {
  const { t } = useTranslation();
  const { interviewOutcome } = useStatusLabels();
  const queryClient = useQueryClient();
  const [outcome, setOutcome] = useState<InterviewOutcome>('PASSED');
  const [feedback, setFeedback] = useState('');
  const [recordedBy, setRecordedBy] = useState(process.assignedHr ?? '');

  const mutation = useMutation({
    mutationFn: () =>
      interviewScheduleService.recordResult(process.id, {
        scheduleId: schedule.id,
        outcome,
        feedback: feedback.trim() || undefined,
        recordedBy: recordedBy.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success(t('dialogs.recordResult.success'));
      invalidateAfterInterviewResult(queryClient, process.id);
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: Error & { errorCode?: string }) => {
      if (error.errorCode === 'RESULT_ALREADY_RECORDED') {
        toast.error(t('dialogs.recordResult.alreadyRecorded'));
      } else {
        toast.error(error.message || t('dialogs.recordResult.failed'));
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('dialogs.recordResult.title')}</DialogTitle>
          <DialogDescription>
            {process.candidateName} · {process.jobTitle}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-3'>
          <div className='space-y-1.5'>
            <Label>{t('dialogs.recordResult.outcome')}</Label>
            <Select value={outcome} onValueChange={(v) => setOutcome(v as InterviewOutcome)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OUTCOMES.map((o) => (
                  <SelectItem key={o} value={o}>
                    {interviewOutcome(o)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-1.5'>
            <Label>{t('dialogs.recordResult.comment')}</Label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              placeholder={t('dialogs.recordResult.commentPlaceholder')}
              maxLength={5000}
            />
          </div>
          <div className='space-y-1.5'>
            <Label>{t('dialogs.recordResult.recordedBy')}</Label>
            <Input value={recordedBy} onChange={(e) => setRecordedBy(e.target.value)} maxLength={100} />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {t('dialogs.recordResult.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
