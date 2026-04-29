import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { jobService, candidateService, matchService } from '@/shared/lib/api-services';
import {
  JobStatusBadge,
  ScoreBadge,
  QueueStatusBadge,
  ExtractStatusBadge,
  EmploymentBadge,
} from '@/shared/components/StatusBadges';
import PageHeader from '@/shared/components/PageHeader';
import { formatDate } from '@/shared/lib/utils';
import { EditJobForm } from '@/shared/components/hr/EditJobForm';
import { ArrowLeft, Play, Loader2 } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import type { Job } from '@/shared/types/api';

export default function JobDetailPage() {
  const { jobId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobService.getById(jobId!),
    enabled: !!jobId,
  });

  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ['job-matches', jobId],
    queryFn: () => matchService.getByJobId(jobId!),
    enabled: !!jobId,
  });

  const { data: candidates } = useQuery({
    queryKey: ['available-candidates'],
    queryFn: () => candidateService.getAll({ extractStatus: 'COMPLETE', employmentTag: 'CHUA_NHAN_VIEC' }),
  });

  const { data: queueItems } = useQuery({
    queryKey: ['match-queue'],
    queryFn: matchService.getQueue,
    refetchInterval: 5000, // Tăng lên 5 giây
    retry: false, // Không retry nếu API này lỗi (tránh spam khi backend chưa có)
  });

  const triggerMatchMutation = useMutation({
    mutationFn: (candidateIds: string[]) => matchService.triggerMatch(jobId!, candidateIds),
    onSuccess: () => {
      toast({ title: 'Đã bắt đầu', description: 'Quá trình so khớp đã được đưa vào hàng đợi.' });
      queryClient.invalidateQueries({ queryKey: ['match-queue'] });
      setSelectedCandidates(new Set());
    },
    onError: () => {
      toast({ title: 'Lỗi', description: 'Không thể bắt đầu quá trình so khớp.', variant: 'destructive' });
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: (next: Partial<Job>) => jobService.update(jobId!, next),
    onSuccess: () => {
      toast({ title: 'Đã lưu', description: 'Thông tin tin tuyển dụng đã được cập nhật.' });
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
    },
  });

  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());

  if (jobLoading || matchesLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  if (!job) return <div className='p-8 text-center text-muted-foreground'>Job not found</div>;

  const matchResults = matches || [];
  const availableCandidates = candidates || [];
  const isActive = job.status === 'ACTIVE';

  const toggleCandidate = (id: string) => {
    setSelectedCandidates((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAllAvailable = () => {
    setSelectedCandidates(new Set(availableCandidates.map((c) => c.id)));
  };

  const handleStart = () => {
    if (selectedCandidates.size === 0) {
      toast({
        title: 'Chưa chọn ứng viên',
        description: 'Vui lòng chọn ít nhất một ứng viên để bắt đầu so khớp.',
        variant: 'destructive',
      });
      return;
    }
    triggerMatchMutation.mutate([...selectedCandidates]);
  };

  const handleJobSave = (next: Job) => {
    updateJobMutation.mutate(next);
  };

  const currentQueueForJob = queueItems?.filter(q => q.status !== 'done') || [];

  return (
    <div className='flex h-full min-h-0 flex-1 flex-col'>
      <PageHeader
        title={job.title}
        description={`${job.departmentName} · ${job.salary || 'Salary not specified'}`}
        actions={
          <Button variant='outline' asChild>
            <Link to='/hr/jobs'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back
            </Link>
          </Button>
        }
      />

      <Tabs defaultValue='workflow' className='mt-2 flex min-h-0 flex-1 flex-col'>
        <TabsList className='mb-4'>
          <TabsTrigger value='workflow'>Matching & results</TabsTrigger>
          <TabsTrigger value='edit-job'>Job details</TabsTrigger>
        </TabsList>

        <TabsContent value='workflow' className='mt-0 space-y-6'>
          <div className='flex items-center gap-3'>
            <JobStatusBadge status={job.status} />
            <span className='text-sm text-muted-foreground'>Created {formatDate(job.createdAt)}</span>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Requirements (JD)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='whitespace-pre-wrap text-sm text-muted-foreground'>{job.requirements}</p>
            </CardContent>
          </Card>

          {isActive && (
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-base'>Start Matching</CardTitle>
                  <div className='flex gap-2'>
                    <Button variant='outline' size='sm' onClick={selectAllAvailable}>
                      Select All Available ({availableCandidates.length})
                    </Button>
                    <Button size='sm' onClick={handleStart} disabled={triggerMatchMutation.isPending || selectedCandidates.size === 0}>
                      {triggerMatchMutation.isPending ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Play className='mr-2 h-4 w-4' />
                          Start
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className='max-h-64 space-y-2 overflow-y-auto'>
                  {availableCandidates.map((c) => {
                    const alreadyQueued = currentQueueForJob.some((q) => q.candidateId === c.id);
                    return (
                      <label
                        key={c.id}
                        className='flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-muted'
                      >
                        <Checkbox
                          checked={selectedCandidates.has(c.id)}
                          onCheckedChange={() => toggleCandidate(c.id)}
                          disabled={alreadyQueued}
                        />
                        <div className='flex-1'>
                          <p className='text-sm font-medium'>{c.name}</p>
                          <p className='text-xs text-muted-foreground'>{c.skills?.join(', ') || 'Skills pending'}</p>
                        </div>
                        {alreadyQueued && <span className='text-xs text-muted-foreground'>Already enqueued</span>}
                        <ExtractStatusBadge status={c.extractStatus} />
                        <EmploymentBadge tag={c.employmentTag} />
                      </label>
                    );
                  })}
                  {availableCandidates.length === 0 && (
                    <p className='text-sm text-muted-foreground text-center py-4'>No available candidates to match</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {currentQueueForJob.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Matching Queue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  {currentQueueForJob.map((item) => (
                    <div key={item.candidateId} className='flex items-center justify-between rounded-lg border p-3'>
                      <span className='text-sm font-medium'>{item.candidateName}</span>
                      <QueueStatusBadge status={item.status} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Match Results ({matchResults.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {matchResults.length === 0 ? (
                <p className='py-4 text-center text-sm text-muted-foreground'>No match results yet</p>
              ) : (
                <div className='space-y-2'>
                  {[...matchResults]
                    .sort((a, b) => b.score - a.score)
                    .map((m) => (
                      <Link
                        key={m.id}
                        to={`/hr/candidates/${m.candidateId}`}
                        className='flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted'
                      >
                        <div>
                          <p className='text-sm font-medium'>{m.candidateName}</p>
                          <p className='text-xs text-muted-foreground'>Matched {formatDate(m.createdAt)}</p>
                        </div>
                        <div className='flex items-center gap-2'>
                          {m.score >= 80 && <span className='text-xs font-semibold text-success'>⭐ High Match</span>}
                          <ScoreBadge score={m.score} />
                        </div>
                      </Link>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='edit-job' className='mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden'>
          <EditJobForm initialJob={job} onSubmit={handleJobSave} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
