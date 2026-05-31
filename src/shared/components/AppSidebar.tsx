import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/shared/lib/utils.ts';
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Users,
  AlertTriangle,
  CheckSquare,
  Settings,
  CalendarDays,
  GitBranch,
  ChevronLeft,
} from 'lucide-react';
import { SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

const hrLinks = [
  { to: '/hr/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/hr/calendar', labelKey: 'nav.calendar', icon: CalendarDays },
  { to: '/hr/interview-processes', labelKey: 'nav.interviewProcess', icon: GitBranch },
  { to: '/hr/matches', labelKey: 'nav.matchingCv', icon: CheckSquare },
  { to: '/hr/candidates', labelKey: 'nav.candidates', icon: Users },
  { to: '/hr/jobs', labelKey: 'nav.jobs', icon: Briefcase },
  { to: '/hr/departments', labelKey: 'nav.departments', icon: Building2 },
];

const adminLinks = [
  { to: '/admin/extract-errors', labelKey: 'nav.extractErrors', icon: AlertTriangle },
  { to: '/admin/ai-config', labelKey: 'nav.aiConfig', icon: Settings },
];
interface NavLinkProps {
  to: string;
  label: string;
  icon: React.ElementType;
  collapsed: boolean;
  active: boolean;
}

function NavLink(props: NavLinkProps) {
  const { to, label, icon: Icon, collapsed, active } = props;
  return (
    <Link
      to={to}
      title={collapsed ? label : undefined}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
        collapsed ? 'justify-center px-2' : '',
        active
          ? 'bg-sidebar-accent text-sidebar-primary'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      )}
    >
      <Icon className='h-4 w-4 shrink-0' />

      {/* Label with fade+slide animation */}
      <span
        className={cn(
          'overflow-hidden whitespace-nowrap transition-all duration-300',
          collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
        )}
      >
        {label}
      </span>

      {/* Tooltip khi collapsed */}
      {collapsed && (
        <span className='pointer-events-none absolute left-full ml-2 z-50 rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap'>
          {label}
        </span>
      )}
    </Link>
  );
}

interface AppSideBarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<SetStateAction<boolean>>;
}

export default function AppSidebar(props: AppSideBarProps) {
  const { t } = useTranslation();
  const location = useLocation();

  const { collapsed, setCollapsed } = props;
  
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'relative flex h-16 items-center border-b border-sidebar-border transition-all duration-300',
          collapsed ? 'justify-center px-2' : 'gap-3 px-6',
        )}
      >
        <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary'>
          <Briefcase className='h-5 w-5 text-sidebar-primary-foreground' />
        </div>

        <div
          className={cn(
            'overflow-hidden transition-all duration-300',
            collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
          )}
        >
          <h1 className='whitespace-nowrap text-base font-bold text-sidebar-primary-foreground'>{t('nav.brand')}</h1>
          <p className='whitespace-nowrap text-xs text-sidebar-foreground/60'>{t('nav.tagline')}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className='flex-1 overflow-y-auto overflow-x-hidden px-2 py-4'>
        {/* Section label HR */}
        <p
          className={cn(
            'mb-2 overflow-hidden whitespace-nowrap px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 transition-all duration-300',
            collapsed ? 'h-0 opacity-0 mb-0' : 'h-auto opacity-100',
          )}
        >
          {t('nav.hrSection')}
        </p>

        <div className='space-y-1'>
          {hrLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              label={t(link.labelKey)}
              icon={link.icon}
              collapsed={collapsed}
              active={location.pathname.startsWith(link.to)}
            />
          ))}
        </div>

        <div className='my-4 border-t border-sidebar-border' />

        {/* Section label Admin */}
        <p
          className={cn(
            'mb-2 overflow-hidden whitespace-nowrap px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 transition-all duration-300',
            collapsed ? 'h-0 opacity-0 mb-0' : 'h-auto opacity-100',
          )}
        >
          {t('nav.adminSection')}
        </p>

        <div className='space-y-1'>
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              label={t(link.labelKey)}
              icon={link.icon}
              collapsed={collapsed}
              active={location.pathname.startsWith(link.to)}
            />
          ))}
        </div>

        <div className='my-4 border-t border-sidebar-border' />
      </nav>

      {/* Toggle button */}
      <div className='border-t border-sidebar-border p-2'>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className='flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          title={collapsed ? t('common.expandSidebar') : t('common.collapseSidebar')}
        >
          <ChevronLeft
            className={cn('h-4 w-4 shrink-0 transition-transform duration-300', collapsed ? 'rotate-180' : 'rotate-0')}
          />
        </button>
      </div>
    </aside>
  );
}
