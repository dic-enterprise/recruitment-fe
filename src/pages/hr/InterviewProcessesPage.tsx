import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { interviewProcessService, jobService } from '@/shared/lib/api-services';
import { PipelineStatusBadge } from '@/shared/components/hr/PipelineStatusBadge';
import { ContactStatusBadge } from '@/shared/components/hr/ContactStatusBadge';
import { ScoreBadge } from '@/shared/components/StatusBadges';
import PageHeader from '@/shared/components/PageHeader';
import { BaseTable, type Column } from '@/shared/components/BaseTable';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button';
import { formatDate } from '@/shared/lib/utils';
import { usePipelineLabels } from '@/shared/i18n/hooks';
import type { ContactStatus, InterviewProcess, PipelineStatus } from '@/shared/types/api';
import { Search, User, Briefcase, Eye } from 'lucide-react';

export default function InterviewProcessesPage() {
  const { t } = useTranslation();
  const { pipelineStatusLabels, contactStatusLabels } = usePipelineLabels();
  const [jobFilter, setJobFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [contactFilter, setContactFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const { data: jobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobService.getAll(),
  });

  const listParams = useMemo(
    () => ({
      jobId: jobFilter === 'ALL' ? undefined : Number(jobFilter),
      status: statusFilter === 'ALL' ? undefined : (statusFilter as PipelineStatus),
      contactStatus: contactFilter === 'ALL' ? undefined : (contactFilter as ContactStatus),
      search: search.trim() || undefined,
      page: 0,
      size: 50,
    }),
    [jobFilter, statusFilter, contactFilter, search],
  );

  const { data, isLoading } = useQuery({
    queryKey: ['interview-processes', listParams],
    queryFn: () => interviewProcessService.getAll(listParams),
  });

  const items = data?.items ?? [];

  const columns: Column<InterviewProcess>[] = [
    {
      header: t('interviewProcesses.candidate'),
      key: 'candidateName',
      width: '200px',
      render: (p) => (
        <div className='flex items-center gap-2'>
          <User className='h-3.5 w-3.5 text-muted-foreground' />
          <span className='font-medium'>{p.candidateName}</span>
        </div>
      ),
    },
    {
      header: t('interviewProcesses.job'),
      key: 'jobTitle',
      width: '220px',
      render: (p) => (
        <div className='flex items-center gap-2'>
          <Briefcase className='h-3.5 w-3.5 shrink-0 text-muted-foreground' />
          <span className='truncate font-medium'>{p.jobTitle}</span>
        </div>
      ),
    },
    {
      header: t('interviewProcesses.score'),
      key: 'matchScore',
      className: 'text-center',
      headerClassName: 'text-center',
      width: '90px',
      render: (p) => (
        <div className='flex justify-center'>
          <ScoreBadge score={p.matchScore} />
        </div>
      ),
    },
    {
      header: t('interviewProcesses.status'),
      key: 'status',
      width: '130px',
      render: (p) => <PipelineStatusBadge status={p.status} size='sm' />,
    },
    {
      header: t('interviewProcesses.contact'),
      key: 'contactStatus',
      width: '130px',
      render: (p) => <ContactStatusBadge status={p.contactStatus} />,
    },
    {
      header: t('interviewProcesses.updated'),
      key: 'updatedAt',
      width: '120px',
      className: 'text-muted-foreground text-sm',
      render: (p) => formatDate(p.updatedAt),
    },
    {
      header: t('common.action'),
      key: 'action',
      width: '72px',
      className: 'text-center',
      headerClassName: 'text-center',
      render: (p) => (
        <Button variant='ghost' size='icon' className='h-8 w-8' asChild title={t('common.viewDetail')}>
          <Link to={`/hr/interview-processes/${p.id}`}>
            <Eye className='h-4 w-4' />
            <span className='sr-only'>{t('common.viewDetail')}</span>
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <div className='flex h-full min-h-0 flex-col'>
      <PageHeader
        title={t('interviewProcesses.title')}
        description={t('interviewProcesses.description')}
      />

      <div className='mb-4 flex shrink-0 flex-wrap items-center gap-3'>
        <Select value={jobFilter} onValueChange={setJobFilter}>
          <SelectTrigger className='h-9 w-[200px]'>
            <SelectValue placeholder={t('interviewProcesses.filterJob')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='ALL'>{t('interviewProcesses.allJobs')}</SelectItem>
            {jobs?.map((job) => (
              <SelectItem key={job.id} value={String(job.id)}>
                {job.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='h-9 w-[160px]'>
            <SelectValue placeholder={t('interviewProcesses.filterStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='ALL'>{t('interviewProcesses.allStatuses')}</SelectItem>
            {(['SHORTLISTED', 'CONTACTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_DONE', 'OFFER', 'ONBOARDED', 'REJECTED'] as PipelineStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {pipelineStatusLabels[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={contactFilter} onValueChange={setContactFilter}>
          <SelectTrigger className='h-9 w-[160px]'>
            <SelectValue placeholder={t('interviewProcesses.filterContact')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='ALL'>{t('interviewProcesses.allContacts')}</SelectItem>
            {(Object.keys(contactStatusLabels) as ContactStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {contactStatusLabels[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className='relative min-w-[200px] flex-1 max-w-xs'>
          <Search className='absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            className='h-9 pl-8'
            placeholder={t('interviewProcesses.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <span className='ml-auto text-xs text-muted-foreground'>
          {t('interviewProcesses.totalCount', { count: data?.total ?? 0 })}
        </span>
      </div>

      <div className='flex-1 min-h-0 overflow-hidden rounded-xl border bg-card shadow-sm'>
        <BaseTable
          data={items}
          columns={columns}
          isLoading={isLoading}
          emptyMessage={
            <div className='flex flex-col items-center gap-3 py-8'>
              <p>{t('interviewProcesses.empty')}</p>
              <Button variant='outline' size='sm' asChild>
                <Link to='/hr/matches'>{t('interviewProcesses.goToMatching')}</Link>
              </Button>
            </div>
          }
          showIndex
          className='h-full border-0'
        />
      </div>
    </div>
  );
}
