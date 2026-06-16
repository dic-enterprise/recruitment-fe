import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import { cn } from '@/shared/lib/utils';

interface PublicSiteHeaderProps {
  className?: string;
}

export default function PublicSiteHeader({ className }: PublicSiteHeaderProps) {
  const { t } = useTranslation();

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75',
        className,
      )}
    >
      <div className='container flex h-16 items-center justify-between gap-4'>
        <Link to='/' className='group flex items-center gap-2.5'>
          <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground'>
            A
          </span>
          <span className='text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary'>
            {t('landing.brandName')}
          </span>
        </Link>

        <nav className='hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex'>
          <a href='/#about-us' className='transition-colors hover:text-foreground'>
            {t('landing.aboutUs')}
          </a>
          <a href='/#career-opportunities' className='transition-colors hover:text-foreground'>
            {t('landing.careerOpportunities')}
          </a>
        </nav>

        <div className='flex items-center gap-2'>
          <LanguageSwitcher />
          <Button asChild size='sm' className='hidden sm:inline-flex'>
            <Link to='/login'>{t('landing.loginAsAcctonUser')}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
