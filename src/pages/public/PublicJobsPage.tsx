import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, Factory, Globe2, Loader2, MapPin, Network, Sparkles } from 'lucide-react';
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
    <div className='min-h-screen bg-slate-950 text-slate-100'>
      <div className='container mx-auto px-4 py-12'>
        <section className='relative mb-12 overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8 md:p-12'>
          <div className='absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl' />
          <div className='absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl' />
          <div className='relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr]'>
            <div className='space-y-5'>
              <p className='inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300'>
                <Sparkles className='h-3.5 w-3.5' />
                {t('public.companySectionLabel')}
              </p>
              <h1 className='text-3xl font-bold leading-tight tracking-tight md:text-5xl'>
                {t('public.companyName')}
              </h1>
              <p className='max-w-2xl text-sm text-slate-300 md:text-base'>{t('public.companyIntro')}</p>
              <div className='flex flex-wrap gap-3 pt-2'>
                <Button asChild className='bg-cyan-500 text-slate-950 hover:bg-cyan-400'>
                  <a href='#career-opportunities'>
                    {t('public.jobsTitle')}
                    <ArrowRight className='ml-2 h-4 w-4' />
                  </a>
                </Button>
              </div>
            </div>
            <div className='grid gap-3 sm:grid-cols-3 lg:grid-cols-1'>
              <div className='rounded-xl border border-slate-700/60 bg-slate-900/60 p-4'>
                <p className='text-xs text-slate-400'>{t('public.companyFoundedLabel')}</p>
                <p className='mt-1 text-sm font-semibold'>{t('public.companyFoundedValue')}</p>
              </div>
              <div className='rounded-xl border border-slate-700/60 bg-slate-900/60 p-4'>
                <p className='text-xs text-slate-400'>{t('public.companyServiceLabel')}</p>
                <p className='mt-1 text-sm font-semibold'>{t('public.companyServiceValue')}</p>
              </div>
              <div className='rounded-xl border border-slate-700/60 bg-slate-900/60 p-4'>
                <p className='text-xs text-slate-400'>{t('public.companyPresenceLabel')}</p>
                <p className='mt-1 text-sm font-semibold'>{t('public.companyPresenceValue')}</p>
              </div>
            </div>
          </div>
        </section>

        <section className='mb-12 grid gap-4 md:grid-cols-3'>
          <Card className='border-slate-800 bg-slate-900/60 text-slate-100'>
            <CardContent className='p-5'>
              <Network className='mb-3 h-5 w-5 text-cyan-300' />
              <p className='text-sm font-semibold'>Open Networking Innovation</p>
              <p className='mt-1 text-xs text-slate-400'>AI/ML fabrics, cloud networks, and carrier access platforms.</p>
            </CardContent>
          </Card>
          <Card className='border-slate-800 bg-slate-900/60 text-slate-100'>
            <CardContent className='p-5'>
              <Factory className='mb-3 h-5 w-5 text-cyan-300' />
              <p className='text-sm font-semibold'>Design To Manufacturing</p>
              <p className='mt-1 text-xs text-slate-400'>End-to-end capability from architecture, validation to production scale.</p>
            </CardContent>
          </Card>
          <Card className='border-slate-800 bg-slate-900/60 text-slate-100'>
            <CardContent className='p-5'>
              <Globe2 className='mb-3 h-5 w-5 text-cyan-300' />
              <p className='text-sm font-semibold'>Global Team, Real Impact</p>
              <p className='mt-1 text-xs text-slate-400'>Collaborate across Taiwan, Vietnam, and US teams on infrastructure products.</p>
            </CardContent>
          </Card>
        </section>

        <section id='career-opportunities'>
          <div className='mb-8'>
            <p className='text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300'>Career opportunities</p>
            <h2 className='mt-2 text-3xl font-bold tracking-tight'>{t('public.jobsTitle')}</h2>
            <p className='text-sm text-slate-300'>{t('public.jobsDescription')}</p>
          </div>

          {isLoading ? (
            <div className='flex items-center gap-2 text-slate-300'>
              <Loader2 className='h-4 w-4 animate-spin' />
              {t('common.loading')}
            </div>
          ) : jobs?.length ? (
            <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
              {jobs.map((job) => (
                <Card key={job.id} className='group h-full border-slate-800 bg-slate-900/70 text-slate-100 transition hover:-translate-y-0.5 hover:border-cyan-600/50'>
                  <CardHeader>
                    <CardTitle className='text-lg'>{job.title}</CardTitle>
                    <div className='flex flex-wrap items-center gap-3 text-xs text-slate-400'>
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
                    <p className='line-clamp-3 text-sm text-slate-300'>{job.requirements}</p>
                    {job.skills?.length ? (
                      <div className='flex flex-wrap gap-2'>
                        {job.skills.slice(0, 6).map((skill) => (
                          <Badge key={skill} variant='secondary' className='bg-slate-800 text-slate-200'>
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                    <div className='grid grid-cols-2 gap-2'>
                      <Button asChild variant='outline' className='border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800'>
                        <Link to={`/public/jobs/${job.id}`}>{t('common.viewDetail')}</Link>
                      </Button>
                      <Button onClick={() => setSelectedJob(job)} className='bg-cyan-500 text-slate-950 hover:bg-cyan-400'>
                        {t('public.applyJob')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className='border-slate-800 bg-slate-900/70 text-slate-200'>
              <CardContent className='py-8 text-center text-slate-300'>{t('dashboard.noActiveJobs')}</CardContent>
            </Card>
          )}
        </section>
      </div>

      <PublicApplyJobDialog job={selectedJob} open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)} />
    </div>
  );
}
