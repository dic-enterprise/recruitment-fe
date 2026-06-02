import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Briefcase, Loader2, MapPin } from 'lucide-react';
import { jobService } from '@/shared/lib/api-services';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import type { Job } from '@/shared/types/api';
import PublicApplyJobDialog from './PublicApplyJobDialog';

export default function PublicJobsPage() {
  const { t } = useTranslation();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['public-jobs'],
    queryFn: () => jobService.getAll({ status: 'ACTIVE' }),
  });

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-10'>
        <section>
          <div className='mb-8'>
            <div className='mb-3'>
              <Button asChild variant='outline' size='sm'>
                <Link to='/'>{t('common.back')}</Link>
              </Button>
            </div>
            <h1 className='text-3xl font-bold tracking-tight text-foreground'>{t('public.jobsTitle')}</h1>
            <p className='text-sm text-muted-foreground'>{t('public.jobsDescription')}</p>
          </div>

          {isLoading ? (
            <div className='flex items-center gap-2 text-muted-foreground'>
              <Loader2 className='h-4 w-4 animate-spin' />
              {t('common.loading')}
            </div>
          ) : jobs?.length ? (
            <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
              {jobs.map((job) => (
                <Card key={job.id} className='group h-full transition hover:-translate-y-0.5 hover:shadow-sm'>
                  <CardHeader>
                    <CardTitle className='text-lg'>{job.title}</CardTitle>
                    <div className='flex flex-wrap items-center gap-3 text-xs text-muted-foreground'>
                      <span className='inline-flex items-center gap-1'>
                        <Briefcase className='h-3.5 w-3.5' />
                        {job.departmentName}
                      </span>
                      {job.location && (
                        <span className='inline-flex items-center gap-1'>
                          <MapPin className='h-3.5 w-3.5' />
                          {job.location}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {job.recruitmentUrgency === 'URGENT' && <Badge variant='destructive'>{t('public.urgentHiring')}</Badge>}
                    <p className='line-clamp-3 text-sm text-muted-foreground'>{job.requirements}</p>
                    {job.skills?.length ? (
                      <div className='flex flex-wrap gap-2'>
                        {job.skills.slice(0, 6).map((skill) => (
                          <Badge key={skill} variant='secondary'>
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                    <div className='grid grid-cols-2 gap-2'>
                      <Button asChild variant='outline'>
                        <Link to={`/public/jobs/${job.id}`}>{t('common.viewDetail')}</Link>
                      </Button>
                      <Button onClick={() => setSelectedJob(job)}>{t('public.applyJob')}</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className='py-8 text-center text-muted-foreground'>{t('dashboard.noActiveJobs')}</CardContent>
            </Card>
          )}
        </section>
      </div>

      <PublicApplyJobDialog job={selectedJob} open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)} />
    </div>
  );
}
