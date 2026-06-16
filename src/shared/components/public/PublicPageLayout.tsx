import type { ReactNode } from 'react';
import PublicSiteHeader from './PublicSiteHeader';
import PublicSiteFooter from './PublicSiteFooter';
import { cn } from '@/shared/lib/utils';

interface PublicPageLayoutProps {
  children: ReactNode;
  className?: string;
  mainClassName?: string;
}

export default function PublicPageLayout({ children, className, mainClassName }: PublicPageLayoutProps) {
  return (
    <div className={cn('flex min-h-[100dvh] flex-col bg-background', className)}>
      <PublicSiteHeader />
      <main className={cn('flex-1 animate-fade-in', mainClassName)}>{children}</main>
      <PublicSiteFooter />
    </div>
  );
}
