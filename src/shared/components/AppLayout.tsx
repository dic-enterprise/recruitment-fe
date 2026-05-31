import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar.tsx';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useState } from 'react';
import { cn } from '../lib/utils.ts';
import { useAuth } from '@/shared/context/auth-context';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { LogOut } from 'lucide-react';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <AppSidebar setCollapsed={setCollapsed} collapsed={collapsed} />

      <main
        className={cn(
          'flex flex-1 flex-col overflow-y-auto p-6 transition-all duration-300 lg:p-8',
          collapsed ? 'ml-16' : 'ml-64',
        )}
      >
        <div className='mb-4 flex items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            {user && (
              <>
                <span className='text-sm font-medium'>{user.displayName}</span>
                <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className='text-xs'>
                  {user.role === 'ADMIN' ? t('users.roleAdmin') : t('users.roleHr')}
                </Badge>
              </>
            )}
          </div>
          <div className='flex items-center gap-2'>
            <LanguageSwitcher />
            <Button variant='outline' size='sm' onClick={logout}>
              <LogOut className='mr-1.5 h-3.5 w-3.5' />
              {t('auth.logout')}
            </Button>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
