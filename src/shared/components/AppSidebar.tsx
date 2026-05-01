import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/shared/lib/utils.ts';
import { LayoutDashboard, Building2, Briefcase, Users, AlertTriangle, CheckSquare, Settings } from 'lucide-react';

const hrLinks = [
  { to: '/hr/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/hr/matches', label: 'Matching CV', icon: CheckSquare },
  { to: '/hr/candidates', label: 'Candidates', icon: Users },
  { to: '/hr/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/hr/departments', label: 'Departments', icon: Building2 },
];

const adminLinks = [
  { to: '/admin/extract-errors', label: 'Extract Errors', icon: AlertTriangle },
  { to: '/admin/ai-config', label: 'AI Configuration', icon: Settings },
];

export default function AppSidebar() {
  const location = useLocation();

  return (
    <aside className='fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground'>
      <div className='flex h-16 items-center gap-3 border-b border-sidebar-border px-6'>
        <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary'>
          <Briefcase className='h-5 w-5 text-sidebar-primary-foreground' />
        </div>
        <div>
          <h1 className='text-base font-bold text-sidebar-primary-foreground'>RecruitPro</h1>
          <p className='text-xs text-sidebar-foreground/60'>Recruitment System</p>
        </div>
      </div>

      <nav className='flex-1 space-y-1 px-3 py-4'>
        <p className='mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50'>HR / TA</p>
        {hrLinks.map((link) => {
          const active = location.pathname.startsWith(link.to);
          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <link.icon className='h-4 w-4' />
              {link.label}
            </Link>
          );
        })}

        <div className='my-4 border-t border-sidebar-border' />

        <p className='mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50'>Admin IT</p>
        {adminLinks.map((link) => {
          const active = location.pathname.startsWith(link.to);
          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <link.icon className='h-4 w-4' />
              {link.label}
            </Link>
          );
        })}

        <div className='my-4 border-t border-sidebar-border' />
      </nav>
    </aside>
  );
}
