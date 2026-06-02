import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Briefcase, Building2, Globe2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { jobService } from '@/shared/lib/api-services';

export default function Index() {
  const { data: jobs = [] } = useQuery({
    queryKey: ['landing-active-jobs'],
    queryFn: () => jobService.getAll({ status: 'ACTIVE' }),
  });

  const featuredJobs = jobs.slice(0, 6);

  return (
    <div className='min-h-screen bg-slate-50'>
      <header className='sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80'>
        <div className='container mx-auto flex h-16 items-center justify-between px-4'>
          <div className='text-2xl font-bold tracking-tight text-[#2463A8]'>Accton</div>
          <nav className='flex items-center gap-7 text-sm text-slate-700'>
            <a href='#about-us' className='hover:text-slate-900'>
              About us
            </a>
            <a href='#career-opportunities' className='hover:text-slate-900'>
              Career opportunities
            </a>
            <Button asChild className='bg-[#2463A8] hover:bg-[#1d4f86]'>
              <Link to='/login'>Login as Accton user</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section id='about-us' className='bg-gradient-to-br from-slate-900 via-[#1b3551] to-[#2463A8] text-white'>
          <div className='container mx-auto grid gap-8 px-4 py-20 lg:grid-cols-[1.3fr_0.7fr]'>
            <div className='space-y-5'>
              <p className='inline-flex rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/80'>
                About us
              </p>
              <h1 className='text-4xl font-bold leading-tight md:text-5xl'>
                Accton Technology - Premier Networking and Computing Infrastructure Solutions
              </h1>
              <p className='max-w-2xl text-white/85'>
                Accton is a provider of innovative technology design and manufacturing services. Since 1988, we help
                customers accelerate from concept to global production with ODM / JDM / OEM capabilities and a turnkey,
                open infrastructure approach.
              </p>
              <div className='flex gap-3'>
                <Badge className='bg-white/15 text-white hover:bg-white/15'>Design & Manufacturing Since 1988</Badge>
                <Badge className='bg-white/15 text-white hover:bg-white/15'>ODM • JDM • OEM</Badge>
              </div>
            </div>
            <div className='grid gap-3'>
              <Card className='border-white/20 bg-white/10 text-white'>
                <CardContent className='p-4'>
                  <Building2 className='mb-2 h-5 w-5' />
                  <p className='text-sm font-semibold'>Turnkey, full-lifecycle delivery</p>
                  <p className='text-xs text-white/80'>
                    Complete solutions from hardware architecture, advanced SMT production, rigorous QA & compliance to
                    global mass production.
                  </p>
                </CardContent>
              </Card>
              <Card className='border-white/20 bg-white/10 text-white'>
                <CardContent className='p-4'>
                  <Briefcase className='mb-2 h-5 w-5' />
                  <p className='text-sm font-semibold'>Open infrastructure & collaboration</p>
                  <p className='text-xs text-white/80'>
                    Deliver networking solutions powered by open standards (OCP / SONiC ecosystem) and collaborative
                    co-engineering with upstream partners.
                  </p>
                </CardContent>
              </Card>
              <Card className='border-white/20 bg-white/10 text-white'>
                <CardContent className='p-4'>
                  <Globe2 className='mb-2 h-5 w-5' />
                  <p className='text-sm font-semibold'>Global R&amp;D & operating sites</p>
                  <p className='text-xs text-white/80'>
                    HQ / global R&amp;D in Taiwan (Zhubei). Manufacturing operations in Vietnam (Vinh Phuc region). Regional
                    support / integration in Irvine, California.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id='career-opportunities' className='container mx-auto px-4 py-16'>
          <div className='mb-8 flex items-end justify-between gap-4'>
            <div>
              <p className='text-xs uppercase tracking-[0.16em] text-[#2463A8]'>Career opportunities</p>
              <h2 className='mt-2 text-3xl font-bold text-slate-900'>Join Accton and build the future of infrastructure</h2>
            </div>
            <Button asChild variant='outline'>
              <Link to='/public/jobs'>
                View all opportunities
                <ArrowRight className='ml-2 h-4 w-4' />
              </Link>
            </Button>
          </div>

          {featuredJobs.length > 0 ? (
            <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
              {featuredJobs.map((job) => (
                <Card key={job.id} className='h-full border-slate-200 bg-white'>
                  <CardHeader>
                    <CardTitle className='text-lg'>{job.title}</CardTitle>
                    <div className='flex flex-wrap items-center gap-3 text-xs text-slate-500'>
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
                    <p className='line-clamp-3 text-sm text-slate-600'>{job.requirements}</p>
                    <div className='flex items-center gap-2'>
                      <Button asChild variant='outline' size='sm'>
                        <Link to={`/public/jobs/${job.id}`}>View detail</Link>
                      </Button>
                      <Button asChild size='sm' className='bg-[#2463A8] hover:bg-[#1d4f86]'>
                        <Link to={`/public/jobs/${job.id}`}>Apply</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className='py-10 text-center text-sm text-slate-500'>No active opportunities at this moment.</CardContent>
            </Card>
          )}
        </section>
      </main>
    </div>
  );
}
