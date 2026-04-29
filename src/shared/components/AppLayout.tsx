import { ReactNode } from 'react';
import AppSidebar from './AppSidebar.tsx';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <AppSidebar />
      <main className='ml-64 flex flex-1 flex-col overflow-hidden p-6 lg:p-8'>
        {children}
      </main>
    </div>
  );
}
