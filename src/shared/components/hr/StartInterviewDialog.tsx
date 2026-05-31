import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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
import { interviewProcessService } from '@/shared/lib/api-services';
import { ScoreBadge } from '@/shared/components/StatusBadges';
import type { CVMatch } from '@/shared/types/api';
import { Loader2 } from 'lucide-react';

interface StartInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: CVMatch;
  onSuccess?: () => void;
}

export function StartInterviewDialog({ open, onOpenChange, match, onSuccess }: StartInterviewDialogProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => interviewProcessService.create({ matchId: match.id }),
    onSuccess: (process) => {
      toast.success(t('dialogs.startInterview.success'));
      void queryClient.invalidateQueries({ queryKey: ['matches'] });
      void queryClient.invalidateQueries({ queryKey: ['interview-processes'] });
      onOpenChange(false);
      onSuccess?.();
      navigate(`/hr/interview-processes/${process.id}`);
    },
    onError: (error: Error & { errorCode?: string }) => {
      if (error.errorCode === 'PROCESS_ALREADY_EXISTS') {
        toast.error(t('dialogs.startInterview.alreadyExists'));
      } else {
        toast.error(error.message || t('dialogs.startInterview.failed'));
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('dialogs.startInterview.title')}</DialogTitle>
          <DialogDescription>{t('dialogs.startInterview.description')}</DialogDescription>
        </DialogHeader>

        <div className='space-y-3 rounded-lg border bg-muted/30 p-3 text-sm'>
          <div className='flex justify-between gap-2'>
            <span className='text-muted-foreground'>{t('dialogs.startInterview.candidate')}</span>
            <span className='text-right font-medium'>
              {match.candidateName ?? `Candidate #${match.candidateId}`}
            </span>
          </div>
          <div className='flex justify-between gap-2'>
            <span className='text-muted-foreground'>{t('dialogs.startInterview.job')}</span>
            <span className='text-right font-medium'>{match.jobTitle ?? `Job #${match.jobId}`}</span>
          </div>
          <div className='flex items-center justify-between gap-2'>
            <span className='text-muted-foreground'>{t('dialogs.startInterview.matchScore')}</span>
            <ScoreBadge score={match.score} />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {t('dialogs.startInterview.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
