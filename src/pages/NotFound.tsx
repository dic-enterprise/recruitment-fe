import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import PublicPageLayout from '@/shared/components/public/PublicPageLayout';

const NotFound = () => {
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <PublicPageLayout mainClassName='flex items-center justify-center p-4'>
      <div className='text-center animate-slide-up'>
        <p className='text-7xl font-bold text-primary/20'>404</p>
        <h1 className='mt-2 text-2xl font-bold text-foreground'>{t('notFound.title')}</h1>
        <p className='mt-2 text-muted-foreground'>{t('notFound.message')}</p>
        <Button asChild className='mt-6'>
          <Link to='/'>{t('notFound.backHome')}</Link>
        </Button>
      </div>
    </PublicPageLayout>
  );
};

export default NotFound;
