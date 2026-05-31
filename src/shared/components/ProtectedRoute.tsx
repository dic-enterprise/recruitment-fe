import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/shared/context/auth-context';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center bg-background'>
        <div className='flex items-center gap-2 text-muted-foreground'>
          <Loader2 className='h-5 w-5 animate-spin' />
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (user?.role !== 'ADMIN') {
    return <Navigate to='/hr/dashboard' replace />;
  }

  return <>{children}</>;
}
