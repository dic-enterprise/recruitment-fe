import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { interviewProcessService } from '@/shared/lib/api-services';
import { invalidateAfterOnboardMutation } from '@/shared/lib/phase4-invalidate';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { formatDate, formatDateTime } from '@/shared/lib/utils';
import type { InterviewProcess } from '@/shared/types/api';
import { CalendarCheck, Loader2 } from 'lucide-react';

interface OnboardFormPanelProps {
  process: InterviewProcess;
  readOnly?: boolean;
}

export function OnboardFormPanel({ process, readOnly }: OnboardFormPanelProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const processId = process.id;

  const canUseOnboard = process.status === 'OFFER' || process.status === 'ONBOARDED';

  const { data: plan, isLoading } = useQuery({
    queryKey: ['interview-process', String(processId), 'onboard'],
    queryFn: () => interviewProcessService.getOnboard(processId),
    enabled: canUseOnboard,
    initialData: null,
  });

  const [onboardDate, setOnboardDate] = useState('');
  const [welcomeContactName, setWelcomeContactName] = useState('');
  const [welcomeContactEmail, setWelcomeContactEmail] = useState('');
  const [welcomeContactPhone, setWelcomeContactPhone] = useState('');
  const [arrangementNotes, setArrangementNotes] = useState('');

  useEffect(() => {
    if (plan) {
      setOnboardDate(plan.onboardDate ?? '');
      setWelcomeContactName(plan.welcomeContactName ?? '');
      setWelcomeContactEmail(plan.welcomeContactEmail ?? '');
      setWelcomeContactPhone(plan.welcomeContactPhone ?? '');
      setArrangementNotes(plan.arrangementNotes ?? '');
    }
  }, [plan]);

  const savePlan = useMutation({
    mutationFn: () =>
      interviewProcessService.upsertOnboard(processId, {
        onboardDate,
        welcomeContactName: welcomeContactName.trim(),
        welcomeContactEmail: welcomeContactEmail.trim() || undefined,
        welcomeContactPhone: welcomeContactPhone.trim() || undefined,
        arrangementNotes: arrangementNotes.trim() || undefined,
        confirmedBy: process.assignedHr ?? undefined,
      }),
    onSuccess: () => {
      toast.success(t('dialogs.onboard.planSaved'));
      invalidateAfterOnboardMutation(queryClient, processId);
    },
    onError: (e: Error) => toast.error(e.message || t('dialogs.onboard.saveFailed')),
  });

  const confirmOnboard = useMutation({
    mutationFn: () => interviewProcessService.confirmOnboard(processId),
    onSuccess: () => {
      toast.success(t('dialogs.onboard.confirmed'));
      invalidateAfterOnboardMutation(queryClient, processId);
    },
    onError: (e: Error) => toast.error(e.message || t('dialogs.onboard.confirmFailed')),
  });

  if (!canUseOnboard) {
    return (
      <p className='text-sm text-muted-foreground italic'>{t('dialogs.onboard.notReady')}</p>
    );
  }

  if (isLoading) {
    return (
      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
        <Loader2 className='h-4 w-4 animate-spin' />
        {t('dialogs.onboard.loading')}
      </div>
    );
  }

  const formDisabled = readOnly || process.status === 'ONBOARDED';
  const canConfirm =
    !formDisabled &&
    onboardDate.trim() &&
    welcomeContactName.trim() &&
    !confirmOnboard.isPending;

  return (
    <div className='space-y-4'>
      {!plan && (
        <p className='text-sm text-muted-foreground italic'>{t('dialogs.onboard.empty')}</p>
      )}

      {process.status === 'ONBOARDED' && plan?.confirmedAt && (
        <div className='rounded-md border border-emerald-200 bg-emerald-50/50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300'>
          {t('dialogs.onboard.onboardConfirmedBanner')} {formatDateTime(plan.confirmedAt)}
        </div>
      )}

      <div className='grid gap-3 sm:grid-cols-2'>
        <div className='space-y-1.5'>
          <Label>{t('dialogs.onboard.startDate')}</Label>
          <Input
            type='date'
            value={onboardDate}
            onChange={(e) => setOnboardDate(e.target.value)}
            disabled={formDisabled}
          />
        </div>
        <div className='space-y-1.5'>
          <Label>{t('dialogs.onboard.welcomeContact')}</Label>
          <Input
            value={welcomeContactName}
            onChange={(e) => setWelcomeContactName(e.target.value)}
            disabled={formDisabled}
            placeholder={t('dialogs.onboard.welcomeContactPlaceholder')}
          />
        </div>
        <div className='space-y-1.5'>
          <Label>{t('dialogs.onboard.welcomeEmail')}</Label>
          <Input
            type='email'
            value={welcomeContactEmail}
            onChange={(e) => setWelcomeContactEmail(e.target.value)}
            disabled={formDisabled}
          />
        </div>
        <div className='space-y-1.5'>
          <Label>{t('dialogs.onboard.welcomePhone')}</Label>
          <Input
            value={welcomeContactPhone}
            onChange={(e) => setWelcomeContactPhone(e.target.value)}
            disabled={formDisabled}
          />
        </div>
        <div className='space-y-1.5 sm:col-span-2'>
          <Label>{t('dialogs.onboard.arrangementNotes')}</Label>
          <Textarea
            value={arrangementNotes}
            onChange={(e) => setArrangementNotes(e.target.value)}
            disabled={formDisabled}
            rows={3}
            placeholder={t('dialogs.onboard.arrangementPlaceholder')}
          />
        </div>
      </div>

      {!formDisabled && (
        <div className='flex flex-wrap gap-2'>
          <Button
            variant='secondary'
            size='sm'
            disabled={!onboardDate || !welcomeContactName.trim() || savePlan.isPending}
            onClick={() => savePlan.mutate()}
          >
            {savePlan.isPending && <Loader2 className='mr-2 h-3.5 w-3.5 animate-spin' />}
            {t('dialogs.onboard.savePlan')}
          </Button>
          <Button size='sm' disabled={!canConfirm} onClick={() => confirmOnboard.mutate()}>
            {confirmOnboard.isPending ? (
              <Loader2 className='mr-2 h-3.5 w-3.5 animate-spin' />
            ) : (
              <CalendarCheck className='mr-2 h-3.5 w-3.5' />
            )}
            {t('dialogs.onboard.confirm')}
          </Button>
        </div>
      )}

      {plan?.onboardDate && process.status === 'ONBOARDED' && (
        <p className='text-sm text-muted-foreground'>
          {t('dialogs.onboard.workStartDate')} <strong>{formatDate(plan.onboardDate)}</strong>
        </p>
      )}
    </div>
  );
}
