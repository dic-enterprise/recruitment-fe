import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { interviewProcessService } from '@/shared/lib/api-services';
import { invalidateAfterOfferMutation } from '@/shared/lib/phase4-invalidate';
import { OfferStatusBadge } from '@/shared/components/hr/OfferStatusBadge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { formatDateTime } from '@/shared/lib/utils';
import type { InterviewProcess, OfferPayload } from '@/shared/types/api';
import { Loader2, Send } from 'lucide-react';

interface OfferFormPanelProps {
  process: InterviewProcess;
  readOnly?: boolean;
}

function fieldsFromPayload(payload?: OfferPayload) {
  const f = payload?.fields ?? {};
  return {
    salary: String(f.salary ?? ''),
    benefits: String(f.benefits ?? ''),
    proposedStartDate: String(f.proposedStartDate ?? ''),
    candidateMessage: String(f.candidateMessage ?? ''),
    internalNotes: String(f.internalNotes ?? ''),
  };
}

function buildPayload(fields: ReturnType<typeof fieldsFromPayload>): OfferPayload {
  return {
    version: 1,
    fields: {
      salary: fields.salary.trim() || null,
      benefits: fields.benefits.trim() || null,
      proposedStartDate: fields.proposedStartDate.trim() || null,
      candidateMessage: fields.candidateMessage.trim() || null,
      internalNotes: fields.internalNotes.trim() || null,
    },
  };
}

export function OfferFormPanel({ process, readOnly }: OfferFormPanelProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const processId = process.id;

  const canUseOffer =
    process.status === 'INTERVIEW_DONE' || process.status === 'OFFER';

  const { data: offer, isLoading } = useQuery({
    queryKey: ['interview-process', String(processId), 'offer'],
    queryFn: () => interviewProcessService.getOffer(processId),
    enabled: canUseOffer,
    initialData: null,
  });

  const [salary, setSalary] = useState('');
  const [benefits, setBenefits] = useState('');
  const [proposedStartDate, setProposedStartDate] = useState('');
  const [candidateMessage, setCandidateMessage] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [responseStatus, setResponseStatus] = useState<'ACCEPTED' | 'DECLINED'>('ACCEPTED');
  const [responseNote, setResponseNote] = useState('');

  useEffect(() => {
    if (offer) {
      const f = fieldsFromPayload(offer.payload);
      setSalary(f.salary);
      setBenefits(f.benefits);
      setProposedStartDate(f.proposedStartDate);
      setCandidateMessage(f.candidateMessage);
      setInternalNotes(f.internalNotes);
    }
  }, [offer]);

  const saveDraft = useMutation({
    mutationFn: () =>
      interviewProcessService.upsertOffer(processId, {
        payload: buildPayload({ salary, benefits, proposedStartDate, candidateMessage, internalNotes }),
        createdBy: process.assignedHr ?? undefined,
      }),
    onSuccess: () => {
      toast.success(t('dialogs.offer.draftSaved'));
      invalidateAfterOfferMutation(queryClient, processId);
    },
    onError: (e: Error) => toast.error(e.message || t('dialogs.offer.saveFailed')),
  });

  const sendOffer = useMutation({
    mutationFn: async () => {
      await interviewProcessService.upsertOffer(processId, {
        payload: buildPayload({ salary, benefits, proposedStartDate, candidateMessage, internalNotes }),
        createdBy: process.assignedHr ?? undefined,
      });
      return interviewProcessService.sendOffer(processId);
    },
    onSuccess: () => {
      toast.success(t('dialogs.offer.sent'));
      invalidateAfterOfferMutation(queryClient, processId);
    },
    onError: (e: Error & { errorCode?: string }) => {
      if (e.errorCode === 'MISSING_CANDIDATE_EMAIL') {
        toast.error(t('dialogs.offer.noEmail'));
      } else {
        toast.error(e.message || t('dialogs.offer.sendFailed'));
      }
    },
  });

  const updateStatus = useMutation({
    mutationFn: () =>
      interviewProcessService.updateOfferStatus(processId, {
        status: responseStatus,
        note: responseNote.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success(t('dialogs.offer.responseUpdated'));
      invalidateAfterOfferMutation(queryClient, processId);
    },
    onError: (e: Error) => toast.error(e.message || t('dialogs.offer.updateFailed')),
  });

  if (!canUseOffer) {
    return (
      <p className='text-sm text-muted-foreground italic'>{t('dialogs.offer.notReady')}</p>
    );
  }

  if (isLoading) {
    return (
      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
        <Loader2 className='h-4 w-4 animate-spin' />
        {t('dialogs.offer.loading')}
      </div>
    );
  }

  const isDraftEditable = !readOnly && (!offer || offer.status === 'DRAFT');
  const canSend = !readOnly && (!offer || offer.status === 'DRAFT') && !sendOffer.isPending;
  const canRecordResponse = !readOnly && offer?.status === 'SENT';

  return (
    <div className='space-y-4'>
      {offer && (
        <div className='flex flex-wrap items-center gap-2 text-sm'>
          <OfferStatusBadge status={offer.status} />
          {offer.sentAt && (
            <span className='text-muted-foreground'>
              {t('dialogs.offer.sentAt')} {formatDateTime(offer.sentAt)}
              {offer.sentToEmail ? ` → ${offer.sentToEmail}` : ''}
            </span>
          )}
        </div>
      )}

      {!offer && (
        <p className='text-sm text-muted-foreground italic'>{t('dialogs.offer.empty')}</p>
      )}

      <div className='grid gap-3 sm:grid-cols-2'>
        <div className='space-y-1.5 sm:col-span-2'>
          <Label>{t('dialogs.offer.salary')}</Label>
          <Input
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            disabled={!isDraftEditable}
            placeholder={t('dialogs.offer.salaryPlaceholder')}
          />
        </div>
        <div className='space-y-1.5 sm:col-span-2'>
          <Label>{t('dialogs.offer.benefits')}</Label>
          <Textarea
            value={benefits}
            onChange={(e) => setBenefits(e.target.value)}
            disabled={!isDraftEditable}
            rows={2}
            placeholder={t('dialogs.offer.benefitsPlaceholder')}
          />
        </div>
        <div className='space-y-1.5'>
          <Label>{t('dialogs.offer.proposedStartDateOptional')}</Label>
          <Input
            type='date'
            value={proposedStartDate}
            onChange={(e) => setProposedStartDate(e.target.value)}
            disabled={!isDraftEditable}
          />
        </div>
        <div className='space-y-1.5 sm:col-span-2'>
          <Label>{t('dialogs.offer.candidateMessage')}</Label>
          <Textarea
            value={candidateMessage}
            onChange={(e) => setCandidateMessage(e.target.value)}
            disabled={!isDraftEditable}
            rows={4}
            placeholder={t('dialogs.offer.candidateMessagePlaceholder')}
          />
        </div>
        <div className='space-y-1.5 sm:col-span-2'>
          <Label>{t('dialogs.offer.internalNotes')}</Label>
          <Textarea
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            disabled={!isDraftEditable}
            rows={2}
          />
        </div>
      </div>

      {isDraftEditable && (
        <div className='flex flex-wrap gap-2'>
          <Button
            variant='secondary'
            size='sm'
            disabled={saveDraft.isPending}
            onClick={() => saveDraft.mutate()}
          >
            {saveDraft.isPending && <Loader2 className='mr-2 h-3.5 w-3.5 animate-spin' />}
            {t('dialogs.offer.saveDraft')}
          </Button>
          <Button size='sm' disabled={!canSend || sendOffer.isPending} onClick={() => sendOffer.mutate()}>
            {sendOffer.isPending ? (
              <Loader2 className='mr-2 h-3.5 w-3.5 animate-spin' />
            ) : (
              <Send className='mr-2 h-3.5 w-3.5' />
            )}
            {t('dialogs.offer.sendOffer')}
          </Button>
        </div>
      )}

      {canRecordResponse && (
        <div className='rounded-md border bg-muted/20 p-3 space-y-3'>
          <p className='text-sm font-medium'>{t('dialogs.offer.responseSection')}</p>
          <Select value={responseStatus} onValueChange={(v) => setResponseStatus(v as 'ACCEPTED' | 'DECLINED')}>
            <SelectTrigger className='h-9 w-[200px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='ACCEPTED'>{t('dialogs.offer.accept')}</SelectItem>
              <SelectItem value='DECLINED'>{t('dialogs.offer.decline')}</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            value={responseNote}
            onChange={(e) => setResponseNote(e.target.value)}
            placeholder={t('dialogs.offer.responseNotePlaceholder')}
            rows={2}
          />
          <Button size='sm' variant='outline' disabled={updateStatus.isPending} onClick={() => updateStatus.mutate()}>
            {updateStatus.isPending && <Loader2 className='mr-2 h-3.5 w-3.5 animate-spin' />}
            {t('dialogs.offer.saveResponse')}
          </Button>
        </div>
      )}
    </div>
  );
}
