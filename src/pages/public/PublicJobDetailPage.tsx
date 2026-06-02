import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { Briefcase, Loader2, MapPin } from 'lucide-react';
import { jobService } from '@/shared/lib/api-services';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import type { Job } from '@/shared/types/api';
import PublicApplyJobDialog from './PublicApplyJobDialog';

export default function PublicJobDetailPage() {
  const { t } = useTranslation();
  const { jobId } = useParams();
  const [isApplyOpen, setApplyOpen] = useState(false);

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['public-job-detail', jobId],
    queryFn: () => jobService.getById(jobId!),
    enabled: !!jobId,
  });

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center text-muted-foreground'>
        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
        {t('common.loading')}
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className='flex min-h-screen items-center justify-center p-4'>
        <Card className='w-full max-w-lg'>
          <CardContent className='space-y-4 py-8 text-center'>
            <p className='text-muted-foreground'>{t('public.jobNotFound')}</p>
            <Button asChild variant='outline'>
              <Link to='/public/jobs'>{t('public.backToJobs')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-10 space-y-6'>
        <Button asChild variant='outline'>
          <Link to='/public/jobs'>{t('public.backToJobs')}</Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className='text-2xl'>{job.title}</CardTitle>
            <div className='flex flex-wrap items-center gap-3 text-sm text-muted-foreground'>
              <span className='inline-flex items-center gap-1'>
                <Briefcase className='h-4 w-4' />
                {job.departmentName}
              </span>
              {job.location ? (
                <span className='inline-flex items-center gap-1'>
                  <MapPin className='h-4 w-4' />
                  {job.location}
                </span>
              ) : null}
              {job.recruitmentUrgency === 'URGENT' ? <Badge variant='destructive'>{t('public.urgentHiring')}</Badge> : null}
            </div>
          </CardHeader>
          <CardContent className='space-y-5'>
            <div>
              <p className='mb-2 text-sm font-medium'>{t('jobs.requirements')}</p>
              <p className='whitespace-pre-wrap text-sm text-muted-foreground'>{job.requirements}</p>
            </div>
            {job.skills?.length ? (
              <div>
                <p className='mb-2 text-sm font-medium'>{t('public.skills')}</p>
                <div className='flex flex-wrap gap-2'>
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant='secondary'>
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
        <div className='flex justify-end'>
          <Button onClick={() => setApplyOpen(true)}>{t('public.applyJob')}</Button>
        </div>
      </div>
      <PublicApplyJobDialog job={job as Job} open={isApplyOpen} onOpenChange={setApplyOpen} />
    </div>
  );
}

