import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { jobService } from '@/shared/lib/api-services';
import { Card, CardContent } from '@/shared/components/ui/card';
import type { Job } from '@/shared/types/api';
import PublicPageLayout from '@/shared/components/public/PublicPageLayout';
import JobListingCard from '@/shared/components/public/JobListingCard';
import PublicApplyJobDialog from './PublicApplyJobDialog';

export default function PublicJobsPage() {
  const { t } = useTranslation();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['public-jobs'],
    queryFn: () => jobService.getAll({ status: 'ACTIVE' }),
  });

  return (
    <PublicPageLayout>
      <div className='container px-4 py-10 md:py-14'>
        <div className='mb-10 max-w-2xl space-y-3'>
          <p className='public-section-label'>{t('public.jobsTitle')}</p>
          <h1 className='text-3xl font-bold tracking-tight text-foreground md:text-4xl'>{t('public.jobsTitle')}</h1>
          <p className='text-base leading-relaxed text-muted-foreground'>{t('public.jobsDescription')}</p>
        </div>

        {isLoading ? (
          <div className='flex items-center gap-2 text-muted-foreground'>
            <Loader2 className='h-4 w-4 animate-spin' />
            {t('common.loading')}
          </div>
        ) : jobs?.length ? (
          <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
            {jobs.map((job) => (
              <JobListingCard key={job.id} job={job} onApply={setSelectedJob} />
            ))}
          </div>
        ) : (
          <Card className='border-dashed'>
            <CardContent className='py-12 text-center text-muted-foreground'>{t('dashboard.noActiveJobs')}</CardContent>
          </Card>
        )}
      </div>

      <PublicApplyJobDialog job={selectedJob} open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)} />
    </PublicPageLayout>
  );
}
