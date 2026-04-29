import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { matchService, jobService } from '@/shared/lib/api-services';
import { ScoreBadge } from '@/shared/components/StatusBadges';
import PageHeader from '@/shared/components/PageHeader';
import { BaseTable, type Column } from '@/shared/components/BaseTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { formatDate } from '@/shared/lib/utils';
import { Search, User, Briefcase } from 'lucide-react';
import type { CVMatch } from '@/shared/types/api';

export default function MatchResultsPage() {
  const [jobFilter, setJobFilter] = useState<string>('ALL');

  const { data: jobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobService.getAll(),
  });

  const { data: allMatches, isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: matchService.getAll,
  });

  const filteredMatches = (allMatches || []).filter((m) => 
    jobFilter === 'ALL' || String(m.jobId) === jobFilter
  );

  const columns: Column<CVMatch>[] = [
    {
      header: 'Job Posting',
      key: 'jobTitle',
      width: '250px',
      render: (m) => (
        <div className='flex items-center gap-2'>
          <Briefcase className='h-3.5 w-3.5 text-muted-foreground' />
          <Link to={`/hr/jobs`} className='font-medium hover:underline'>
            {m.jobTitle}
          </Link>
        </div>
      ),
    },
    {
      header: 'Candidate',
      key: 'candidateName',
      width: '200px',
      render: (m) => (
        <div className='flex items-center gap-2'>
          <User className='h-3.5 w-3.5 text-muted-foreground' />
          <Link to={`/hr/candidates/${m.candidateId}`} className='font-medium text-primary hover:underline'>
            {m.candidateName}
          </Link>
        </div>
      ),
    },
    {
      header: 'Match Score',
      key: 'score',
      className: 'text-center',
      headerClassName: 'text-center',
      render: (m) => (
        <div className='flex justify-center'>
          <ScoreBadge score={m.score} />
        </div>
      ),
    },
    {
      header: 'Reasoning',
      key: 'details',
      render: (m) => (
        <div className='flex gap-2 text-[10px]'>
          <span className='rounded bg-blue-50 px-1.5 py-0.5 text-blue-600 dark:bg-blue-900/20'>Skills: {m.details.skillMatch}%</span>
          <span className='rounded bg-purple-50 px-1.5 py-0.5 text-purple-600 dark:bg-purple-900/20'>Exp: {m.details.experienceMatch}%</span>
        </div>
      ),
    },
    {
      header: 'Matched Date',
      key: 'createdAt',
      width: '150px',
      className: 'text-muted-foreground text-sm',
      render: (m) => formatDate(m.createdAt),
    },
  ];

  return (
    <div className='flex h-full min-h-0 flex-col'>
      <PageHeader
        title='Matching CV'
        description='Consolidated view of all CV matching results'
      />

      <div className='mb-4 flex shrink-0 items-center gap-4'>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground font-medium'>Filter by Job:</span>
          <Select value={jobFilter} onValueChange={setJobFilter}>
            <SelectTrigger className='w-[280px] h-9'>
              <SelectValue placeholder='Select Job' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='ALL'>All Job Postings</SelectItem>
              {jobs?.map((job) => (
                <SelectItem key={job.id} value={String(job.id)}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='ml-auto text-xs text-muted-foreground'>
          Found {filteredMatches.length} matching results
        </div>
      </div>

      <div className='flex-1 min-h-0 bg-card rounded-xl border shadow-sm overflow-hidden'>
        <BaseTable
          data={filteredMatches}
          columns={columns}
          isLoading={isLoading}
          emptyMessage='No matching results found'
          showIndex={true}
          className='h-full'
        />
      </div>
    </div>
  );
}
