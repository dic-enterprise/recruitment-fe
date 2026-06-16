import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Briefcase, Loader2, MapPin } from 'lucide-react';
import { jobService } from '@/shared/lib/api-services';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import type { Job } from '@/shared/types/api';
import PublicPageLayout from '@/shared/components/public/PublicPageLayout';
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
      <PublicPageLayout mainClassName='flex items-center justify-center'>
        <div className='flex items-center gap-2 text-muted-foreground'>
          <Loader2 className='h-4 w-4 animate-spin' />
          {t('common.loading')}
        </div>
      </PublicPageLayout>
    );
  }

  if (error || !job) {
    return (
      <PublicPageLayout mainClassName='flex items-center justify-center p-4'>
        <Card className='w-full max-w-lg border-dashed'>
          <CardContent className='space-y-4 py-10 text-center'>
            <p className='text-muted-foreground'>{t('public.jobNotFound')}</p>
            <Button asChild variant='outline'>
              <Link to='/public/jobs'>{t('public.backToJobs')}</Link>
            </Button>
          </CardContent>
        </Card>
      </PublicPageLayout>
    );
  }

  return (
    <PublicPageLayout>
      <div className='container max-w-4xl px-4 py-10 md:py-14'>
        <Button asChild variant='ghost' size='sm' className='mb-6 -ml-2 text-muted-foreground'>
          <Link to='/public/jobs'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            {t('public.backToJobs')}
          </Link>
        </Button>

        <Card className='overflow-hidden border-border/80 shadow-sm'>
          <CardHeader className='space-y-4 bg-muted/30 pb-6'>
            <div className='space-y-2'>
              {job.recruitmentUrgency === 'URGENT' ? (
                <Badge variant='destructive'>{t('public.urgentHiring')}</Badge>
              ) : null}
              <CardTitle className='text-2xl md:text-3xl'>{job.title}</CardTitle>
            </div>
            <div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
              <span className='inline-flex items-center gap-1.5'>
                <Briefcase className='h-4 w-4 text-primary' />
                {job.departmentName}
              </span>
              {job.location ? (
                <span className='inline-flex items-center gap-1.5'>
                  <MapPin className='h-4 w-4 text-primary' />
                  {job.location}
                </span>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className='space-y-6 p-6 md:p-8'>
            <div>
              <p className='mb-2 text-sm font-semibold text-foreground'>{t('jobs.requirements')}</p>
              <p className='whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground'>{job.requirements}</p>
            </div>
            {job.skills?.length ? (
              <>
                <Separator />
                <div>
                  <p className='mb-3 text-sm font-semibold text-foreground'>{t('public.skills')}</p>
                  <div className='flex flex-wrap gap-2'>
                    {job.skills.map((skill) => (
                      <Badge key={skill} variant='secondary' className='font-normal'>
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        <div className='mt-6 flex justify-end'>
          <Button size='lg' onClick={() => setApplyOpen(true)}>
            {t('public.applyJob')}
          </Button>
        </div>
      </div>

      <PublicApplyJobDialog job={job as Job} open={isApplyOpen} onOpenChange={setApplyOpen} />
    </PublicPageLayout>
  );
}
