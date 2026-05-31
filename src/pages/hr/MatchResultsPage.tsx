import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { matchService, jobService } from '@/shared/lib/api-services';
import { ScoreBadge } from '@/shared/components/StatusBadges';
import { PipelineStatusBadge } from '@/shared/components/hr/PipelineStatusBadge';
import { StartInterviewDialog } from '@/shared/components/hr/StartInterviewDialog';
import { StartMatchingCvDialog } from '@/shared/components/hr/StartMatchingCvDialog';
import PageHeader from '@/shared/components/PageHeader';
import { BaseTable, type Column } from '@/shared/components/BaseTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { formatDate } from '@/shared/lib/utils';
import { canStartInterview, getMatchPipelineStatus } from '@/shared/lib/phase2-config';
import { User, Briefcase, Play } from 'lucide-react';
import type { CVMatch } from '@/shared/types/api';

export default function MatchResultsPage() {
  const { t } = useTranslation();
  const [jobFilter, setJobFilter] = useState<string>('ALL');
  const [startInterviewMatch, setStartInterviewMatch] = useState<CVMatch | null>(null);
  const [startMatchingOpen, setStartMatchingOpen] = useState(false);

  const { data: jobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobService.getAll(),
  });

  const { data: allMatches, isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: matchService.getAll,
  });

  const filteredMatches = useMemo(() => {
    const list = (allMatches || []).filter(
      (m) => jobFilter === 'ALL' || String(m.jobId) === jobFilter,
    );
    return [...list].sort((a, b) => b.score - a.score);
  }, [allMatches, jobFilter]);

  const columns: Column<CVMatch>[] = [
    {
      header: t('matches.jobPosting'),
      key: 'jobTitle',
      width: '220px',
      render: (m) => (
        <div className='flex items-center gap-2'>
          <Briefcase className='h-3.5 w-3.5 text-muted-foreground' />
          <Link to='/hr/jobs' className='font-medium hover:underline'>
            {m.jobTitle ?? `Job #${m.jobId}`}
          </Link>
        </div>
      ),
    },
    {
      header: t('matches.candidate'),
      key: 'candidateName',
      width: '180px',
      render: (m) => (
        <div className='flex items-center gap-2'>
          <User className='h-3.5 w-3.5 text-muted-foreground' />
          <span className='font-medium'>{m.candidateName ?? `Candidate #${m.candidateId}`}</span>
        </div>
      ),
    },
    {
      header: t('matches.matchScore'),
      key: 'score',
      className: 'text-center',
      headerClassName: 'text-center',
      width: '100px',
      render: (m) => (
        <div className='flex justify-center'>
          <ScoreBadge score={m.score} />
        </div>
      ),
    },
    {
      header: t('matches.pipeline'),
      key: 'pipelineStatus',
      width: '120px',
      render: (m) => <PipelineStatusBadge status={getMatchPipelineStatus(m)} size='sm' />,
    },
    {
      header: t('matches.reasoning'),
      key: 'details',
      render: (m) => {
        const d = m.details;
        if (!d) {
          return <span className='text-xs text-muted-foreground'>{t('common.dash')}</span>;
        }
        return (
          <div className='flex gap-2 text-[10px]'>
            <span className='rounded bg-blue-50 px-1.5 py-0.5 text-blue-600 dark:bg-blue-900/20'>
              {t('matches.skills')}: {d.skillMatch}%
            </span>
            <span className='rounded bg-purple-50 px-1.5 py-0.5 text-purple-600 dark:bg-purple-900/20'>
              {t('matches.exp')}: {d.experienceMatch}%
            </span>
          </div>
        );
      },
    },
    {
      header: t('matches.matchedDate'),
      key: 'createdAt',
      width: '120px',
      className: 'text-muted-foreground text-sm',
      render: (m) => formatDate(m.createdAt),
    },
    {
      header: t('common.action'),
      key: 'action',
      width: '130px',
      render: (m) => {
        const canStart = canStartInterview(m);
        const btn = (
          <Button
            size='sm'
            variant='secondary'
            className='h-8 text-xs'
            disabled={!canStart}
            onClick={(e) => {
              e.stopPropagation();
              setStartInterviewMatch(m);
            }}
          >
            {t('matches.startInterview')}
          </Button>
        );

        if (canStart) return btn;

        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>{btn}</span>
            </TooltipTrigger>
            <TooltipContent>
              {m.processId ? (
                <Link to={`/hr/interview-processes/${m.processId}`} className='underline'>
                  {t('matches.hasProcess')}
                </Link>
              ) : (
                t('matches.hasProcessTitle')
              )}
            </TooltipContent>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <div className='flex h-full min-h-0 flex-col'>
      <PageHeader
        title={t('matches.title')}
        description={t('matches.description')}
        actions={
          <Button onClick={() => setStartMatchingOpen(true)} className='h-8'>
            <Play className='mr-2 h-4 w-4' />
            {t('matches.startMatching')}
          </Button>
        }
      />

      <div className='mb-4 flex shrink-0 items-center gap-4'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium text-muted-foreground'>{t('matches.filterByJob')}</span>
          <Select value={jobFilter} onValueChange={setJobFilter}>
            <SelectTrigger className='h-9 w-[280px]'>
              <SelectValue placeholder={t('matches.selectJob')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='ALL'>{t('matches.allJobPostings')}</SelectItem>
              {jobs?.map((job) => (
                <SelectItem key={job.id} value={String(job.id)}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='ml-auto text-xs text-muted-foreground'>
          {t('matches.foundResults', { count: filteredMatches.length })}
        </div>
      </div>

      <div className='min-h-0 flex-1 overflow-hidden rounded-xl border bg-card shadow-sm'>
        <BaseTable
          data={filteredMatches}
          columns={columns}
          isLoading={isLoading}
          emptyMessage={t('matches.empty')}
          showIndex
          className='h-full'
        />
      </div>

      {startInterviewMatch && (
        <StartInterviewDialog
          open={!!startInterviewMatch}
          onOpenChange={(open) => !open && setStartInterviewMatch(null)}
          match={startInterviewMatch}
        />
      )}

      <StartMatchingCvDialog open={startMatchingOpen} onOpenChange={setStartMatchingOpen} />
    </div>
  );
}
