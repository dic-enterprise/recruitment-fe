import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar.tsx';
import { UserMenu } from './UserMenu';
import { useState } from 'react';
import { cn } from '../lib/utils.ts';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <AppSidebar setCollapsed={setCollapsed} collapsed={collapsed} />

      <main
        className={cn(
          'flex flex-1 flex-col overflow-y-auto transition-all duration-300',
          collapsed ? 'ml-16' : 'ml-64',
        )}
      >
        <div className='sticky top-0 z-10 flex items-center justify-end border-b border-border bg-background/95 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:px-8'>
          <UserMenu />
        </div>
        <div className='flex-1 p-6 lg:p-8'>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
