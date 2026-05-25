import { useQuery } from '@tanstack/react-query';
import { statsService, jobService, matchService } from '@/shared/lib/api-services';
import {
  Briefcase,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  Activity,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';
import PageHeader from '@/shared/components/PageHeader';
import { cn } from '@/shared/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type StatVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

type ActivityItem = {
  id: string;
  initials: string;
  text: React.ReactNode;
  time: string;
  avatarVariant: 'info' | 'success' | 'warning' | 'muted';
  score?: number;
};

// ─── Variant map ──────────────────────────────────────────────────────────────

const variantStyles: Record<
  StatVariant,
  { card: string; iconWrap: string; label: string; value: string; delta: string; border: string }
> = {
  default: {
    card: 'bg-card',
    border: 'border-border',
    iconWrap: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
    label: 'text-muted-foreground',
    value: 'text-foreground',
    delta: 'text-muted-foreground',
  },
  success: {
    card: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    iconWrap: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-400',
    label: 'text-emerald-700/70 dark:text-emerald-400/70',
    value: 'text-emerald-900 dark:text-emerald-100',
    delta: 'text-emerald-600 dark:text-emerald-400',
  },
  warning: {
    card: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800/60',
    iconWrap: 'bg-amber-100 text-amber-600 dark:bg-amber-900/60 dark:text-amber-400',
    label: 'text-amber-700/70 dark:text-amber-400/70',
    value: 'text-amber-900 dark:text-amber-100',
    delta: 'text-amber-600 dark:text-amber-400',
  },
  danger: {
    card: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800/60',
    iconWrap: 'bg-red-100 text-red-600 dark:bg-red-900/60 dark:text-red-400',
    label: 'text-red-700/70 dark:text-red-400/70',
    value: 'text-red-900 dark:text-red-100',
    delta: 'text-red-600 dark:text-red-400',
  },
  info: {
    card: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800/60',
    iconWrap: 'bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-400',
    label: 'text-blue-700/70 dark:text-blue-400/70',
    value: 'text-blue-900 dark:text-blue-100',
    delta: 'text-blue-600 dark:text-blue-400',
  },
};

const avatarVariantStyles: Record<ActivityItem['avatarVariant'], string> = {
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  muted: 'bg-muted text-muted-foreground',
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  subtitle,
  delta,
  deltaUp,
  icon: Icon,
  variant = 'default',
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  delta?: string;
  deltaUp?: boolean;
  icon: React.ElementType;
  variant?: StatVariant;
}) {
  const s = variantStyles[variant];
  const DeltaIcon = deltaUp === false ? TrendingDown : TrendingUp;

  return (
    <div className={cn('rounded-xl border p-4 flex flex-col gap-2.5 transition-all hover:shadow-sm', s.card, s.border)}>
      <div className='flex items-center justify-between'>
        <p className={cn('text-xs font-medium', s.label)}>{title}</p>
        <span className={cn('rounded-lg p-1.5', s.iconWrap)}>
          <Icon className='h-3.5 w-3.5' />
        </span>
      </div>
      <p className={cn('text-2xl font-semibold tabular-nums leading-none', s.value)}>{value}</p>
      {delta ? (
        <p className={cn('flex items-center gap-1 text-xs font-medium', s.delta)}>
          <DeltaIcon className='h-3 w-3' />
          {delta}
        </p>
      ) : subtitle ? (
        <p className={cn('text-xs', s.label)}>{subtitle}</p>
      ) : null}
    </div>
  );
}

// ─── Activity Row ─────────────────────────────────────────────────────────────

function ActivityRow({ item }: { item: ActivityItem }) {
  return (
    <div className='flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50'>
      <div
        className={cn(
          'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
          avatarVariantStyles[item.avatarVariant],
        )}
      >
        {item.initials}
      </div>
      <div className='min-w-0 flex-1'>
        <p className='text-sm leading-snug text-foreground'>{item.text}</p>
        <p className='mt-0.5 text-xs text-muted-foreground'>{item.time}</p>
      </div>
    </div>
  );
}

// ─── Job Row ──────────────────────────────────────────────────────────────────

function JobRow({
  title,
  departmentName,
  matchCount,
  highMatchCount,
}: {
  title: string;
  departmentName: string;
  matchCount: number;
  highMatchCount: number;
}) {
  return (
    <div className='group flex items-center justify-between gap-4 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50'>
      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-medium text-foreground'>{title}</p>
        <p className='text-xs text-muted-foreground'>{departmentName}</p>
      </div>
      <div className='flex shrink-0 items-center gap-3'>
        <div className='text-right'>
          <p className='text-sm font-semibold tabular-nums text-blue-600 dark:text-blue-400'>
            {highMatchCount}
            <span className='ml-1 text-xs font-normal text-muted-foreground'>high</span>
          </p>
          <p className='text-xs tabular-nums text-muted-foreground'>{matchCount} total</p>
        </div>
        <ChevronRight className='h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100' />
      </div>
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className='overflow-hidden rounded-xl border border-border bg-card'>
      <div className='flex items-center justify-between border-b border-border px-4 py-3'>
        <div className='flex items-center gap-2'>
          {Icon && <Icon className='h-4 w-4 text-muted-foreground' />}
          <h3 className='text-sm font-medium text-foreground'>{title}</h3>
        </div>
        {action}
      </div>
      <div className='p-2'>{children}</div>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats-summary'],
    queryFn: statsService.getSummary,
  });

  const { data: activeJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['active-jobs'],
    queryFn: () => jobService.getAll({ status: 'ACTIVE' }),
  });

  const { data: recentMatches } = useQuery({
    queryKey: ['recent-matches'],
    queryFn: () => matchService.getQueue(),
    enabled: false,
  });

  if (statsLoading || jobsLoading) {
    return (
      <div className='flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground'>
        <Loader2 className='h-6 w-6 animate-spin' />
        <p className='text-sm'>Loading metrics…</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <p className='text-sm text-muted-foreground'>Failed to load statistics.</p>
      </div>
    );
  }

  const primaryCards = [
    {
      title: 'Active jobs',
      value: stats.activeJobs,
      delta: '',
      deltaUp: true,
      icon: Briefcase,
      variant: 'info' as StatVariant,
    },
    {
      title: 'Total candidates',
      value: stats.totalCandidates,
      delta: '',
      deltaUp: true,
      icon: Users,
      variant: 'default' as StatVariant,
    },
    {
      title: 'High matches ≥80',
      value: stats.highMatches,
      subtitle: 'Top-tier candidates',
      icon: TrendingUp,
      variant: 'success' as StatVariant,
    },
    {
      title: 'Avg match score',
      value: `${stats.avgMatchScore}%`,
      delta: '',
      deltaUp: true,
      icon: TrendingUp,
      variant: 'info' as StatVariant,
    },
  ];

  const extractCards = [
    {
      title: 'Extracts complete',
      value: stats.extractsComplete,
      subtitle: `of ${stats.totalCandidates} total`,
      icon: CheckCircle,
      variant: 'success' as StatVariant,
    },
    {
      title: 'Pending',
      value: stats.extractsPending,
      subtitle: 'In queue',
      icon: Clock,
      variant: 'warning' as StatVariant,
    },
    {
      title: 'Extract failures',
      value: stats.extractFailures,
      delta: 'Needs IT action',
      deltaUp: false,
      icon: AlertTriangle,
      variant: 'danger' as StatVariant,
    },
  ];

  return (
    <div className='space-y-4'>
      <PageHeader title='Dashboard' description='Overview of active recruitment metrics' />

      {/* Primary KPIs */}
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        {primaryCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Extract status */}
      <div className='grid gap-3 sm:grid-cols-3'>
        {extractCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Active jobs + Activity feed */}
      <div className='grid gap-4 lg:grid-cols-2'>
        <SectionCard title='Active jobs' icon={Briefcase}>
          {!activeJobs || activeJobs.length === 0 ? (
            <div className='flex flex-col items-center justify-center gap-2 py-8 text-center'>
              <div className='rounded-full bg-muted p-3'>
                <Briefcase className='h-5 w-5 text-muted-foreground' />
              </div>
              <p className='text-sm text-muted-foreground'>No active jobs found</p>
            </div>
          ) : (
            <div>
              {activeJobs.map((job) => (
                <JobRow
                  key={job.id}
                  title={job.title}
                  departmentName={job.departmentName}
                  matchCount={job.matchCount}
                  highMatchCount={job.highMatchCount}
                />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title='Recent activity'
          icon={Activity}
          action={
            <button className='text-xs text-muted-foreground transition-colors hover:text-foreground'>
              Coming soon <ChevronRight className='inline h-3 w-3' />
            </button>
          }
        >
          <div className='flex flex-col items-center justify-center gap-2 py-8 text-center'>
            <div className='rounded-full bg-muted p-3'>
              <Activity className='h-5 w-5 text-muted-foreground' />
            </div>
            <p className='text-sm text-muted-foreground'>Real-time activity tracking coming soon</p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}