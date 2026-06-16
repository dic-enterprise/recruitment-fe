import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function PublicSiteFooter() {
  const { t } = useTranslation();

  return (
    <footer className='border-t border-border bg-card'>
      <div className='container py-10'>
        <div className='grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]'>
          <div className='space-y-3'>
            <p className='text-lg font-semibold text-foreground'>{t('public.companyName')}</p>
            <p className='max-w-sm text-sm leading-relaxed text-muted-foreground'>{t('landing.footerTagline')}</p>
          </div>
          <div className='space-y-3'>
            <p className='text-sm font-semibold text-foreground'>{t('landing.footerExplore')}</p>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              <li>
                <a href='/#about-us' className='transition-colors hover:text-foreground'>
                  {t('landing.aboutUs')}
                </a>
              </li>
              <li>
                <Link to='/public/jobs' className='transition-colors hover:text-foreground'>
                  {t('landing.careerOpportunities')}
                </Link>
              </li>
            </ul>
          </div>
          <div className='space-y-3'>
            <p className='text-sm font-semibold text-foreground'>{t('landing.footerForEmployees')}</p>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              <li>
                <Link to='/login' className='transition-colors hover:text-foreground'>
                  {t('landing.footerHrLogin')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className='mt-8 border-t border-border pt-6 text-xs text-muted-foreground'>
          {t('landing.footerCopyright', { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
}
