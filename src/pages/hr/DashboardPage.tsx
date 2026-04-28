import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { statsService, jobService, matchService } from '@/shared/lib/api-services';
import { Briefcase, Users, TrendingUp, AlertTriangle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import PageHeader from '@/shared/components/PageHeader';

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className='animate-slide-up'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>{title}</CardTitle>
        <div className={`rounded-lg p-2 ${color}`}>
          <Icon className='h-4 w-4' />
        </div>
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{value}</div>
        {subtitle && <p className='mt-1 text-xs text-muted-foreground'>{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats-summary'],
    queryFn: statsService.getSummary,
  });

  const { data: activeJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['active-jobs'],
    queryFn: () => jobService.getAll({ status: 'ACTIVE' }),
  });

  // For recent matches, we might need a dedicated endpoint or just fetch from matchService
  // For now, let's assume we can fetch them or they are part of another query
  // As a fallback, we'll just show empty if not available
  const { data: recentMatches } = useQuery({
    queryKey: ['recent-matches'],
    queryFn: () => matchService.getQueue(), // Placeholder or specialized endpoint
    enabled: false, // Disabling for now as it might not match exact mock logic
  });

  if (statsLoading || jobsLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  if (!stats) return <div>Failed to load statistics</div>;

  return (
    <div>
      <PageHeader title='Dashboard' description='Overview of active recruitment metrics' />

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        <StatCard
          title='Active Jobs'
          value={stats.activeJobs}
          subtitle='Current open positions'
          icon={Briefcase}
          color='bg-primary/10 text-primary'
        />
        <StatCard
          title='Total Candidates'
          value={stats.totalCandidates}
          subtitle='In talent pool'
          icon={Users}
          color='bg-accent/10 text-accent'
        />
        <StatCard
          title='High Matches (≥80)'
          value={stats.highMatches}
          subtitle='Top tier candidates'
          icon={TrendingUp}
          color='bg-success/10 text-success'
        />
        <StatCard
          title='Avg Match Score'
          value={`${stats.avgMatchScore}%`}
          subtitle='Active jobs only'
          icon={TrendingUp}
          color='bg-info/10 text-info'
        />
        <StatCard
          title='Extracts Complete'
          value={stats.extractsComplete}
          icon={CheckCircle}
          color='bg-success/10 text-success'
        />
        <StatCard title='Extracts Pending' value={stats.extractsPending} icon={Clock} color='bg-warning/10 text-warning' />
        <StatCard
          title='Extract Failures'
          value={stats.extractFailures}
          subtitle='Requires Admin IT action'
          icon={AlertTriangle}
          color='bg-destructive/10 text-destructive'
        />
      </div>

      <div className='mt-8 grid gap-6 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {activeJobs?.length === 0 ? (
                <p className='text-sm text-muted-foreground py-4 text-center'>No active jobs found</p>
              ) : (
                activeJobs?.map((job) => (
                  <div key={job.id} className='flex items-center justify-between rounded-lg border p-3'>
                    <div>
                      <p className='text-sm font-medium'>{job.title}</p>
                      <p className='text-xs text-muted-foreground'>{job.departmentName}</p>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-semibold text-primary'>{job.highMatchCount} high</p>
                      <p className='text-xs text-muted-foreground'>{job.matchCount} total</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <p className='text-sm text-muted-foreground py-4 text-center'>
                Real-time activity tracking coming soon
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
