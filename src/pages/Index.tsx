import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Building2, Globe2, Network } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import PublicPageLayout from '@/shared/components/public/PublicPageLayout';
import JobListingCard from '@/shared/components/public/JobListingCard';
import { jobService } from '@/shared/lib/api-services';

export default function Index() {
  const { t } = useTranslation();

  const { data: jobs = [] } = useQuery({
    queryKey: ['landing-active-jobs'],
    queryFn: () => jobService.getAll({ status: 'ACTIVE' }),
  });

  const featuredJobs = jobs.slice(0, 6);

  const highlights = [
    {
      icon: Building2,
      title: t('landing.highlight1Title'),
      description: t('landing.highlight1Description'),
      className: 'md:col-span-2',
    },
    {
      icon: Network,
      title: t('landing.highlight2Title'),
      description: t('landing.highlight2Description'),
      className: 'md:col-span-1',
    },
    {
      icon: Globe2,
      title: t('landing.highlight3Title'),
      description: t('landing.highlight3Description'),
      className: 'md:col-span-1',
    },
  ];

  const stats = [
    { value: '1988', label: t('landing.statFounded') },
    { value: 'ODM', label: t('landing.statOdm') },
    { value: 'Global', label: t('landing.statGlobal') },
  ];

  return (
    <PublicPageLayout>
      <section className='relative overflow-hidden border-b border-border'>
        <div className='public-grid-bg absolute inset-0 opacity-40' />
        <div className='container relative px-4 py-16 md:py-24'>
          <div className='max-w-3xl animate-slide-up'>
            <p className='public-section-label'>{t('landing.careersLabel')}</p>
            <h1 className='mt-4 text-4xl font-bold leading-[1.08] text-foreground md:text-5xl lg:text-6xl'>
              {t('landing.heroTitle')}
            </h1>
            <p className='mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg'>
              {t('landing.heroSubtitle')}
            </p>
            <div className='mt-8 flex flex-wrap gap-3'>
              <Button asChild size='lg'>
                <a href='#career-opportunities'>
                  {t('landing.viewOpenRoles')}
                  <ArrowRight className='ml-2 h-4 w-4' />
                </a>
              </Button>
              <Button asChild variant='outline' size='lg'>
                <a href='#about-us'>{t('landing.aboutAccton')}</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id='about-us' className='container px-4 py-16 md:py-20'>
        <div className='grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16'>
          <div className='space-y-5'>
            <p className='public-section-label'>{t('landing.aboutUs')}</p>
            <h2 className='text-3xl font-bold text-foreground md:text-4xl'>{t('landing.aboutTitle')}</h2>
            <p className='text-base leading-relaxed text-muted-foreground'>{t('landing.aboutDescription')}</p>
            <div className='grid grid-cols-3 gap-4 pt-2'>
              {stats.map((stat) => (
                <div key={stat.label} className='rounded-xl border border-border bg-card px-4 py-3'>
                  <p className='text-lg font-bold text-primary'>{stat.value}</p>
                  <p className='text-xs text-muted-foreground'>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            {highlights.map((item) => (
              <Card key={item.title} className={`border-border/80 bg-card shadow-sm ${item.className}`}>
                <CardContent className='space-y-3 p-5'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                    <item.icon className='h-5 w-5' />
                  </div>
                  <p className='font-semibold text-foreground'>{item.title}</p>
                  <p className='text-sm leading-relaxed text-muted-foreground'>{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id='career-opportunities' className='border-t border-border bg-muted/40'>
        <div className='container px-4 py-16 md:py-20'>
          <div className='mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
            <div className='space-y-2'>
              <p className='public-section-label'>{t('landing.careerOpportunities')}</p>
              <h2 className='text-3xl font-bold text-foreground'>{t('landing.careerTitle')}</h2>
              <p className='max-w-xl text-sm text-muted-foreground'>{t('landing.careerDescription')}</p>
            </div>
            <Button asChild variant='outline'>
              <Link to='/public/jobs'>
                {t('landing.viewAllOpportunities')}
                <ArrowRight className='ml-2 h-4 w-4' />
              </Link>
            </Button>
          </div>

          {featuredJobs.length > 0 ? (
            <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
              {featuredJobs.map((job) => (
                <JobListingCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <Card className='border-dashed'>
              <CardContent className='py-12 text-center text-sm text-muted-foreground'>
                {t('landing.noActiveJobs')}
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </PublicPageLayout>
  );
}
