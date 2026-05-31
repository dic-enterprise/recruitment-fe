import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar.tsx';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useState } from 'react';
import { cn } from '../lib/utils.ts';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <AppSidebar setCollapsed={setCollapsed} collapsed={collapsed} />

      <main
        className={cn(
          'flex flex-1 flex-col overflow-y-auto p-6 transition-all duration-300 lg:p-8',
          collapsed ? 'ml-16' : 'ml-64',
        )}
      >
        <div className='mb-4 flex justify-end'>
          <LanguageSwitcher />
        </div>
        <Outlet />
      </main>
    </div>
  );
}
