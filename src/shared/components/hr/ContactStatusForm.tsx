import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { interviewProcessService } from '@/shared/lib/api-services';
import { formatDateTime } from '@/shared/lib/utils';
import { usePipelineLabels } from '@/shared/i18n/hooks';
import type { ContactStatus, InterviewProcess } from '@/shared/types/api';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ContactStatusFormProps {
  process: InterviewProcess;
  readOnly?: boolean;
}

export function ContactStatusForm({ process, readOnly }: ContactStatusFormProps) {
  const { t } = useTranslation();
  const { contactStatusLabels } = usePipelineLabels();
  const queryClient = useQueryClient();
  const [contactStatus, setContactStatus] = useState<ContactStatus>(process.contactStatus);
  const [contactNote, setContactNote] = useState(process.contactNote ?? '');

  useEffect(() => {
    setContactStatus(process.contactStatus);
    setContactNote(process.contactNote ?? '');
  }, [process.contactStatus, process.contactNote, process.id]);

  const disabled =
    readOnly || process.status === 'REJECTED' || process.status === 'ONBOARDED';

  const needsContact =
    process.status === 'SHORTLISTED' && process.contactStatus !== 'CONTACTED';

  const mutation = useMutation({
    mutationFn: (payload: { contactStatus: ContactStatus; contactNote?: string }) =>
      interviewProcessService.updateContact(String(process.id), payload),
    onSuccess: (_, variables) => {
      toast.success(
        variables.contactStatus === 'CONTACTED'
          ? t('process.contactMarked')
          : t('process.contactUpdated'),
      );
      void queryClient.invalidateQueries({ queryKey: ['interview-process', String(process.id)] });
      void queryClient.invalidateQueries({ queryKey: ['interview-processes'] });
      void queryClient.invalidateQueries({ queryKey: ['matches'] });
      void queryClient.invalidateQueries({
        queryKey: ['interview-processes', 'candidate', String(process.candidateId)],
      });
    },
  });

  const submit = (status: ContactStatus) => {
    mutation.mutate({
      contactStatus: status,
      contactNote: contactNote.trim() || undefined,
    });
  };

  return (
    <div className='space-y-4'>
      {needsContact && !disabled && (
        <div className='rounded-md border border-amber-200 bg-amber-50/80 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200'>
          {t('process.contactShortlistHint')}
        </div>
      )}

      <div className='space-y-1.5'>
        <Label>{t('process.contactStatus')}</Label>
        <Select
          value={contactStatus}
          onValueChange={(v) => setContactStatus(v as ContactStatus)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(contactStatusLabels) as ContactStatus[]).map((key) => (
              <SelectItem key={key} value={key}>
                {contactStatusLabels[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className='text-xs text-muted-foreground'>{t('process.contactStatusHint')}</p>
      </div>

      <div className='space-y-1.5'>
        <Label htmlFor='contactNote'>{t('process.contactNotes')}</Label>
        <Textarea
          id='contactNote'
          value={contactNote}
          onChange={(e) => setContactNote(e.target.value)}
          placeholder={t('process.contactNotesPlaceholder')}
          rows={4}
          disabled={disabled}
          maxLength={2000}
        />
      </div>

      {process.contactedAt && (
        <p className='text-xs text-muted-foreground'>
          {t('process.contactedAt')}{' '}
          <span className='font-mono'>{formatDateTime(process.contactedAt)}</span>
        </p>
      )}

      {!disabled && (
        <div className='flex flex-wrap gap-2'>
          {needsContact && (
            <Button
              onClick={() => {
                setContactStatus('CONTACTED');
                submit('CONTACTED');
              }}
              disabled={mutation.isPending}
            >
              {mutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {t('process.confirmContacted')}
            </Button>
          )}
          <Button
            variant={needsContact ? 'outline' : 'default'}
            onClick={() => submit(contactStatus)}
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {t('process.saveContact')}
          </Button>
        </div>
      )}
    </div>
  );
}
