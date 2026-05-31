import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { interviewProcessService } from '@/shared/lib/api-services';
import { ProcessStepper } from '@/shared/components/hr/ProcessStepper';
import { ContactStatusForm } from '@/shared/components/hr/ContactStatusForm';
import { ProcessTimeline } from '@/shared/components/hr/ProcessTimeline';
import { ProcessScheduleSection } from '@/shared/components/hr/ProcessScheduleSection';
import { ProcessNextStepBanner } from '@/shared/components/hr/ProcessNextStepBanner';
import { OfferFormPanel } from '@/shared/components/hr/OfferFormPanel';
import { OnboardFormPanel } from '@/shared/components/hr/OnboardFormPanel';
import { ProcessDetailSections } from '@/shared/components/hr/ProcessDetailSections';
import { PipelineStatusBadge } from '@/shared/components/hr/PipelineStatusBadge';
import { ScoreBadge } from '@/shared/components/StatusBadges';
import {
  getActiveProcessSection,
  sectionDomId,
  type ProcessDetailSectionId,
} from '@/shared/lib/process-detail-sections';
import PageHeader from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { ArrowLeft, ExternalLink, Loader2, User, Briefcase } from 'lucide-react';

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className='rounded-lg border border-border bg-card'>
      <div className='border-b border-border/60 px-4 py-3'>
        <h3 className='text-xs font-medium uppercase tracking-widest text-muted-foreground'>{title}</h3>
      </div>
      <div className='p-4'>{children}</div>
    </div>
  );
}

export default function InterviewProcessDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [assignedHr, setAssignedHr] = useState('');
  const [notes, setNotes] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [openSections, setOpenSections] = useState<ProcessDetailSectionId[]>(['timeline']);

  const { data, isLoading } = useQuery({
    queryKey: ['interview-process', id],
    queryFn: () => interviewProcessService.getById(id!),
    enabled: !!id,
  });

  const process = data?.process;
  const activities = data?.activities ?? [];

  useEffect(() => {
    if (process) {
      setAssignedHr(process.assignedHr ?? '');
      setNotes(process.notes ?? '');
    }
  }, [process]);

  const activeSection = useMemo(
    () => (process ? getActiveProcessSection(process) : ''),
    [process],
  );

  useEffect(() => {
    if (!process?.id) return;
    setOpenSections(['timeline']);
  }, [process?.id]);

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.slice(1);
      if (!hash.startsWith('section-')) return;
      const section = hash.replace('section-', '') as ProcessDetailSectionId;
      setOpenSections((prev) => (prev.includes(section) ? prev : [...prev, section]));
      window.setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  useEffect(() => {
    if (!process || !activeSection) return;
    setOpenSections((prev) => (prev.includes(activeSection) ? prev : [...prev, activeSection]));
    const timer = window.setTimeout(() => {
      document.getElementById(sectionDomId(activeSection))?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [process?.id, process?.status, process?.contactStatus, activeSection]);

  const updateMeta = useMutation({
    mutationFn: () =>
      interviewProcessService.update(id!, {
        assignedHr: assignedHr.trim() || undefined,
        notes: notes.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success(t('interviewProcesses.savedInfo'));
      void queryClient.invalidateQueries({ queryKey: ['interview-process', id] });
      void queryClient.invalidateQueries({ queryKey: ['interview-processes'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => interviewProcessService.reject(id!, rejectReason.trim()),
    onSuccess: () => {
      toast.success(t('interviewProcesses.rejectedCandidate'));
      setRejectOpen(false);
      setRejectReason('');
      void queryClient.invalidateQueries({ queryKey: ['interview-process', id] });
      void queryClient.invalidateQueries({ queryKey: ['interview-processes'] });
      void queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (!process) {
    return (
      <div className='p-8 text-center'>
        <p className='text-sm text-muted-foreground'>{t('interviewProcesses.notFound')}</p>
        <Button variant='outline' className='mt-4' asChild>
          <Link to='/hr/interview-processes'>{t('interviewProcesses.backToList')}</Link>
        </Button>
      </div>
    );
  }

  const readOnly = process.status === 'REJECTED' || process.status === 'ONBOARDED';
  const canReject =
    process.status === 'SHORTLISTED' ||
    process.status === 'CONTACTED' ||
    process.status === 'INTERVIEW_SCHEDULED' ||
    process.status === 'INTERVIEW_DONE' ||
    process.status === 'OFFER';

  const accordionSections = [
    {
      id: 'info' as const,
      title: t('interviewProcesses.sectionInfo'),
      highlight: false,
      children: (
        <>
          <div className='space-y-3 text-sm'>
            <div className='flex items-start justify-between gap-2'>
              <span className='flex items-center gap-1.5 text-muted-foreground'>
                <User className='h-3.5 w-3.5' /> {t('interviewProcesses.candidate')}
              </span>
              <Link
                to={`/hr/candidates/${process.candidateId}`}
                className='inline-flex items-center gap-1 font-medium text-primary hover:underline'
              >
                {process.candidateName}
                <ExternalLink className='h-3 w-3' />
              </Link>
            </div>
            <div className='flex items-start justify-between gap-2'>
              <span className='flex items-center gap-1.5 text-muted-foreground'>
                <Briefcase className='h-3.5 w-3.5' /> {t('interviewProcesses.job')}
              </span>
              <span className='text-right font-medium'>{process.jobTitle}</span>
            </div>
            <div className='flex items-center justify-between gap-2'>
              <span className='text-muted-foreground'>{t('interviewProcesses.matchScore')}</span>
              <ScoreBadge score={process.matchScore} />
            </div>
          </div>
          <div className='mt-4 space-y-3 border-t border-border/60 pt-4'>
            <div className='space-y-1.5'>
              <Label htmlFor='detailAssignedHr'>{t('interviewProcesses.assignedHr')}</Label>
              <Input
                id='detailAssignedHr'
                value={assignedHr}
                onChange={(e) => setAssignedHr(e.target.value)}
                disabled={readOnly}
                maxLength={100}
              />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='detailNotes'>{t('interviewProcesses.notes')}</Label>
              <Textarea
                id='detailNotes'
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={readOnly}
                rows={3}
                maxLength={2000}
              />
            </div>
            {!readOnly && (
              <Button
                size='sm'
                variant='secondary'
                onClick={() => updateMeta.mutate()}
                disabled={updateMeta.isPending}
              >
                {updateMeta.isPending && <Loader2 className='mr-2 h-3.5 w-3.5 animate-spin' />}
                {t('interviewProcesses.saveInfo')}
              </Button>
            )}
          </div>
        </>
      ),
    },
    {
      id: 'contact' as const,
      title: t('interviewProcesses.sectionContact'),
      highlight: activeSection === 'contact',
      children: <ContactStatusForm process={process} readOnly={readOnly} />,
    },
    {
      id: 'schedule' as const,
      title: t('interviewProcesses.sectionSchedule'),
      highlight: activeSection === 'schedule',
      children: <ProcessScheduleSection process={process} readOnly={readOnly} />,
    },
    {
      id: 'offer' as const,
      title: t('interviewProcesses.sectionOffer'),
      highlight: activeSection === 'offer',
      children: <OfferFormPanel process={process} readOnly={readOnly} />,
    },
    {
      id: 'onboard' as const,
      title: t('interviewProcesses.sectionOnboard'),
      highlight: activeSection === 'onboard',
      children: <OnboardFormPanel process={process} readOnly={readOnly} />,
    },
    {
      id: 'timeline' as const,
      title: t('interviewProcesses.sectionTimeline'),
      highlight: activeSection === 'timeline',
      children: <ProcessTimeline activities={activities} />,
    },
  ];

  return (
    <div className='flex h-full flex-col'>
      <PageHeader
        title={t('interviewProcesses.detailTitle', { id: process.id })}
        description={
          <span className='flex flex-wrap items-center gap-2'>
            <span>
              {process.candidateName} · {process.jobTitle}
            </span>
            <PipelineStatusBadge status={process.status} size='sm' />
          </span>
        }
        actions={
          <div className='flex items-center gap-2'>
            {canReject && (
              <Button variant='destructive' size='sm' onClick={() => setRejectOpen(true)}>
                {t('interviewProcesses.reject')}
              </Button>
            )}
            <Button variant='outline' size='sm' asChild>
              <Link to='/hr/interview-processes'>
                <ArrowLeft className='mr-1.5 h-3.5 w-3.5' />
                {t('interviewProcesses.list')}
              </Link>
            </Button>
          </div>
        }
      />

      <div className='mx-auto w-full max-w-5xl space-y-4 pb-8'>
        <SectionCard title={t('interviewProcesses.progress')}>
          <ProcessStepper status={process.status} rejectReason={process.rejectReason} />
        </SectionCard>

        <ProcessNextStepBanner process={process} />

        <ProcessDetailSections
          openSections={openSections}
          onOpenSectionsChange={setOpenSections}
          sections={accordionSections}
        />
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('interviewProcesses.rejectDialogTitle')}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder={t('interviewProcesses.rejectReasonPlaceholder')}
            rows={4}
          />
          <DialogFooter>
            <Button variant='outline' onClick={() => setRejectOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant='destructive'
              disabled={!rejectReason.trim() || rejectMutation.isPending}
              onClick={() => rejectMutation.mutate()}
            >
              {rejectMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {t('common.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
