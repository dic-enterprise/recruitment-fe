import { ArrowRight, Phone, Gift, CalendarCheck } from 'lucide-react';
import { PipelineStatusBadge } from '@/shared/components/hr/PipelineStatusBadge';
import { usePipelineLabels } from '@/shared/i18n/hooks';
import type { InterviewProcess } from '@/shared/types/api';
import { useTranslation } from 'react-i18next';

interface ProcessNextStepBannerProps {
  process: InterviewProcess;
}

export function ProcessNextStepBanner({ process }: ProcessNextStepBannerProps) {
  const { t } = useTranslation();
  const { pipelineStatusLabels } = usePipelineLabels();

  if (process.status === 'REJECTED' || process.status === 'ONBOARDED') return null;

  let title: string;
  let description: string;
  let action: React.ReactNode = null;
  let Icon = Phone;

  if (process.status === 'SHORTLISTED' && process.contactStatus !== 'CONTACTED') {
    title = t('process.bannerShortlistTitle');
    description = t('process.bannerShortlistDesc');
    action = (
      <a href='#section-contact' className='inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline'>
        {t('process.goToContactForm')}
        <ArrowRight className='h-3.5 w-3.5' />
      </a>
    );
  } else if (process.status === 'CONTACTED') {
    title = t('process.bannerContactTitle');
    description = t('process.bannerContactDesc');
    action = (
      <a href='#section-schedule' className='inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline'>
        {t('process.goToScheduleSection')}
        <ArrowRight className='h-3.5 w-3.5' />
      </a>
    );
  } else if (process.status === 'INTERVIEW_SCHEDULED') {
    title = t('process.bannerScheduledTitle');
    description = t('process.bannerScheduledDesc');
  } else if (process.status === 'INTERVIEW_DONE') {
    Icon = Gift;
    title = t('process.bannerDoneTitle');
    description = t('process.bannerDoneDesc');
    action = (
      <a href='#section-offer' className='inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline'>
        {t('process.goToOfferSection')}
        <ArrowRight className='h-3.5 w-3.5' />
      </a>
    );
  } else if (process.status === 'OFFER') {
    Icon = CalendarCheck;
    title = t('process.bannerOfferTitle');
    description = t('process.bannerOfferDesc');
    action = (
      <a href='#section-onboard' className='inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline'>
        {t('process.goToOnboardSection')}
        <ArrowRight className='h-3.5 w-3.5' />
      </a>
    );
  } else {
    return null;
  }

  return (
    <div className='flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-start sm:justify-between'>
      <div className='space-y-1.5'>
        <div className='flex flex-wrap items-center gap-2'>
          <Icon className='h-4 w-4 text-primary' />
          <span className='text-sm font-semibold'>{title}</span>
          <PipelineStatusBadge status={process.status} size='sm' />
        </div>
        <p className='text-sm text-muted-foreground'>{description}</p>
        <p className='text-xs text-muted-foreground'>
          {t('process.currentStatus')}{' '}
          <strong>{pipelineStatusLabels[process.status]}</strong>
        </p>
      </div>
      {action}
    </div>
  );
}
