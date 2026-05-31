import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';
import { setAppLocale, SUPPORTED_LOCALES, type AppLocale } from '@/shared/i18n';

const LOCALE_LABEL_KEYS: Record<AppLocale, 'common.vietnamese' | 'common.english' | 'common.traditionalChinese'> = {
  vi: 'common.vietnamese',
  en: 'common.english',
  'zh-TW': 'common.traditionalChinese',
};

function useCurrentLocale(): AppLocale {
  const { i18n } = useTranslation();
  return (SUPPORTED_LOCALES.includes(i18n.language as AppLocale) ? i18n.language : 'vi') as AppLocale;
}

export function LanguageMenuItems() {
  const { t } = useTranslation();
  const current = useCurrentLocale();

  return (
    <>
      <DropdownMenuLabel className='text-xs text-muted-foreground'>{t('common.language')}</DropdownMenuLabel>
      {SUPPORTED_LOCALES.map((locale) => (
        <DropdownMenuItem
          key={locale}
          onClick={() => setAppLocale(locale)}
          className={current === locale ? 'font-medium' : ''}
        >
          {t(LOCALE_LABEL_KEYS[locale])}
        </DropdownMenuItem>
      ))}
    </>
  );
}

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const current = useCurrentLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='sm' className='gap-2 text-muted-foreground'>
          <Languages className='h-4 w-4' />
          <span className='hidden sm:inline'>{t(LOCALE_LABEL_KEYS[current])}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <LanguageMenuItems />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
